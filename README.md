# Vertex (Freelancer Tracker)

Internal resource management for freelancers, projects, allocations, and notifications.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Hosting:** Azure Static Web Apps
- **API:** Azure Functions (linked `api/` app)
- **Database:** PostgreSQL
- **Auth:** Microsoft Entra ID (MSAL) + app roles
- **Directory sync:** Microsoft Graph → `staff` table

## Local development

```bash
npm install
cd api && npm install && cd ..

# Frontend env (optional if API has Entra settings)
cp .env.example .env

# API secrets + database
cp api/local.settings.example.json api/local.settings.json
# Edit DATABASE_URL and ENTRA_* in api/local.settings.json

# Terminal 1 – API
cd api && func start

# Terminal 2 – UI (proxies /api → localhost:7071)
npm run dev
```

Skip Entra locally: set `VITE_AUTH_DISABLED=true` in `.env`.

## Deploy (Azure Static Web Apps)

Deployment is handled by `.github/workflows/azure-static-web-apps-*.yml` on push to `main`.

### Application settings (Azure Portal)

Open your **Static Web App** → **Settings** → **Configuration** → **Application settings**:

| Setting | Used by |
|---------|---------|
| `DATABASE_URL` | API – PostgreSQL connection |
| `ENTRA_TENANT_ID` | API + login config exposed to UI |
| `ENTRA_CLIENT_ID` | API + login config exposed to UI |
| `ENTRA_CLIENT_SECRET` | API – Graph (staff sync + app role lookup) |
| `ENTRA_ALLOWED_DOMAIN` | API – default `singulier.co` |

The SPA reads `ENTRA_TENANT_ID` and `ENTRA_CLIENT_ID` from `GET /api/auth/config` at startup, so you do **not** need separate `VITE_ENTRA_*` GitHub secrets unless you want build-time overrides.

Optional GitHub Actions secrets (build step only):

- `VITE_ENTRA_TENANT_ID`
- `VITE_ENTRA_CLIENT_ID`
- `VITE_ENTRA_REDIRECT_URI` – e.g. `https://your-app.azurestaticapps.net/login`

### Entra app registration

1. **Authentication** → SPA redirect: `https://<your-host>/login` (and `http://localhost:5173/login` for dev).
2. **App roles** on the Vertex enterprise app with **Value**: `vertex.viewer`, `vertex.editor`, `vertex.admin` – assign users or groups to those roles (not only separate security group names).
3. **API permissions** (application, + admin consent): `User.Read.All` (staff sync), `AppRoleAssignment.Read.All` (read `vertex.admin` / etc. when the ID token has no `roles` claim).

### Database

Run migrations in `db/migrations/` against your Postgres instance. See `db/README.md`.

## Project layout

| Path | Purpose |
|------|---------|
| `src/` | React SPA |
| `api/` | Azure Functions REST API |
| `db/migrations/` | PostgreSQL schema |
| `public/staticwebapp.config.json` | SWA SPA routing |
