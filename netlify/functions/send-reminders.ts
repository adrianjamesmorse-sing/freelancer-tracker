import type { Handler } from '@netlify/functions'

export const handler: Handler = async () => {
  return {
    statusCode: 202,
    body: JSON.stringify({
      message: 'Stub only: query upcoming end dates and still-open allocations, then send email + create in-app notifications.',
    }),
  }
}