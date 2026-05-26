import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

export async function allocationsUpdate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    const body = await request.json() as Record<string, unknown>

    const result = await query(
      `
      update allocations
      set
        freelancer_id = $2,
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
      returning *
      `,
      [
        id,
        body.freelancerId,
        body.projectId,
        body.contractStartDate,
        body.contractEndDate,
        body.numberOfDays ?? null,
        body.dailyRate ?? null,
        body.dailyRateCurrency ?? null,
        body.dailyRateNote ?? null,
        body.roleWithinProject ?? null,
        body.ownerManagerName ?? null,
        body.ownerManagerEmail ?? null,
        body.allocationStatus ?? 'Active',
      ],
    )

    if (result.rowCount === 0) {
      return error(404, 'Allocation not found')
    }

    return json(200, result.rows[0])
  } catch (err) {
    context.error(err)
    return error(500, 'Failed to update allocation', err instanceof Error ? err.message : String(err))
  }
}

app.http('allocations-update', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'allocations/{id}',
  handler: allocationsUpdate,
})