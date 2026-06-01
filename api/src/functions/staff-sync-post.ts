import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions'
import { authenticateRequest, hasRole, isAuthConfigured } from '../lib/entraAuth.js'
import { preflight, withCors } from '../lib/cors.js'
import { query } from '../lib/db.js'
import { fetchAllStaffUsers, getGraphAccessToken, toStaffRecord } from '../lib/graphClient.js'
import { error, json } from '../lib/response.js'

app.http('staff-sync-post', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'staff/sync',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    if (request.method === 'OPTIONS') {
      return preflight()
    }

    if (isAuthConfigured()) {
      try {
        const user = await authenticateRequest(request)
        if (!user || !hasRole(user, ['admin'])) {
          return withCors(error(403, 'Admin role required to sync staff from Entra'))
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unauthorized'
        return withCors(error(401, message))
      }
    }

    try {
      const accessToken = await getGraphAccessToken()
      const graphUsers = await fetchAllStaffUsers(accessToken)

      let synced = 0
      let skipped = 0

      for (const graphUser of graphUsers) {
        const record = toStaffRecord(graphUser)
        if (!record.email) {
          skipped += 1
          continue
        }

        await query(
          `insert into staff (
             entra_user_id, email, full_name, job_title, department,
             office_location, mobile_phone, user_principal_name, is_active, updated_at
           )
           values ($1, $2, $3, $4, $5, $6, $7, $8, true, now())
           on conflict (email) do update set
             entra_user_id = excluded.entra_user_id,
             full_name = excluded.full_name,
             job_title = excluded.job_title,
             department = excluded.department,
             office_location = excluded.office_location,
             mobile_phone = excluded.mobile_phone,
             user_principal_name = excluded.user_principal_name,
             is_active = true,
             updated_at = now()`,
          [
            record.entraUserId,
            record.email,
            record.fullName,
            record.jobTitle,
            record.department,
            record.officeLocation,
            record.mobilePhone,
            record.userPrincipalName,
          ],
        )

        synced += 1
      }

      return withCors(
        json(200, {
          synced,
          skipped,
          total: graphUsers.length,
        }),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Staff sync failed'
      return withCors(error(500, message))
    }
  },
})
