# DevLeap

A Duolingo-style gamified learning platform for software developers — practice Java, Spring Boot, SQL, system design, and more through daily sessions with XP, streaks, and skill progression.

## Run & Operate

### Backend (Java 21 + Spring Boot)
- `cd backend && mvn spring-boot:run` — start the API (port from $PORT, default 8080)
- `cd backend && mvn verify` — compile + unit + integration tests (requires Docker for Testcontainers)
- `cd backend && mvn test` — unit tests only
- `cd backend && mvn flyway:info` — check migration status

### Frontend (React + Vite)
- `pnpm --filter @workspace/frontend run dev` — start the frontend dev server
- `pnpm --filter @workspace/frontend run typecheck` — type check

### API
- `pnpm --filter @workspace/api-spec run codegen` — regenerate TypeScript hooks from OpenAPI spec

### Local services
- `docker-compose up -d` — start local PostgreSQL (localhost:5432)

## Stack

- **Backend**: Java 21, Spring Boot 3.3.x, Maven, Hexagonal Architecture
- **Frontend**: React 18, TypeScript, Vite, TanStack Query
- **Database**: PostgreSQL + Flyway (Supabase in production, Docker Compose locally)
- **Auth**: Supabase Auth (JWT)
- **API docs**: Springdoc OpenAPI (Swagger UI at `/api/swagger-ui.html`)
- **CI**: GitHub Actions

## Where things live

- `backend/` — Spring Boot backend (Java, Maven)
- `artifacts/frontend/` — React + Vite frontend (Replit artifact)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for frontend types)
- `backend/src/main/resources/db/migration/` — Flyway migrations
- `docs/` — full documentation set
- `AGENTS.md` — permanent rules for AI agents

## Architecture decisions

See `docs/ARCHITECTURE.md` and `docs/adr/`.

- Modular monolith with Hexagonal Architecture (Ports and Adapters)
- Supabase as a replaceable auth + database provider
- REST API under `/api/v1/`
- Flyway as the single source of truth for database schema
- Stateless backend — horizontally scalable from day one

## Product

DevLeap helps software developers practice engineering skills daily through:
- Daily sessions with multiple-choice, code output, and bug identification questions
- XP system, daily streaks, and skill mastery tracking
- Personalized question selection (spaced repetition)
- Java Backend Developer learning path (first available path)

## User preferences

_Populate as you work — explicit user instructions worth remembering._

## Gotchas

- Never edit applied Flyway migrations — create new ones instead.
- Spring Boot context path is `/api` — controllers map from within that path.
- The Replit proxy routes `/api` → the api-server artifact (runs Spring Boot).
- Run `pnpm --filter @workspace/api-spec run codegen` after every openapi.yaml change.
- The `seed` Spring profile must never be enabled in production.

## Pointers

- See `AGENTS.md` for permanent AI agent rules.
- See `docs/ARCHITECTURE.md` for system architecture and diagrams.
- See `docs/adr/` for architecture decision records.
