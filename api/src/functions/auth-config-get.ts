import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions'
import { preflight, withCors } from '../lib/cors.js'
import { isAuthConfigured } from '../lib/entraAuth.js'
import { json } from '../lib/response.js'

app.http('auth-config-get', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/config',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    if (request.method === 'OPTIONS') {
      return preflight()
    }

    const tenantId = process.env.ENTRA_TENANT_ID?.trim() || ''
    const clientId = process.env.ENTRA_CLIENT_ID?.trim() || ''
    const domain = process.env.ENTRA_ALLOWED_DOMAIN?.trim() || 'singulier.co'

    return withCors(
      json(200, {
        configured: isAuthConfigured(),
        tenantId,
        clientId,
        domain,
        scopes: ['openid', 'profile', 'email', 'User.Read'],
        redirectPath: '/login',
        roleMapping: {
          'vertex.admin': 'admin',
          'vertex.editor': 'editor',
          'vertex.viewer': 'viewer',
          'Vertex.Admin': 'admin',
          'Vertex.Editor': 'editor',
          'Vertex.Viewer': 'viewer',
        },
        roleHint:
          'Create app roles on the Vertex enterprise application with Value set to vertex.admin, vertex.editor, or vertex.viewer, then assign users or groups to those roles.',
      }),
    )
  },
})
