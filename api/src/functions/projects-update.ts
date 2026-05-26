import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

export async function projectsUpdate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    const body = await request.json() as Record<string, unknown>

    const result = await query(
      `
      update projects
      set
        project_name = $2,
        entity = $3,
        project_manager_name = $4,
        project_manager_email = $5,
        status = $6,
        start_date = $7,
        end_date = $8
      where id = $1
      returning *
      `,
      [
        id,
        body.projectName ?? null,
        body.entity ?? null,
        body.projectManagerName ?? null,
        body.projectManagerEmail ?? null,
        body.status ?? 'Active',
        body.startDate ?? null,
        body.endDate ?? null,
      ],
    )

    if (result.rowCount === 0) {
      return error(404, 'Project not found')
    }

    return json(200, result.rows[0])
  } catch (err) {
    context.error(err)
    return error(500, 'Failed to update project', err instanceof Error ? err.message : String(err))
  }
}

app.http('projects-update', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
  handler: projectsUpdate,
})