import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('freelancers-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelancers',
  handler: async (_request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
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