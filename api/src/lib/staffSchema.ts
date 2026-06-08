import { query } from './db.js'

export async function ensureStaffDirectorySchema() {
  await query(`
    alter table staff
      add column if not exists office_location text,
      add column if not exists mobile_phone text,
      add column if not exists user_principal_name text
  `)
}
