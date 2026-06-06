import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('projects-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
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
              select id, project_name, entity, project_manager_name, project_manager_email
              from projects
              order by project_name asc
              `,
            )
            return json(200, result.rows)
          }

          // viewer: restrict to projects they manage or own allocations for
          const result = await query(
            `
            select distinct p.id, p.project_name, p.entity, p.project_manager_name, p.project_manager_email
            from projects p
            left join allocations a on a.project_id = p.id
            where p.project_manager_email = $1 or a.owner_manager_email = $1
            order by p.project_name asc
            `,
            [user.email],
          )

          return json(200, result.rows)
        } catch (err) {
          context.error(err)
          return error(401, 'Unauthorized')
        }
      }

      // auth not configured: return all
      const result = await query(
        `
        select id, project_name, entity, project_manager_name, project_manager_email
        from projects
        order by project_name asc
        `,
      )
      return json(200, result.rows)
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to load projects', err instanceof Error ? err.message : String(err))
    }
  },
})