import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('allocations-post', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'allocations',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = await request.json() as Record<string, unknown>
      const freelancerId = String(body.freelancerId ?? '').trim()
      const projectId = String(body.projectId ?? '').trim()
      const contractStartDate = String(body.contractStartDate ?? '').trim()
      const contractEndDate = String(body.contractEndDate ?? '').trim()
      if (!freelancerId || !projectId || !contractStartDate || !contractEndDate) {
        return error(400, 'freelancerId, projectId, contractStartDate and contractEndDate are required')
      }

      const result = await query(
        `
        insert into allocations (
          freelancer_id, project_id, contract_start_date, contract_end_date,
          number_of_days, daily_rate, daily_rate_currency, daily_rate_note,
          role_within_project, owner_manager_name, owner_manager_email, allocation_status
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        returning id, created_at, freelancer_id, project_id, contract_start_date, contract_end_date,
                  number_of_days, daily_rate, daily_rate_currency, daily_rate_note,
                  role_within_project, owner_manager_name, owner_manager_email, allocation_status
        `,
        [
          freelancerId,
          projectId,
          contractStartDate,
          contractEndDate,
          nullableNumber(body.numberOfDays),
          nullableNumber(body.dailyRate),
          nullableString(body.dailyRateCurrency),
          nullableString(body.dailyRateNote),
          nullableString(body.roleWithinProject),
          nullableString(body.ownerManagerName),
          nullableString(body.ownerManagerEmail),
          nullableString(body.allocationStatus) ?? 'Active',
        ],
      )

      return json(201, result.rows[0])
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to create allocation', err instanceof Error ? err.message : String(err))
    }
  },
})

function nullableString(value: unknown): string | null {
  const text = String(value ?? '').trim()
  return text ? text : null
}

function nullableNumber(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}