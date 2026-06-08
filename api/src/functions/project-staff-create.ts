import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'
import { ensureStaffDirectorySchema } from '../lib/staffSchema.js'

app.http('project-staff-create', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/staff',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      if (isAuthConfigured()) {
        const user = await authenticateRequest(request)
        if (!user || !hasRole(user, ['editor', 'admin'])) {
          return error(401, 'Unauthorized')
        }
      }

      const projectId = request.params.projectId
      if (!projectId) return error(400, 'projectId is required')

      const body = (await request.json()) as Record<string, unknown>
      const staffId = String(body.staffId ?? '').trim()
      const assignmentRole = String(body.assignmentRole ?? 'Squad').trim() || 'Squad'
      if (!staffId) return error(400, 'staffId is required')

      await ensureStaffDirectorySchema()

      const result = await query(
        `
        insert into project_staff (project_id, staff_id, assignment_role)
        values ($1, $2, $3)
        on conflict (project_id, staff_id, assignment_role) do update set
          assignment_role = excluded.assignment_role
        returning id
        `,
        [projectId, staffId, assignmentRole],
      )

      return json(201, { id: result.rows[0]?.id })
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to assign staff to project', err instanceof Error ? err.message : String(err))
    }
  },
})
