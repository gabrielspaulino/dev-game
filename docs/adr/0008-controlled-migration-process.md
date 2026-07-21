# ADR-0008 — Controlled Database Migration Process

**Status:** Accepted  
**Date:** 2026-07-21

## Context

Database schema changes must be applied in a controlled, reproducible way. Serverless functions can be invoked concurrently by many instances. Running migrations inside request handlers would cause race conditions and unexpected failures.

## Decision

We will use a **controlled, explicit migration process** that is separate from the application's request lifecycle:

1. Schema changes are made in `database/schema/index.ts`.
2. `npm run db:generate` produces a versioned SQL migration file.
3. Migrations are applied manually (or via a CI step) before promoting the deployment:
   - `npm run db:migrate` with `DIRECT_DATABASE_URL`.
4. Migrations never run automatically inside serverless function handlers.
5. Migrations use a direct (non-pooled) database connection. pgBouncer transaction mode does not support DDL statements.
6. Applied migrations are tracked in the `drizzle_migrations` table.
7. A migration that has been applied to any environment must never be edited. Write a new migration to correct it.

## Alternatives Considered

- **Automatic migration on startup:** Runs in every function instance on cold start. Causes race conditions. Not compatible with serverless. Eliminated.
- **Prisma Migrate with a dedicated migration process:** Viable but we chose Drizzle (see ADR-0005).
- **Manual SQL scripts:** No version tracking. Error-prone. Eliminated.
- **Drizzle-kit migrate (selected):** Versioned SQL files. Explicit apply step. Drizzle tracks which migrations have run.

## Positive Consequences

- Migrations are auditable — every change is a reviewable SQL file.
- No migration races in serverless.
- The application can be deployed to any environment by pointing `DIRECT_DATABASE_URL` at the target database.
- Rollback strategy is explicit: write a compensating migration.

## Negative Consequences

- Migrations must be applied manually before deployment promotion (mitigated by CI and runbook documentation).
- A deployment that requires a schema change must coordinate with the migration step.

## Follow-up Actions

- Document the migration step in `docs/DEPLOYMENT.md`.
- Add a CI check that verifies migrations are up to date on `main`.
- Never run `db:push` (`drizzle-kit push`) in production — it bypasses the migration history.
