# Roadmap

## Stage 0 — Foundation ✅

**Goal:** Establish the project structure, toolchain, and developer experience.

- [x] Full-stack Next.js 15 project with TypeScript strict mode
- [x] Modular-monolith folder structure
- [x] `AGENTS.md` with AI-agent rules
- [x] All initial documentation
- [x] Architecture Decision Records (0001–0008)
- [x] Drizzle ORM + PostgreSQL
- [x] Docker Compose for local PostgreSQL
- [x] Environment variable validation
- [x] ESLint + Prettier + EditorConfig
- [x] Vitest + React Testing Library + Playwright
- [x] dependency-cruiser for architectural checks
- [x] GitHub Actions CI pipeline
- [x] `GET /api/v1/health`
- [x] Minimal home page
- [x] Vercel configuration

## Stage 1 — Identity and Users

**Goal:** Users can register, log in, and have an internal profile.

- [ ] Supabase Auth integration
- [ ] `IdentityProvider` port and `SupabaseIdentityProvider` adapter
- [ ] Internal user creation on first login
- [ ] User roles (USER, ADMIN)
- [ ] Server-side authorization middleware
- [ ] `GET /api/v1/me`
- [ ] Unit and integration tests
- [ ] E2E: registration and login flow

## Stage 2 — Learning Catalog

**Goal:** Learning paths, skills, and questions exist in the database.

- [ ] `LearningPath`, `LearningModule`, `Lesson`, `Skill` schema
- [ ] `Question`, `QuestionOption`, `QuestionSkill` schema
- [ ] Seed data: Java Backend Developer learning path
- [ ] Seed data: 30–50 high-quality questions
- [ ] Minimal admin UI for question management
- [ ] API endpoints for listing learning paths and skills
- [ ] Unit and integration tests

## Stage 3 — Daily Sessions

**Goal:** Users can start, answer, and complete a daily learning session.

- [ ] `DailySession`, `SessionQuestion`, `UserAnswer` schema
- [ ] Session generation use case with question selection policy
- [ ] Resume interrupted sessions
- [ ] `POST /api/v1/daily-sessions`
- [ ] `POST /api/v1/daily-sessions/{id}/answers`
- [ ] `POST /api/v1/daily-sessions/{id}/complete`
- [ ] Idempotency and concurrency protection
- [ ] Session UI: questions, explanations, progress indicator
- [ ] Unit and integration tests

## Stage 4 — Gamification

**Goal:** Users earn XP, have levels, and maintain streaks.

- [ ] `ExperienceTransaction` ledger schema
- [ ] `Streak` schema
- [ ] XP award on session completion (with idempotency)
- [ ] Level calculation from total XP
- [ ] Streak update on session completion
- [ ] Time-zone-aware streak calculation
- [ ] XP and level display on dashboard
- [ ] Unit tests for all gamification rules

## Stage 5 — Progress and Learning Engine

**Goal:** Users see their progress and sessions adapt to their skill level.

- [ ] `UserSkillProgress` schema
- [ ] Mastery calculation on answer
- [ ] Spaced repetition in question selection
- [ ] Placement test
- [ ] Dashboard: XP, level, streak, skill mastery overview
- [ ] Session history
- [ ] Session summary (results, XP earned, skills improved)
- [ ] Progress visualization
- [ ] Unit and integration tests

## Stage 6 — Production Readiness

**Goal:** The application is safe, observable, and documented for production.

- [ ] Vercel production configuration finalized
- [ ] Supabase production project configured
- [ ] Database connection pooling verified
- [ ] Controlled migration process documented and tested
- [ ] Structured logging with correlation IDs throughout
- [ ] Error monitoring integration (Sentry or equivalent)
- [ ] Security hardening (rate limiting, payload limits, CSP)
- [ ] Performance review
- [ ] Runbook updated with production experience
- [ ] Production checklist completed
