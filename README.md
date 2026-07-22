# dev-game

> Gamified daily learning for software developers — Duolingo for engineers.

**Stage 0 — Foundation.** The project structure, toolchain, and developer experience are established. Authentication, sessions, XP, and learning content are implemented in subsequent stages.

---

## What Is dev-game?

dev-game is a responsive web application where software developers practice software engineering knowledge daily. It provides:

- Personalized daily learning sessions
- Multiple-choice, code-output, and bug-identification questions
- Experience points (XP), user levels, and daily streaks
- Skill-level progress tracking
- Spaced-repetition review

The first learning path covers **Java Backend Development** (Java, OOP, Spring Boot, REST APIs, SQL, Docker, AWS, and more).

## Current Status

| Stage | Name                       | Status         |
| ----- | -------------------------- | -------------- |
| 0     | Foundation                 | ✅ Complete    |
| 1     | Identity & Users           | ⏳ Not started |
| 2     | Learning Catalog           | ⏳ Not started |
| 3     | Daily Sessions             | ⏳ Not started |
| 4     | Gamification               | ⏳ Not started |
| 5     | Progress & Learning Engine | ⏳ Not started |
| 6     | Production Readiness       | ⏳ Not started |

## Technology Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | Next.js 15 (App Router)                     |
| Language   | TypeScript 5 (strict)                       |
| Styling    | Tailwind CSS                                |
| ORM        | Drizzle ORM                                 |
| Database   | PostgreSQL (Supabase in production)         |
| Auth       | Supabase Auth (Stage 1)                     |
| Testing    | Vitest + React Testing Library + Playwright |
| Deployment | Vercel                                      |

## Architecture Summary

Modular monolith with hexagonal architecture principles. Business logic lives in `src/modules/<name>/domain` and `src/modules/<name>/application`. Infrastructure adapters (database, auth) implement ports defined by the application layer. Next.js Route Handlers and Server Components are thin adapters that call application use cases.

```
UI / Framework Adapters
       ↓
Application Use Cases
       ↓
    Domain
       ↑
Infrastructure Adapters (implement Ports)
```

See `docs/ARCHITECTURE.md` for the full design.

## Repository Structure

```
dev-game/
├── AGENTS.md             # AI-agent rules (read before any change)
├── README.md
├── docs/                 # All project documentation
│   └── adr/              # Architecture Decision Records
├── database/
│   ├── migrations/       # Versioned Drizzle migrations
│   ├── schema/           # Drizzle schema definitions
│   └── seeds/            # Development seed scripts
├── tests/
│   ├── unit/             # Domain + use-case unit tests
│   ├── integration/      # Repository + DB integration tests
│   ├── architecture/     # Boundary checks (dependency-cruiser)
│   └── e2e/              # Playwright end-to-end tests
└── src/
    ├── app/              # Next.js App Router pages and API routes
    │   └── api/v1/       # Versioned HTTP endpoints
    ├── modules/          # Business domain modules
    │   ├── identity/
    │   ├── users/
    │   ├── learning/
    │   ├── questions/
    │   ├── sessions/
    │   ├── progress/
    │   ├── gamification/
    │   └── administration/
    ├── shared/           # Cross-cutting concerns
    │   ├── domain/       # Shared errors, Clock port
    │   ├── application/  # Base use-case interface
    │   ├── infrastructure/ # Logger, DB client, env validation
    │   ├── validation/   # Input parsing helpers
    │   └── observability/ # Correlation IDs, error responses
    ├── components/       # Shared React components
    ├── hooks/            # Shared React hooks
    └── styles/           # Global CSS
```

## Local Prerequisites

- Node.js 20+
- Docker and Docker Compose (for local PostgreSQL)
- npm (comes with Node.js)

## Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local — see comments in .env.example
```

At minimum, set `DATABASE_URL` and `DIRECT_DATABASE_URL` for local development.

## Start Local Database

```bash
npm run docker:up
```

This starts PostgreSQL on port 5432 with database `devgame`, user `postgres`, password `postgres`.

## Run the Application

```bash
npm install
npm run dev
```

Visit http://localhost:3000. The home page displays the API health status.

## Run Migrations

```bash
# Generate a new migration from schema changes
npm run db:generate

# Apply pending migrations (requires DIRECT_DATABASE_URL)
npm run db:migrate
```

## Seed Development Data

```bash
npm run db:seed
```

Stage 0: no seed data yet. Data is added in Stage 2 (Learning Catalog).

## Run Tests

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# With coverage report
npm run test:coverage

# End-to-end tests (requires running app)
npm run test:e2e
```

## Run Linting

```bash
npm run lint
npm run format:check
```

## Type Checking

```bash
npm run typecheck
```

## Production Build

```bash
npm run build
npm start
```

## Deploy to Vercel

See `docs/DEPLOYMENT.md` for the full deployment guide.

Quick start:

1. Connect the repository to a Vercel project.
2. Set all environment variables listed in `.env.example`.
3. Run `npm run db:migrate` with `DIRECT_DATABASE_URL` pointing at your production database before promoting the deployment.

## Documentation

| Document                  | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `AGENTS.md`               | AI-agent rules — read before making any change |
| `docs/PRODUCT.md`         | Vision, scope, metrics                         |
| `docs/ARCHITECTURE.md`    | System design and module boundaries            |
| `docs/DEVELOPMENT.md`     | Local development guide                        |
| `docs/TESTING.md`         | Testing strategy and commands                  |
| `docs/DEPLOYMENT.md`      | Vercel + Supabase deployment                   |
| `docs/API.md`             | API conventions and endpoint reference         |
| `docs/DATA_MODEL.md`      | Entities, schema, migrations                   |
| `docs/GAME_RULES.md`      | XP, levels, streaks, rewards                   |
| `docs/LEARNING_ENGINE.md` | Session assembly and mastery                   |
| `docs/SECURITY.md`        | Auth, authorization, threat model              |
| `docs/RUNBOOK.md`         | Operational procedures                         |
| `docs/ROADMAP.md`         | Implementation stages                          |
| `docs/adr/`               | Architecture Decision Records                  |
