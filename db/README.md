# Vertex database (PostgreSQL)

Schema is managed with SQL migrations in `db/migrations/`.

Apply in order against your Azure Database for PostgreSQL (or local Postgres):

```bash
psql "$DATABASE_URL" -f db/migrations/001_init.sql
psql "$DATABASE_URL" -f db/migrations/002_entra_auth.sql
```

Set `DATABASE_URL` on the Azure Static Web App linked API (`api/`) via **Configuration → Application settings**.
