import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('allocations-put', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'allocations/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      if (isAuthConfigured()) {
        const user = await authenticateRequest(request)
        if (!user || !hasRole(user, ['editor', 'admin'])) {
          return error(401, 'Unauthorized')
        }
      }
      const id = request.params.id
      if (!id) return error(400, 'id is required')
      const body = await request.json() as Record<string, unknown>
      const result = await query(
        `
        update allocations
        set freelancer_id = $2,
            project_id = $3,
            contract_start_date = $4,
            contract_end_date = $5,
            number_of_days = $6,
            daily_rate = $7,
            daily_rate_currency = $8,
            daily_rate_note = $9,
            role_within_project = $10,
            owner_manager_name = $11,
            owner_manager_email = $12,
            allocation_status = $13
        where id = $1
        returning id, created_at, freelancer_id, project_id, contract_start_date, contract_end_date,
                  number_of_days, daily_rate, daily_rate_currency, daily_rate_note,
                  role_within_project, owner_manager_name, owner_manager_email, allocation_status
        `,
        [
          id,
          String(body.freelancerId ?? '').trim(),
          String(body.projectId ?? '').trim(),
          String(body.contractStartDate ?? '').trim(),
          String(body.contractEndDate ?? '').trim(),
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
      if (!result.rows.length) return error(404, 'Allocation not found')
      return json(200, result.rows[0])
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to update allocation', err instanceof Error ? err.message : String(err))
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