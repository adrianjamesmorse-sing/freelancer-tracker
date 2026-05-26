import type { HttpResponseInit } from '@azure/functions'

export function json(status: number, body: unknown): HttpResponseInit {
  return {
    status,
    jsonBody: body,
    headers: {
      'content-type': 'application/json',
    },
  }
}

export function error(status: number, message: string, details?: unknown): HttpResponseInit {
  return json(status, {
    error: message,
    ...(details !== undefined ? { details } : {}),
  })
}