import { query } from './db.js'

export async function ensureStaffDirectorySchema() {
  await query(`
    alter table staff
      add column if not exists office_location text,
      add column if not exists mobile_phone text,
      add column if not exists user_principal_name text;

    create table if not exists project_staff (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references projects(id) on delete cascade,
      staff_id uuid not null references staff(id) on delete cascade,
      assignment_role text not null default 'squad',
      created_at timestamptz not null default now(),
      unique (project_id, staff_id, assignment_role)
    );

    create index if not exists idx_project_staff_project_id on project_staff(project_id);
    create index if not exists idx_staff_email on staff(email);
  `)
}
