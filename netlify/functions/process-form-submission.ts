import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  return {
    statusCode: 202,
    body: JSON.stringify({
      message: 'Stub only: map Microsoft Form payload into freelancer/project/allocation upserts here.',
    }),
  }
}