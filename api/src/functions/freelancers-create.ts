import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

export async function freelancersCreate(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as Record<string, unknown>
    const freelancerName = String(body.freelancerName ?? '').trim()

    if (!freelancerName) {
      return error(400, 'freelancerName is required')
    }

    const result = await query(
      `
      insert into freelancers (
        freelancer_name,
        personal_email,
        phone_number,
        address,
        country,
        freelancer_status,
        registration_number,
        question_flag,
        comments
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      returning *
      `,
      [
        freelancerName,
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

    return json(201, result.rows[0])
  } catch (err) {
    context.error(err)
    return error(500, 'Failed to create freelancer', err instanceof Error ? err.message : String(err))
  }
}

app.http('freelancers-create', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'freelancers',
  handler: freelancersCreate,
})