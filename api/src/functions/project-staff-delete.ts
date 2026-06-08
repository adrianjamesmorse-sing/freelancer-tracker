import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'
import { ensureStaffDirectorySchema } from '../lib/staffSchema.js'

app.http('project-staff-delete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/staff/{assignmentId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      if (isAuthConfigured()) {
        const user = await authenticateRequest(request)
        if (!user || !hasRole(user, ['editor', 'admin'])) {
          return error(401, 'Unauthorized')
        }
      }

      const projectId = request.params.projectId
      const assignmentId = request.params.assignmentId
      if (!projectId || !assignmentId) return error(400, 'projectId and assignmentId are required')

      await ensureStaffDirectorySchema()

      const result = await query(
        'delete from project_staff where project_id = $1 and id = $2 returning id',
        [projectId, assignmentId],
      )
      if (result.rowCount === 0) return error(404, 'Project staff assignment not found')

      return json(200, { id: assignmentId })
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to remove project staff', err instanceof Error ? err.message : String(err))
    }
  },
})
