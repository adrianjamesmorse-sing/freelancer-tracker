import { query } from './db.js'

type ImportInput = {
  fileName?: string
  csvText?: string
  csvBase64?: string
}

type CanonicalRow = {
  id?: string
  startTime?: string
  endTime?: string
  submitterEmail?: string
  submitterName?: string
  projectManagerName?: string
  freelancerName?: string
  projectName?: string
  entity?: string
  contractStartDate?: string
  contractEndDate?: string
  numberOfDays?: string
  dailyRateNote?: string
  dailyRateCurrency?: string
  roleWithinProject?: string
  registrationNumber?: string
  freelancerEmail?: string
  phoneNumber?: string
  questionFlag?: string
  comments?: string
}

type ImportSummary = {
  fileName: string | null
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

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .replace(/\u00A0/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '')
}

const headerAliases: Record<string, keyof CanonicalRow> = {
  id: 'id',
  starttime: 'startTime',
  endtime: 'endTime',
  emailaddress: 'submitterEmail',
  name: 'submitterName',
  yourname: 'projectManagerName',
  completenameofthefreelanceregantoinedupont: 'freelancerName',
  freelancername: 'freelancerName',
  nameoftheprojectegddemkcapitalpeach: 'projectName',
  projectname: 'projectName',
  onwhichentityisthisprojectbilled: 'entity',
  startingdateoftheproject: 'contractStartDate',
  enddateoftheproject: 'contractEndDate',
  numberofdaysthefreelancerwillworkontheproject: 'numberOfDays',
  dailyratewiththecurrencyeg1000: 'dailyRateNote',
  whichcurrencyforthedailyrate: 'dailyRateCurrency',
  rolewithintheprojectmanagerseniorconsultantetc: 'roleWithinProject',
  hasthisfreelanceralreadybeenregisteredwitharegistrationnumber: 'registrationNumber',
  freelancersemailadress: 'freelancerEmail',
  freelanceremailaddress: 'freelancerEmail',
  freelancerphonenumber: 'phoneNumber',
  question: 'questionFlag',
  anycomments: 'comments',
}

function decodeInput(input: ImportInput): string {
  if (input.csvText) return input.csvText

  if (!input.csvBase64) {
    throw new Error('csvText or csvBase64 is required')
  }

  return Buffer.from(input.csvBase64, 'base64').toString('utf8')
}

function detectDelimiter(text: string): ',' | ';' {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const commaCount = (firstLine.match(/,/g) ?? []).length
  const semicolonCount = (firstLine.match(/;/g) ?? []).length
  return semicolonCount > commaCount ? ';' : ','
}

function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(field)
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      field = ''
      continue
    }

    field += char
  }

  row.push(field)
  if (row.some((cell) => cell.trim() !== '')) rows.push(row)

  return rows
}

function toCanonicalRows(text: string): CanonicalRow[] {
  const delimiter = detectDelimiter(text)
  const rows = parseCsv(text, delimiter)
  if (rows.length === 0) return []

  const headerRow = rows[0]
  const headers = headerRow.map((header) => headerAliases[normalizeHeader(header)] ?? null)

  return rows.slice(1).map((row) => {
    const out: CanonicalRow = {}
    for (let i = 0; i < headers.length; i += 1) {
      const key = headers[i]
      if (!key) continue
      out[key] = (row[i] ?? '').trim()
    }
    return out
  })
}

function parseBool(value?: string): boolean {
  const v = (value ?? '').trim().toLowerCase()
  return ['yes', 'true', 'y', '1'].includes(v)
}

function parseDate(value?: string): string | null {
  if (!value) return null
  const v = value.trim()
  if (!v) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v

  const slash = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) {
    const month = slash[1].padStart(2, '0')
    const day = slash[2].padStart(2, '0')
    return `${slash[3]}-${month}-${day}`
  }

  return null
}

function parseNumberOfDays(value?: string): number | null {
  if (!value) return null
  const match = value.match(/(\d+(\.\d+)?)/)
  return match ? Math.round(Number(match[1])) : null
}

function parseDailyRate(value?: string): number | null {
  if (!value) return null
  const cleaned = value.replace(',', '.').replace(/[^0-9.]+/g, '')
  if (!cleaned) return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}

function cleanEntity(value?: string): string {
  const v = (value ?? '').trim()
  if (!v || ['yes', 'no'].includes(v.toLowerCase())) return 'Unspecified'
  return v
}

