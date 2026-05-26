import { Pool, type QueryResult, type QueryResultRow } from 'pg'

let pool: Pool | undefined

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set')
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  }

  return pool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params)
}