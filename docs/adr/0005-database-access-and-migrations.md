# ADR-0005 — Database Access: Drizzle ORM with drizzle-kit

**Status:** Accepted  
**Date:** 2026-07-21

## Context

We need a TypeScript-compatible ORM and migration tool for PostgreSQL. The solution must work in a Vercel serverless environment and support a controlled migration workflow.

### Evaluation Criteria

| Criterion                | Weight |
| ------------------------ | ------ |
| Serverless compatibility | High   |
| Connection management    | High   |
| Type safety              | High   |
| Migration workflow       | High   |
| Testability              | Medium |
| Operational simplicity   | Medium |

### Options Evaluated

#### Drizzle ORM + drizzle-kit

- **Serverless:** Excellent. No binary dependencies. Uses `postgres.js` (pure JS driver).
- **Connections:** Explicit connection management. Singleton pattern works well in serverless.
- **Type safety:** Excellent. Schema defines TypeScript types directly.
- **Migrations:** `drizzle-kit generate` + `drizzle-kit migrate`. SQL files are human-readable.
- **Testability:** Good. No global client — inject the `db` instance via dependency injection.
- **Simplicity:** Low boilerplate. Schema is TypeScript.

#### Prisma + Prisma Migrate

- **Serverless:** Requires the Prisma query engine binary. Historically problematic with Vercel Edge. Prisma Accelerate partially solves this but adds another dependency.
- **Connections:** Requires `PrismaClient` accelerate extension for serverless pooling.
- **Type safety:** Excellent. Generated client with full type inference.
- **Migrations:** `prisma migrate dev` + `prisma migrate deploy`. Good workflow.
- **Testability:** Slightly harder to inject in tests.
- **Simplicity:** More configuration files.

## Decision

We will use **Drizzle ORM** with **drizzle-kit** for migrations.

**Rationale:** Drizzle's pure-JavaScript driver eliminates the binary dependency problem that makes Prisma challenging in serverless environments. The schema-as-TypeScript approach reduces the number of files and mental models. Migration files are plain SQL — human-readable and reviewable.

## Migration Workflow

1. Edit `database/schema/index.ts` to change the schema.
2. Run `npm run db:generate` to produce a migration file in `database/migrations/`.
3. Review the generated SQL.
4. Run `npm run db:migrate` with `DIRECT_DATABASE_URL` to apply.

**Never run migrations with the pooled connection string.** pgBouncer in transaction mode does not support DDL statements.

## Positive Consequences

- No binary dependencies — deploys cleanly on Vercel.
- TypeScript schema = one source of truth for types and structure.
- Readable SQL migration files — easy to review and audit.
- Lightweight and fast.

## Negative Consequences

- Less mature ecosystem than Prisma.
- Schema-first means less flexibility for complex queries than raw SQL (mitigated by Drizzle's `sql` template tag).
- Team must learn Drizzle's query builder API.

## Follow-up Actions

- Configure `drizzle.config.ts` to use `DIRECT_DATABASE_URL`.
- Never use `DATABASE_URL` for migrations.
- Document the migration process in `docs/DEPLOYMENT.md` and `docs/DEVELOPMENT.md`.
