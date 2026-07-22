# Deployment Guide

## Overview

dev-game deploys as a single Next.js project on Vercel. The React frontend, server-rendered pages, API Route Handlers, and database integrations are all part of the same deployment.

## Vercel Project Setup

1. Import the repository into Vercel.
2. Set the **framework preset** to **Next.js**.
3. Set the **root directory** to `.` (repository root).
4. Build command: `npm run build`
5. Install command: `npm ci`

## Environment Variables

Set all required variables in the Vercel dashboard under **Settings → Environment Variables**.

| Variable                        | Environment         | Notes                                           |
| ------------------------------- | ------------------- | ----------------------------------------------- |
| `DATABASE_URL`                  | Production, Preview | Supabase pooled connection (pgBouncer)          |
| `DIRECT_DATABASE_URL`           | Production only     | Direct connection for migrations                |
| `SUPABASE_URL`                  | All                 | Supabase project URL                            |
| `NEXT_PUBLIC_SUPABASE_URL`      | All                 | Same value as above                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All                 | Supabase anonymous key                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Production, Preview | Never expose publicly                           |
| `NEXT_PUBLIC_APP_URL`           | All                 | Public URL (e.g., `https://devgame.vercel.app`) |
| `AUTH_REDIRECT_URL`             | All                 | `https://your-domain/auth/callback`             |
| `LOG_LEVEL`                     | Production          | `info` recommended                              |
| `ENABLE_LOCAL_AUTH`             | Development only    | Must be `false` in production                   |
| `FEATURE_ADMIN_PANEL`           | All                 | `true` to enable admin routes                   |

**Never set `ENABLE_LOCAL_AUTH=true` in production.** The application validates this at startup and will refuse to start.

## Database Connection Strategy

- **Runtime (application requests):** Use `DATABASE_URL` — a pooled connection via Supabase pgBouncer in **transaction mode**.
- **Migrations:** Use `DIRECT_DATABASE_URL` — a direct (non-pooled) connection. DDL statements are not compatible with pgBouncer transaction mode.

### Connection pooling

Supabase provides pgBouncer on port `6543`. Use this URL for `DATABASE_URL`:

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Use the direct connection on port `5432` for `DIRECT_DATABASE_URL`:

```
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

## Database Migrations

**Migrations must run before deploying new code that depends on schema changes.**

```bash
# Apply migrations to production
DIRECT_DATABASE_URL="..." npm run db:migrate
```

Run this manually (or via a CI step) before promoting the Vercel deployment.

Do not configure migrations to run automatically inside serverless functions. Concurrent invocations can cause races. Control the migration window explicitly.

## Vercel Preview Deployments

Each pull request gets a preview deployment. Configure:

- A dedicated Supabase development project for preview environments, or
- Share the production Supabase project (acceptable for early stages, not for production-scale).

Ensure preview deployments have `ENABLE_LOCAL_AUTH=false`.

## Authentication Callback URLs

Register the following redirect URL in your Supabase Auth settings:

- Production: `https://your-domain/auth/callback`
- Preview: `https://*.vercel.app/auth/callback` (wildcard)
- Local: `http://localhost:3000/auth/callback`

## Runtime Selection

All Route Handlers use the **Node.js runtime** (default). This is required for:

- The `postgres` driver
- Drizzle ORM
- Supabase server-side SDK

Do not use the Edge runtime for routes that access the database or Supabase.

## Health Verification

After deployment:

```
GET https://your-domain/api/v1/health
```

Expected response when healthy:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "...",
  "services": { "database": "connected" }
}
```

`status: "degraded"` means the database is unreachable — check `DATABASE_URL` and Supabase connectivity.

## Release Process

1. Merge to `main` after CI passes.
2. Run `npm run db:migrate` with the production `DIRECT_DATABASE_URL`.
3. Verify the health endpoint after migration.
4. Vercel auto-deploys from `main` (or promote the Preview deployment manually).
5. Verify the health endpoint on the new deployment.
6. Monitor logs for errors.

## Rollback Strategy

- **Code:** Roll back to the previous Vercel deployment via the Vercel dashboard.
- **Database:** Schema rollbacks are manual. Write a new Drizzle migration that reverses the change. Never edit a migration that has already been applied.

## Production Checklist

Before first production deployment:

- [ ] All required environment variables are set in Vercel
- [ ] `ENABLE_LOCAL_AUTH` is `false` or unset
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-only (not `NEXT_PUBLIC_`)
- [ ] Supabase auth redirect URLs are configured
- [ ] Database migrations have been applied
- [ ] Health endpoint returns `status: "ok"`
- [ ] CI pipeline passes on `main`
- [ ] No secrets in source code or `.env.example`
