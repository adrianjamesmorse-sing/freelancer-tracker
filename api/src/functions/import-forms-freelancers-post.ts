import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { getPool } from '../lib/db.js'
import { error, json } from '../lib/response.js'
import { decodeWindows1252Base64, normalizeKey, parseFormsCsv } from '../lib/formsCsv.js'

type ImportSummary = {
  fileName: string
  processedRows: number
  addedFreelancers: number
  updatedFreelancers: number
  addedProjects: number
  updatedProjects: number
  addedAllocations: number
  skippedAllocations: number
  errors: string[]
  importedAt: string
}

app.http('import-forms-freelancers-post', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'imports/forms-freelancers',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const pool = getPool()
    const client = await pool.connect()

    try {
      const body = await request.json() as { fileName?: string; csvText?: string; csvBase64?: string }
      const csvText = body.csvText?.trim() || (body.csvBase64 ? decodeWindows1252Base64(body.csvBase64) : '')
      if (!csvText) return error(400, 'csvText or csvBase64 is required')

      const rows = parseFormsCsv(csvText)
      const summary: ImportSummary = {
        fileName: body.fileName || 'forms-import.csv',
        processedRows: rows.length,
        addedFreelancers: 0,
        updatedFreelancers: 0,
        addedProjects: 0,
        updatedProjects: 0,
        addedAllocations: 0,
        skippedAllocations: 0,
        errors: [],
        importedAt: new Date().toISOString(),
      }

      await client.query('begin')

      for (const row of rows) {
        try {
          if (!row.freelancerName || !row.projectName) {
            summary.errors.push(`Skipped row ${row.sourceRowId ?? '?'}: missing freelancerName or projectName`)
            continue
          }

          const freelancer = await upsertFreelancer(client, row, summary)
          const project = await upsertProject(client, row, summary)
          await upsertAllocation(client, row, freelancer.id, project.id, summary)
        } catch (err) {
          summary.errors.push(err instanceof Error ? err.message : String(err))
        }
      }

      await client.query('commit')
      return json(200, summary)
    } catch (err) {
      await client.query('rollback')
      context.error(err)
      return error(500, 'Failed to import forms CSV', err instanceof Error ? err.message : String(err))
    } finally {
      client.release()
    }
  },
})

async function upsertFreelancer(client: any, row: any, summary: ImportSummary) {
  const existing = await client.query(
    `
    select id
    from freelancers
    where lower(trim(freelancer_name)) = lower(trim($1))
      and coalesce(lower(trim(personal_email)), '') = coalesce(lower(trim($2)), '')
    limit 1
    `,
    [row.freelancerName, row.personalEmail ?? ''],
  )

  if (existing.rows[0]) {
    const updated = await client.query(
      `
      update freelancers
      set phone_number = coalesce($2, phone_number),
          address = coalesce($3, address),
          country = coalesce($4, country),
          freelancer_status = coalesce($5, freelancer_status),
          registration_number = coalesce($6, registration_number),
          question_flag = coalesce($7, question_flag),
          comments = coalesce($8, comments)
      where id = $1
      returning id
      `,
      [
        existing.rows[0].id,
        row.phoneNumber ?? null,
        row.address ?? null,
        row.country ?? null,
        deriveFreelancerStatus(row.contractEndDate, row.questionFlag),
        row.registrationNumber ?? null,
        row.questionFlag ?? null,
        row.comments ?? null,
      ],
    )
    summary.updatedFreelancers += 1
    return updated.rows[0]
  }

  const inserted = await client.query(
    `
    insert into freelancers (
      freelancer_name, personal_email, phone_number, address, country,
      freelancer_status, registration_number, question_flag, comments
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    returning id
    `,
    [
      row.freelancerName,
      row.personalEmail ?? null,
      row.phoneNumber ?? null,
      row.address ?? null,
      row.country ?? null,
      deriveFreelancerStatus(row.contractEndDate, row.questionFlag),
      row.registrationNumber ?? false,
      row.questionFlag ?? false,
      row.comments ?? null,
    ],
  )
  summary.addedFreelancers += 1
  return inserted.rows[0]
}

