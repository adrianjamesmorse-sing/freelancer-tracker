create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null default 'viewer',
  created_at timestamptz not null default now()
);

create table if not exists staff (
  id uuid primary key default gen_random_uuid(),
  entra_user_id text unique,
  email text unique not null,
  full_name text not null,
  job_title text,
  department text,
  manager_name text,
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists freelancers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  freelancer_name text not null,
  personal_email text,
  phone_number text,
  address text,
  country text,
  freelancer_status text not null default 'Active',
  registration_number boolean not null default false,
  question_flag boolean not null default false,
  comments text
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  entity text not null,
  project_manager_name text not null,
  project_manager_email text not null,
  status text not null default 'Active',
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists allocations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  freelancer_id uuid not null references freelancers(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  contract_start_date date not null,
  contract_end_date date not null,
  number_of_days integer,
  daily_rate numeric(12,2),
  daily_rate_currency text,
  daily_rate_note text,
  role_within_project text,
  owner_manager_name text,
  owner_manager_email text,
  allocation_status text not null default 'Active'
);

create table if not exists notification_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  trigger_type text not null,
  cadence text not null,
  recipients jsonb not null default '[]'::jsonb,
  custom_recipient_emails jsonb not null default '[]'::jsonb,
  subject text not null,
  body text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  allocation_id uuid references allocations(id) on delete cascade,
  notification_rule_id uuid references notification_rules(id) on delete set null,
  notification_type text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'queued',
  recipient_email text,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_allocations_project_id on allocations(project_id);
create index if not exists idx_allocations_freelancer_id on allocations(freelancer_id);
create index if not exists idx_notifications_scheduled_for on notifications(scheduled_for);