import { query } from './db.js'

export async function ensureStaffDirectorySchema() {
  await query(`
    alter table users
      add column if not exists entra_user_id text unique,
      add column if not exists job_title text,
      add column if not exists department text,
      add column if not exists last_login_at timestamptz;

    alter table staff
      add column if not exists office_location text,
      add column if not exists mobile_phone text,
      add column if not exists user_principal_name text
  `)
}
