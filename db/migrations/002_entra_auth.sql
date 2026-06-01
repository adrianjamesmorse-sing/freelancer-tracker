alter table users
  add column if not exists entra_user_id text unique,
  add column if not exists job_title text,
  add column if not exists department text,
  add column if not exists last_login_at timestamptz;

alter table staff
  add column if not exists office_location text,
  add column if not exists mobile_phone text,
  add column if not exists user_principal_name text;

create table if not exists project_staff (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  staff_id uuid not null references staff(id) on delete cascade,
  assignment_role text not null default 'project_manager',
  created_at timestamptz not null default now(),
  unique (project_id, staff_id, assignment_role)
);

create index if not exists idx_project_staff_project_id on project_staff(project_id);
create index if not exists idx_staff_email on staff(email);
