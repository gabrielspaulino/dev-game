# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — Stage 0 (Foundation)

- Full-stack Next.js 15 project with TypeScript strict mode and App Router
- Modular-monolith folder structure with `src/modules/` domain boundaries
- `AGENTS.md` with permanent AI-agent rules
- All initial documentation (`docs/`)
- Architecture Decision Records (ADRs 0001–0008)
- Drizzle ORM + drizzle-kit configured with PostgreSQL
- Docker Compose for local PostgreSQL
- Environment variable validation with Zod
- `.env.example` with all required variables documented
- ESLint + Prettier + EditorConfig
- Vitest for unit tests + React Testing Library
- Playwright for end-to-end test foundation
- dependency-cruiser for architectural boundary checks
- GitHub Actions CI pipeline
- `GET /api/v1/health` public endpoint
- Minimal home page displaying API health status
- Structured logging with pino
- Correlation ID support
- Typed domain error classes
- `Clock` port for testable time-dependent logic
- Vercel configuration
