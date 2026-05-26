import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

export async function allocationsGet(_request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
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