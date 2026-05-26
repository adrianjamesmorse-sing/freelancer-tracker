import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

export async function freelancersUpdate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const id = request.params.id
    const body = await request.json() as Record<string, unknown>

    const result = await query(
      `
      update freelancers
      set
        freelancer_name = $2,
        personal_email = $3,
        phone_number = $4,
        address = $5,
        country = $6,
        freelancer_status = $7,
        registration_number = $8,
        question_flag = $9,
        comments = $10
      where id = $1
      returning *
      `,
      [
        id,
        body.freelancerName ?? null,
        body.personalEmail ?? null,
        body.phoneNumber ?? null,
        body.address ?? null,
        body.country ?? null,
        body.freelancerStatus ?? 'Active',
        Boolean(body.registrationNumber),
        Boolean(body.questionFlag),
        body.comments ?? null,
      ],
    )

    if (result.rowCount === 0) {
      return error(404, 'Freelancer not found')
    }

    return json(200, result.rows[0])
  } catch (err) {
    context.error(err)
    return error(500, 'Failed to update freelancer', err instanceof Error ? err.message : String(err))
  }
}

app.http('freelancers-update', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'freelancers/{id}',
  handler: freelancersUpdate,
})