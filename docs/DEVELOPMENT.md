# Development Guide

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥ 20 | LTS recommended |
| npm | ≥ 10 | Bundled with Node.js 20 |
| Docker | Any recent | For local PostgreSQL |
| Docker Compose | v2+ | `docker compose` (not `docker-compose`) |

## Environment Configuration

```bash
cp .env.example .env.local
```

Edit `.env.local`. The minimum required for local development:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devgame
DIRECT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devgame
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For authentication (Stage 1 and later), you will also need:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

See `.env.example` for the full list with descriptions.

## Local PostgreSQL

```bash
# Start PostgreSQL in the background
npm run docker:up

# Stop PostgreSQL
npm run docker:down
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `devgame`
- User: `postgres`
- Password: `postgres`

## Install Dependencies

```bash
npm install
```

## Run the Application

```bash
npm run dev
```

Visit http://localhost:3000. The home page shows the API health status.

## Apply Migrations

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply pending migrations (uses DIRECT_DATABASE_URL)
npm run db:migrate
```

**Important:** Run migrations with `DIRECT_DATABASE_URL` set to a direct (non-pooled) connection. The pooled `DATABASE_URL` is for runtime only.

## Seed Development Data

```bash
npm run db:seed
```

Stage 0 has no seed data. The seed script is populated in Stage 2.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm start` | Start production server locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix auto-fixable lint errors |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run typecheck` | TypeScript type checking |
| `npm run test` | Run all unit tests |
| `npm run test:watch` | Watch mode for unit tests |
| `npm run test:coverage` | Unit tests with coverage report |
| `npm run test:e2e` | End-to-end tests (requires running app) |
| `npm run db:generate` | Generate Drizzle migration from schema |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema to DB (dev only, no migration file) |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed development data |
| `npm run docker:up` | Start local services (PostgreSQL) |
| `npm run docker:down` | Stop local services |

## Module Conventions

Each business module in `src/modules/<name>/` follows this structure:

```
domain/       Entities, value objects, domain services
application/  Use cases, DTOs (no framework imports)
ports/        TypeScript interfaces for external dependencies
adapters/     Implementations of ports (Drizzle, Supabase, etc.)
infrastructure/ Module-specific wiring and config
```

### Rules

- Domain and application layers must not import from Next.js, Supabase, or Drizzle.
- Adapters implement ports — never the reverse.
- Use `server-only` at the top of any module that must not be imported by client code.
- Never call `new Date()` in domain code — use the `Clock` port.
- Never call `Math.random()` in domain code — use a controlled selector port.

## Server-Only Code

Mark files that must not be imported by Client Components:

```ts
import "server-only";
```

The build will fail if a Client Component imports a server-only module.

## Local Authentication Strategy

Stage 0 does not include authentication. When authentication is implemented in Stage 1:

- **Development:** Use a dedicated Supabase development project, or enable `ENABLE_LOCAL_AUTH=true` to use a fake identity adapter that accepts any user ID.
- **Test:** Use the fake identity adapter or MSW to mock Supabase responses.
- `ENABLE_LOCAL_AUTH=true` **must never be set in production.** The application validates this at startup.

## Code Conventions

- TypeScript strict mode — no `any` without a documented reason.
- Prefer explicit types at module boundaries.
- Small, single-responsibility functions.
- Named exports (avoid default exports for utilities).
- Co-locate tests with the code they test (`*.test.ts` / `*.test.tsx`).
- Use the `createLogger` helper from `src/shared/infrastructure/logger.ts`.
- Never use `console.log` — use the structured logger.

## Debugging

### Logs

The development server prints pretty-formatted pino logs with color.

```bash
LOG_LEVEL=debug npm run dev
```

### Database

```bash
npm run db:studio
```

Opens Drizzle Studio at http://localhost:4983.

### Type Errors

```bash
npm run typecheck
```

Prefer `npm run typecheck` over relying on editor error reporting alone.
