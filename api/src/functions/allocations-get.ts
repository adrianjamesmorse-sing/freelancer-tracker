import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

export async function allocationsGet(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    if (isAuthConfigured()) {
      try {
        const user = await authenticateRequest(request)
        if (!user || !hasRole(user, ['viewer', 'editor', 'admin'])) {
          return error(401, 'Unauthorized')
        }

        if (hasRole(user, ['editor', 'admin'])) {
          const result = await query(
            `
            select *
            from allocations
            order by created_at desc
            `,
          )
          return json(200, result.rows)
        }

        // viewer: only allocations they own or manage
        const result = await query(
          `
          select a.*
          from allocations a
          left join freelancers f on f.id = a.freelancer_id
          where a.owner_manager_email = $1 or f.personal_email = $1
          order by a.created_at desc
          `,
          [user.email],
        )

        return json(200, result.rows)
      } catch (err) {
        context.error(err)
        return error(401, 'Unauthorized')
      }
    }

    const result = await query(
      `
      select *
      from allocations
      order by created_at desc
      `,
    )

    return json(200, result.rows)
  } catch (err) {
    context.error(err)
    return error(500, 'Failed to load allocations', err instanceof Error ? err.message : String(err))
  }
}

app.http('allocations-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'allocations',
  handler: allocationsGet,
})