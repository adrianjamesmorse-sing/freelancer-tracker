import { app } from '@azure/functions'
import { getPool } from '../lib/db.js'
import { json, error } from '../lib/response.js'

app.http('freelancers-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'freelancers',
  handler: async () => {
    try {
      const pool = getPool()
      const result = await pool.query(
        `
        select
          id,
          created_at,
          freelancer_name,
          personal_email,
          phone_number,
          address,
          country,
          freelancer_status,
          registration_number,
          question_flag,
          comments
        from freelancers
        order by freelancer_name asc
        `,
      )

      return json(result.rows)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return error(message, 500)
    }
  },
})