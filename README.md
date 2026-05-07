# Freelancer Tracker

Lightweight internal resource management MVP for tracking freelancers, projects, allocations, and operational notifications.

## Stack

- React + TypeScript
- Tailwind CSS
- Vite
- Netlify-ready frontend
- Supabase-ready environment variables

## MVP included

- Dashboard
- Freelancers list
- Projects list
- Freelancer detail
- Project detail
- Mock data for active, ending soon, and open follow-up cases

## Local setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

Copy `.env.example` to `.env` when wiring Supabase:

```bash
cp .env.example .env
```

Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Notes

This first pass is intentionally UI-first and uses mock data so the wireframe can be validated before wiring:

- Entra sign-in via Supabase Auth
- Microsoft Form ingestion
- scheduled reminders / email sending
- database-backed CRUD

## Serverless scaffolding

Netlify function stubs included:

- `netlify/functions/health.ts`
- `netlify/functions/process-form-submission.ts`
- `netlify/functions/send-reminders.ts`

## Database scaffold

Starter schema included at:

- `supabase/schema.sql`