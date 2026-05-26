import { app } from '@azure/functions'
import { getPool } from '../lib/db.js'
import { json, error } from '../lib/response.js'

app.http('projects-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects',
  handler: async () => {
    try {
      const pool = getPool()
      const result = await pool.query(
        `
        select
          id,
          project_name,
          entity,
          project_manager_name,
          project_manager_email,
          status,
          start_date,
          end_date,
          created_at
        from projects
        order by project_name asc
        `,
      )

      return json(result.rows)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return error(message, 500)
    }
  },
})