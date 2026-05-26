import { Pool } from 'pg'

let cachedPool: Pool | null = null

export function getPool(): Pool {
  if (cachedPool) return cachedPool

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured')
  }

  cachedPool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
  })

  return cachedPool
}