export async function importFormsFreelancers(input: ImportInput): Promise<ImportSummary> {
  const text = decodeInput(input)
  const rows = toCanonicalRows(text)

  const result: ImportSummary = {
    fileName: input.fileName ?? null,
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

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowNumber = i + 2

    const freelancerName = (row.freelancerName ?? '').trim()
    const projectName = (row.projectName ?? '').trim()

    if (!freelancerName || !projectName) {
      result.errors.push(`Skipped row ${rowNumber}: missing freelancerName or projectName`)
      continue
    }

    const startDate = parseDate(row.contractStartDate)
    const endDate = parseDate(row.contractEndDate)

    if (!startDate || !endDate) {
      result.errors.push(`Skipped row ${rowNumber}: missing or invalid start/end date`)
      continue
    }

    const freelancerEmail = (row.freelancerEmail ?? '').trim() || null
    const phoneNumber = (row.phoneNumber ?? '').trim() || null
    const comments = (row.comments ?? '').trim() || null
    const registrationNumber = parseBool(row.registrationNumber)
    const questionFlag = parseBool(row.questionFlag)

    let freelancerId: string
    const freelancerLookup = freelancerEmail
      ? await query<{ id: string }>(
          `select id
           from freelancers
           where lower(freelancer_name) = lower($1)
             and lower(coalesce(personal_email, '')) = lower($2)
           limit 1`,
          [freelancerName, freelancerEmail],
        )
      : await query<{ id: string }>(
          `select id
           from freelancers
           where lower(freelancer_name) = lower($1)
           limit 1`,
          [freelancerName],
        )

    if (freelancerLookup.rows.length > 0) {
      freelancerId = freelancerLookup.rows[0].id
      await query(
        `update freelancers
         set personal_email = $2,
             phone_number = $3,
             freelancer_status = $4,
             registration_number = $5,
             question_flag = $6,
             comments = $7
         where id = $1`,
        [
          freelancerId,
          freelancerEmail,
          phoneNumber,
          'Active',
          registrationNumber,
          questionFlag,
          comments,
        ],
      )
      result.updatedFreelancers += 1
    } else {
      const insertedFreelancer = await query<{ id: string }>(
        `insert into freelancers (
           freelancer_name,
           personal_email,
           phone_number,
           address,
           country,
           freelancer_status,
           registration_number,
           question_flag,
           comments
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         returning id`,
        [
          freelancerName,
          freelancerEmail,
          phoneNumber,
          null,
          null,
          'Active',
          registrationNumber,
          questionFlag,
          comments,
        ],
      )
      freelancerId = insertedFreelancer.rows[0].id
      result.addedFreelancers += 1
    }

    const entity = cleanEntity(row.entity)
    const projectManagerName = (row.projectManagerName ?? '').trim() || 'Unknown'
    const projectManagerEmail = (row.submitterEmail ?? '').trim() || 'unknown@singulier.co'
    const status = new Date(endDate) < new Date() ? 'Ended' : 'Active'

    let projectId: string
    const projectLookup = await query<{ id: string }>(
      `select id
       from projects
       where lower(project_name) = lower($1)
         and lower(entity) = lower($2)
       limit 1`,
      [projectName, entity],
    )

    if (projectLookup.rows.length > 0) {
      projectId = projectLookup.rows[0].id
      await query(
        `update projects
         set project_manager_name = $2,
             project_manager_email = $3,
             status = $4,
             start_date = $5,
             end_date = $6
         where id = $1`,
        [projectId, projectManagerName, projectManagerEmail, status, startDate, endDate],
      )
      result.updatedProjects += 1
    } else {
      const insertedProject = await query<{ id: string }>(
        `insert into projects (
           project_name,
           entity,
           project_manager_name,
           project_manager_email,
           status,
           start_date,
           end_date
         ) values ($1,$2,$3,$4,$5,$6,$7)
         returning id`,
        [projectName, entity, projectManagerName, projectManagerEmail, status, startDate, endDate],
      )
      projectId = insertedProject.rows[0].id
      result.addedProjects += 1
    }

    const roleWithinProject = (row.roleWithinProject ?? '').trim() || null
    const numberOfDays = parseNumberOfDays(row.numberOfDays)
    const dailyRate = parseDailyRate(row.dailyRateNote)
    const dailyRateCurrency = (row.dailyRateCurrency ?? '').trim() || null
    const dailyRateNote = (row.dailyRateNote ?? '').trim() || null

    const allocationLookup = await query<{ id: string }>(
      `select id
       from allocations
       where freelancer_id = $1
         and project_id = $2
         and contract_start_date = $3
         and contract_end_date = $4
         and coalesce(role_within_project, '') = coalesce($5, '')
       limit 1`,
      [freelancerId, projectId, startDate, endDate, roleWithinProject],
    )

    if (allocationLookup.rows.length > 0) {
      result.skippedAllocations += 1
      continue
    }

    await query(
      `insert into allocations (
         freelancer_id,
         project_id,
         contract_start_date,
         contract_end_date,
         number_of_days,
         daily_rate,
         daily_rate_currency,
         daily_rate_note,
         role_within_project,
         owner_manager_name,
         owner_manager_email,
         allocation_status
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        freelancerId,
        projectId,
        startDate,
        endDate,
        numberOfDays,
        dailyRate,
        dailyRateCurrency,
        dailyRateNote,
        roleWithinProject,
        projectManagerName,
        projectManagerEmail,
        'Active',
      ],
    )
    result.addedAllocations += 1
  }

  return result
}
