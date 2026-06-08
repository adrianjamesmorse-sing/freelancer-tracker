import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions'
import type { AuthenticatedUser } from '../lib/entraAuth.js'
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

    let authenticatedUser: AuthenticatedUser | null = null

    if (isAuthConfigured()) {
      try {
        const user = await authenticateRequest(request)
        if (!user || !hasRole(user, ['viewer', 'editor', 'admin'])) {
          return withCors(error(401, 'Unauthorized'))
        }
        authenticatedUser = user
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unauthorized'
        return withCors(error(401, message))
      }
    }

    try {
      await ensureStaffDirectorySchema()

      if (authenticatedUser) {
        await query(
          `insert into users (email, full_name, role, entra_user_id, job_title, department, last_login_at)
           values ($1, $2, $3, $4, $5, $6, now())
           on conflict (email) do update set
             full_name = excluded.full_name,
             role = excluded.role,
             entra_user_id = excluded.entra_user_id,
             job_title = excluded.job_title,
             department = excluded.department,
             last_login_at = now()`,
          [
            authenticatedUser.email,
            authenticatedUser.fullName,
            authenticatedUser.roles.includes('admin')
              ? 'admin'
              : authenticatedUser.roles.includes('editor')
                ? 'editor'
                : 'viewer',
            authenticatedUser.entraUserId || null,
            authenticatedUser.jobTitle ?? null,
            authenticatedUser.department ?? null,
          ],
        )
      }

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
         from (
           select id, entra_user_id, email, full_name, job_title, department, office_location,
                  mobile_phone, user_principal_name, photo_url, is_active, 0 as source_order
           from staff
           where is_active = true
           union all
           select users.id, users.entra_user_id, users.email, users.full_name, users.job_title,
                  users.department, null as office_location, null as mobile_phone,
                  users.email as user_principal_name, null as photo_url, true as is_active,
                  1 as source_order
           from users
           where not exists (
             select 1
             from staff
             where lower(staff.email) = lower(users.email)
               and staff.is_active = true
           )
         ) staff_directory
         order by source_order asc, full_name asc`,
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
