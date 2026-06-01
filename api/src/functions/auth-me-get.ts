import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions'
import { preflight, withCors } from '../lib/cors.js'
import { authenticateRequest, isAuthConfigured } from '../lib/entraAuth.js'
import { query } from '../lib/db.js'
import { error, json } from '../lib/response.js'

app.http('auth-me-get', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/me',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    if (request.method === 'OPTIONS') {
      return preflight()
    }

    if (!isAuthConfigured()) {
      return withCors(
        json(200, {
          authenticated: false,
          devMode: true,
          user: {
            email: 'dev@vertex.local',
            fullName: 'Development User',
            roles: ['admin'],
          },
        }),
      )
    }

    try {
      const user = await authenticateRequest(request)
      if (!user) {
        return withCors(error(401, 'Unauthorized'))
      }

      try {
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
            user.email,
            user.fullName,
            user.roles.includes('admin') ? 'admin' : user.roles.includes('editor') ? 'editor' : 'viewer',
            user.entraUserId || null,
            user.jobTitle ?? null,
            user.department ?? null,
          ],
        )
      } catch {
        // Allow auth to succeed even if the users table is not migrated yet.
      }

      return withCors(
        json(200, {
          authenticated: true,
          user: {
            entraUserId: user.entraUserId,
            email: user.email,
            fullName: user.fullName,
            roles: user.roles,
            jobTitle: user.jobTitle ?? null,
            department: user.department ?? null,
          },
        }),
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      return withCors(error(401, message))
    }
  },
})