async function upsertProject(client: any, row: any, summary: ImportSummary) {
  const existing = await client.query(
    `
    select id
    from projects
    where lower(trim(project_name)) = lower(trim($1))
      and lower(trim(entity)) = lower(trim($2))
    limit 1
    `,
    [row.projectName, row.entity ?? 'Unspecified'],
  )

  if (existing.rows[0]) {
    const updated = await client.query(
      `
      update projects
      set project_manager_name = coalesce($2, project_manager_name),
          project_manager_email = coalesce($3, project_manager_email),
          start_date = coalesce($4, start_date),
          end_date = coalesce($5, end_date),
          status = coalesce($6, status)
      where id = $1
      returning id
      `,
      [
        existing.rows[0].id,
        row.projectManagerName ?? null,
        row.projectManagerEmail ?? null,
        row.contractStartDate ?? null,
        row.contractEndDate ?? null,
        deriveProjectStatus(row.contractEndDate),
      ],
    )
    summary.updatedProjects += 1
    return updated.rows[0]
  }

  const inserted = await client.query(
    `
    insert into projects (
      project_name, entity, project_manager_name, project_manager_email, status, start_date, end_date
    ) values ($1,$2,$3,$4,$5,$6,$7)
    returning id
    `,
    [
      row.projectName,
      row.entity ?? 'Unspecified',
      row.projectManagerName ?? '',
      row.projectManagerEmail ?? '',
      deriveProjectStatus(row.contractEndDate),
      row.contractStartDate ?? null,
      row.contractEndDate ?? null,
    ],
  )
  summary.addedProjects += 1
  return inserted.rows[0]
}

async function upsertAllocation(client: any, row: any, freelancerId: string, projectId: string, summary: ImportSummary) {
  const sourceKey = normalizeKey(row.sourceRowId)
  const duplicate = await client.query(
    `
    select id
    from allocations
    where (
      $1 <> '' and coalesce(daily_rate_note, '') like $2
    ) or (
      freelancer_id = $3
      and project_id = $4
      and contract_start_date = $5
      and contract_end_date = $6
      and coalesce(role_within_project, '') = coalesce($7, '')
    )
    limit 1
    `,
    [
      sourceKey,
      `%sourceRowId:${row.sourceRowId}%`,
      freelancerId,
      projectId,
      row.contractStartDate ?? null,
      row.contractEndDate ?? null,
      row.roleWithinProject ?? '',
    ],
  )

  if (duplicate.rows[0]) {
    summary.skippedAllocations += 1
    return duplicate.rows[0]
  }

  await client.query(
    `
    insert into allocations (
      freelancer_id, project_id, contract_start_date, contract_end_date,
      number_of_days, daily_rate, daily_rate_currency, daily_rate_note,
      role_within_project, owner_manager_name, owner_manager_email, allocation_status
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `,
    [
      freelancerId,
      projectId,
      row.contractStartDate ?? null,
      row.contractEndDate ?? null,
      row.numberOfDays ?? null,
      row.dailyRate ?? null,
      row.dailyRateCurrency ?? 'EUR',
      buildAllocationNote(row.dailyRateNote, row.sourceRowId),
      row.roleWithinProject ?? null,
      row.projectManagerName ?? null,
      row.projectManagerEmail ?? null,
      deriveAllocationStatus(row.contractEndDate, row.questionFlag),
    ],
  )

  summary.addedAllocations += 1
}

function buildAllocationNote(note?: string, sourceRowId?: string): string | null {
  const parts = [note, sourceRowId ? `sourceRowId:${sourceRowId}` : ''].filter(Boolean)
  return parts.length ? parts.join(' | ') : null
}

function deriveProjectStatus(contractEndDate?: string): string {
  if (!contractEndDate) return 'Active'
  return new Date(contractEndDate).getTime() >= Date.now() ? 'Active' : 'Ended'
}

function deriveAllocationStatus(contractEndDate?: string, questionFlag?: boolean): string {
  if (questionFlag) return 'Extended pending close'
  if (!contractEndDate) return 'Active'
  return new Date(contractEndDate).getTime() >= Date.now() ? 'Active' : 'Closed'
}

function deriveFreelancerStatus(contractEndDate?: string, questionFlag?: boolean): string {
  if (questionFlag) return 'Open follow-up'
  if (!contractEndDate) return 'Active'
  const days = Math.ceil((new Date(contractEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'Inactive'
  if (days <= 7) return 'Ending soon'
  return 'Active'
}