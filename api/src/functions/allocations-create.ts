import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

export async function allocationsCreate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    if (isAuthConfigured()) {
      const user = await authenticateRequest(request)
      if (!user || !hasRole(user, ['editor', 'admin'])) {
        return error(401, 'Unauthorized')
      }
    }

    const body = await request.json() as Record<string, unknown>

    const result = await query(
      `
      insert into allocations (
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
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      returning *
      `,
      [
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

    return json(201, result.rows[0])
  } catch (err) {
    context.error(err)
    return error(500, 'Failed to create allocation', err instanceof Error ? err.message : String(err))
  }
}

app.http('allocations-create', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'allocations',
  handler: allocationsCreate,
})