import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions'
import { json } from '../lib/response.js'

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: async (_request: HttpRequest): Promise<HttpResponseInit> => {
    return json(200, {
      ok: true,
      service: 'vertex-api',
      timestamp: new Date().toISOString(),
    })
  },
})