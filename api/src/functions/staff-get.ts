import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { preflight, withCors } from '../lib/cors.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'
import { ensureStaffDirectorySchema } from '../lib/staffSchema.js'

app.http('staff-get', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'staff',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    if (request.method === 'OPTIONS') {
      return preflight()
    }

    if (isAuthConfigured()) {
      try {
        const user = await authenticateRequest(request)
        if (!user || !hasRole(user, ['viewer', 'editor', 'admin'])) {
          return withCors(error(401, 'Unauthorized'))
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unauthorized'
        return withCors(error(401, message))
      }
    }

    try {
      await ensureStaffDirectorySchema()

      const result = await query<{
        id: string
        entra_user_id: string | null
        email: string
        full_name: string
        job_title: string | null
        department: string | null
        office_location: string | null
        mobile_phone: string | null
        user_principal_name: string | null
        photo_url: string | null
        is_active: boolean
      }>(
        `select id, entra_user_id, email, full_name, job_title, department, office_location,
                mobile_phone, user_principal_name, photo_url, is_active
         from staff
         where is_active = true
         order by full_name asc`,
      )

      return withCors(
        json(
          200,
          result.rows.map((row) => ({
            id: row.id,
            entraUserId: row.entra_user_id,
            email: row.email,
            fullName: row.full_name,
            jobTitle: row.job_title,
            department: row.department,
            officeLocation: row.office_location,
            mobilePhone: row.mobile_phone,
            userPrincipalName: row.user_principal_name,
            photoUrl: row.photo_url,
            isActive: row.is_active,
          })),
        ),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load staff'
      return withCors(error(500, message))
    }
  },
})
