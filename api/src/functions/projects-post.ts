import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('projects-post', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = await request.json() as Record<string, unknown>
      const projectName = String(body.projectName ?? '').trim()
      if (!projectName) return error(400, 'projectName is required')

      const result = await query(
        `
        insert into projects (project_name, entity, project_manager_name, project_manager_email)
        values ($1,$2,$3,$4)
        returning id, project_name, entity, project_manager_name, project_manager_email
        `,
        [
          projectName,
          nullableString(body.entity) ?? 'Unspecified',
          nullableString(body.projectManagerName) ?? '',
          nullableString(body.projectManagerEmail) ?? '',
        ],
      )

      return json(201, result.rows[0])
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to create project', err instanceof Error ? err.message : String(err))
    }
  },
})

function nullableString(value: unknown): string | null {
  const text = String(value ?? '').trim()
  return text ? text : null
}