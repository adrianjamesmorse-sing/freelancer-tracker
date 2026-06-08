import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'
import { ensureStaffDirectorySchema } from '../lib/staffSchema.js'

app.http('project-staff-get', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'projects/{projectId}/staff',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      if (isAuthConfigured()) {
        const user = await authenticateRequest(request)
        if (!user || !hasRole(user, ['viewer', 'editor', 'admin'])) {
          return error(401, 'Unauthorized')
        }
      }

      const projectId = request.params.projectId
      if (!projectId) return error(400, 'projectId is required')

      await ensureStaffDirectorySchema()

      const result = await query(
        `
        select
          ps.id,
          ps.project_id,
          ps.staff_id,
          ps.assignment_role,
          ps.created_at,
          s.entra_user_id,
          s.email,
          s.full_name,
          s.job_title,
          s.department,
          s.office_location,
          s.mobile_phone,
          s.user_principal_name,
          s.photo_url,
          s.is_active
        from project_staff ps
        join staff s on s.id = ps.staff_id
        where ps.project_id = $1
          and s.is_active = true
        order by
          case lower(ps.assignment_role)
            when 'project leader' then 0
            when 'lead' then 0
            when 'squad lead' then 1
            else 2
          end,
          s.full_name asc
        `,
        [projectId],
      )

      return json(200, result.rows)
    } catch (err) {
      context.error(err)
      return error(500, 'Failed to load project staff', err instanceof Error ? err.message : String(err))
    }
  },
})
