import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('projects-put', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
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
      const projectName = String(body.projectName ?? '').trim()
      if (!projectName) return error(400, 'projectName is required')

      const result = await query(
        `
        update projects
        set project_name = $2,
            entity = $3,
            project_manager_name = $4,
            project_manager_email = $5
        where id = $1
        returning id, project_name, entity, project_manager_name, project_manager_email
        `,
        [
          id,
          projectName,
          nullableString(body.entity) ?? 'Unspecified',
          nullableString(body.projectManagerName) ?? '',
          nullableString(body.projectManagerEmail) ?? '',
        ],
      )

      if (!result.rows.length) return error(404, 'Project not found')
      return json(200, result.rows[0])
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to update project', err instanceof Error ? err.message : String(err))
    }
  },
})

function nullableString(value: unknown): string | null {
  const text = String(value ?? '').trim()
  return text ? text : null
}