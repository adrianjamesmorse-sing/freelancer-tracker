import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('freelancers-put', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'freelancers/{id}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const id = request.params.id
      if (!id) return error(400, 'id is required')

      const body = await request.json() as Record<string, unknown>
      const freelancerName = String(body.freelancerName ?? '').trim()
      if (!freelancerName) return error(400, 'freelancerName is required')

      const result = await query(
        `
        update freelancers
        set freelancer_name = $2,
            personal_email = $3,
            phone_number = $4,
            address = $5,
            country = $6,
            freelancer_status = $7,
            registration_number = $8,
            question_flag = $9,
            comments = $10
        where id = $1
        returning id, created_at, freelancer_name, personal_email, phone_number, address, country,
                  freelancer_status, registration_number, question_flag, comments
        `,
        [
          id,
          freelancerName,
          nullableString(body.personalEmail),
          nullableString(body.phoneNumber),
          nullableString(body.address),
          nullableString(body.country),
          nullableString(body.freelancerStatus) ?? 'Active',
          Boolean(body.registrationNumber),
          Boolean(body.questionFlag),
          nullableString(body.comments),
        ],
      )

      if (!result.rows.length) return error(404, 'Freelancer not found')
      return json(200, result.rows[0])
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to update freelancer', err instanceof Error ? err.message : String(err))
    }
  },
})

function nullableString(value: unknown): string | null {
  const text = String(value ?? '').trim()
  return text ? text : null
}