import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('projects-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: async (_request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
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