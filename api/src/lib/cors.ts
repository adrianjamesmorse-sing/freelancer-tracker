import type { HttpResponseInit } from '@azure/functions'

const ALLOWED_HEADERS = 'authorization, content-type'
const ALLOWED_METHODS = 'GET, POST, PUT, DELETE, OPTIONS'

export function withCors(response: HttpResponseInit, origin = '*'): HttpResponseInit {
  return {
    ...response,
    headers: {
      ...response.headers,
      'access-control-allow-origin': origin,
      'access-control-allow-headers': ALLOWED_HEADERS,
      'access-control-allow-methods': ALLOWED_METHODS,
    },
  }
}

export function preflight(): HttpResponseInit {
  return withCors({ status: 204 })
}
