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

Copy `.env.example` to `.env` for the frontend and configure `api/local.settings.json` for the API host:

```bash
cp .env.example .env
cp api/local.settings.example.json api/local.settings.json
```

### Entra SSO and Graph

1. Register a single Entra application for Vertex.
2. Add SPA redirect URI: `http://localhost:5173/login` (and your production URL).
3. Create app roles: `Vertex.Viewer`, `Vertex.Editor`, `Vertex.Admin`.
4. Assign roles to users or groups in Entra.
5. Grant application permissions for Graph staff sync: `User.Read.All` (and optional `ProfilePhoto.Read.All`), then admin consent.
6. Set frontend `VITE_ENTRA_*` variables and API `ENTRA_*` secrets.

Routes:

- `/login` — Microsoft Entra sign-in
- Admin → Graph permissions — sync staff into Vertex for project assignment pickers
- Page access is enforced from Entra app roles after sign-in

For local UI work without Entra, set `VITE_AUTH_DISABLED=true`.

Variables:

- `VITE_ENTRA_TENANT_ID`
- `VITE_ENTRA_CLIENT_ID`
- `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET` (API)

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
