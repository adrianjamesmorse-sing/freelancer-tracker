import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

export async function projectsDelete(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    const result = await query('delete from projects where id = $1 returning id', [id])

    if (result.rowCount === 0) {
      return error(404, 'Project not found')
    }

    return json(200, { id })
  } catch (err) {
    context.error(err)
    return error(500, 'Failed to delete project', err instanceof Error ? err.message : String(err))
  }
}

app.http('projects-delete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{id}',
  handler: projectsDelete,
})