import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('freelancers-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelancers',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      if (isAuthConfigured()) {
        try {
          const user = await authenticateRequest(request)
          if (!user || !hasRole(user, ['viewer', 'editor', 'admin'])) {
            return withCorsError(context, 401, 'Unauthorized')
          }

          // Editor/Admin: return full list
          if (hasRole(user, ['editor', 'admin'])) {
            const result = await query(
              `
              select id, created_at, freelancer_name, personal_email, phone_number, address, country,
                     freelancer_status, registration_number, question_flag, comments
              from freelancers
              order by freelancer_name asc
              `,
            )
            return json(200, result.rows)
          }

          // Viewer: restrict to freelancers they manage or own
          const result = await query(
            `
            select distinct f.id, f.created_at, f.freelancer_name, f.personal_email, f.phone_number, f.address, f.country,
                   f.freelancer_status, f.registration_number, f.question_flag, f.comments
            from freelancers f
            left join allocations a on a.freelancer_id = f.id
            where f.personal_email = $1 or a.owner_manager_email = $1
            order by f.freelancer_name asc
            `,
            [user.email],
          )

          return json(200, result.rows)
        } catch (err) {
          context.error(err)
          const message = err instanceof Error ? err.message : 'Unauthorized'
          return error(401, message)
        }
      }

      // Auth not configured — return full list (dev)
      const result = await query(
        `
        select id, created_at, freelancer_name, personal_email, phone_number, address, country,
               freelancer_status, registration_number, question_flag, comments
        from freelancers
        order by freelancer_name asc
        `,
      )
      return json(200, result.rows)
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to load freelancers', err instanceof Error ? err.message : String(err))
    }
  },
})

function withCorsError(context: InvocationContext, status: number, message: string) {
  // mirror response.error but keep context logging
  context.log?.('auth', message)
  return error(status, message)
}