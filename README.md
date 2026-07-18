# DevLeap

**DevLeap** is a gamified learning platform for software developers — similar in spirit to Duolingo, but focused on engineering knowledge. Developers practice Java, Spring Boot, SQL, system design, testing, and more through daily sessions with XP, streaks, and skill progression.

## Status

> **Stage 0 — Foundation** complete. Core product features are in active development.

---

## Who it's for

Software developers who want to strengthen their engineering knowledge every day with short, focused practice sessions.

## Main features (MVP)

- Registration and login (Supabase Auth)
- Java Backend Developer learning path
- Daily sessions with multiple-choice, code output, and bug identification questions
- Explanations for every answer
- XP calculation and daily streaks
- Skill progress tracking
- Session history and dashboard
- Administrative interface for question management

## Technology stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.x, Maven |
| Persistence | PostgreSQL (Supabase), Flyway, Spring Data JPA |
| Auth | Supabase Auth (JWT) |
| Validation | Bean Validation, Zod |
| API docs | Springdoc OpenAPI (Swagger UI at `/api/swagger-ui.html`) |
| Frontend | React 18, TypeScript, Vite, TanStack Query, React Router, React Hook Form |
| Testing (backend) | JUnit 5, Mockito, AssertJ, Testcontainers, ArchUnit |
| Testing (frontend) | Vitest, React Testing Library, Playwright |
| CI | GitHub Actions |
| Deploy (frontend) | Vercel |
| Deploy (backend) | Render |
| Deploy (DB/Auth) | Supabase |

## Architecture summary

Modular monolith with Hexagonal (Ports & Adapters) architecture. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

Modules: `identity`, `users`, `learning`, `questions`, `sessions`, `progress`, `gamification`, `administration`.

## Repository structure

```
/
├── backend/                   Java Spring Boot backend
│   ├── pom.xml
│   ├── mvnw
│   ├── .env.example
│   ├── Dockerfile
│   ├── render.yaml
│   └── src/
├── artifacts/frontend/        React + Vite frontend (Replit artifact)
│   ├── src/
│   └── .env.example
├── docs/                      All project documentation
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   ├── API.md
│   ├── DATA_MODEL.md
│   ├── GAME_RULES.md
│   ├── LEARNING_ENGINE.md
│   ├── RUNBOOK.md
│   ├── ROADMAP.md
│   └── adr/
├── docker-compose.yml         Local development services
├── AGENTS.md                  AI agent instructions
└── README.md
```

## Prerequisites

- Java 21 (or use the included Maven wrapper — it downloads Maven automatically)
- Node.js 22+, pnpm 9+
- Docker + Docker Compose (for local PostgreSQL)
- A Supabase project (for auth and managed PostgreSQL)

## How to run locally

### 1. Start local services

```bash
docker-compose up -d    # starts PostgreSQL on localhost:5432
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env — fill in DATABASE_URL, SUPABASE_URL, etc.
```

### 3. Start the backend

```bash
cd backend
./mvnw spring-boot:run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
# Health at http://localhost:8080/actuator/health
```

### 4. Configure frontend

```bash
cd artifacts/frontend
cp .env.example .env.local
# Edit .env.local — fill in VITE_API_BASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

### 5. Start the frontend

```bash
cd artifacts/frontend
pnpm dev
# App available at http://localhost:5173
```

## How to run tests

```bash
# Backend — all tests (unit + integration via Testcontainers)
cd backend && ./mvnw verify

# Backend — unit tests only (faster)
cd backend && ./mvnw test

# Frontend — unit tests
cd artifacts/frontend && pnpm test

# Frontend — end-to-end tests
cd artifacts/frontend && pnpm test:e2e
```

## How to apply migrations

Flyway migrations run automatically on startup in all environments.

```bash
# Apply manually (dev only)
cd backend && ./mvnw flyway:migrate

# Check migration status
cd backend && ./mvnw flyway:info
```

Migration files live in `backend/src/main/resources/db/migration/`.

## How to create development seed data

```bash
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev,seed
```

The `seed` profile loads `DataSeeder.java` and inserts sample questions, skills, and a test user.

## Environment variables

See `backend/.env.example` and `artifacts/frontend/.env.example`.

Never commit real secrets.

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | Vision, scope, metrics |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architecture overview and diagrams |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Local development guide |
| [`docs/TESTING.md`](docs/TESTING.md) | Testing strategy and how to run tests |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Deployment to Vercel, Render, Supabase |
| [`docs/API.md`](docs/API.md) | API conventions and endpoint reference |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Database schema and entity descriptions |
| [`docs/GAME_RULES.md`](docs/GAME_RULES.md) | XP, streaks, leveling formulas |
| [`docs/LEARNING_ENGINE.md`](docs/LEARNING_ENGINE.md) | Session generation algorithm |
| [`docs/RUNBOOK.md`](docs/RUNBOOK.md) | Operational procedures and incident response |
| [`AGENTS.md`](AGENTS.md) | AI agent instructions |
