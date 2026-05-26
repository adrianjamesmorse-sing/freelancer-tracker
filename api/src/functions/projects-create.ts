import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

export async function projectsCreate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as Record<string, unknown>
    const projectName = String(body.projectName ?? '').trim()
    const entity = String(body.entity ?? '').trim()
    const projectManagerName = String(body.projectManagerName ?? '').trim()
    const projectManagerEmail = String(body.projectManagerEmail ?? '').trim()

    if (!projectName || !entity || !projectManagerName || !projectManagerEmail) {
      return error(400, 'projectName, entity, projectManagerName and projectManagerEmail are required')
    }

    const result = await query(
      `
      insert into projects (
        project_name,
        entity,
        project_manager_name,
        project_manager_email,
        status,
        start_date,
        end_date
      ) values ($1,$2,$3,$4,$5,$6,$7)
      returning *
      `,
      [
        projectName,
        entity,
        projectManagerName,
        projectManagerEmail,
        body.status ?? 'Active',
        body.startDate ?? null,
        body.endDate ?? null,
      ],
    )

    return json(201, result.rows[0])
  } catch (err) {
    context.error(err)
    return error(500, 'Failed to create project', err instanceof Error ? err.message : String(err))
  }
}

app.http('projects-create', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: projectsCreate,
})