# Roadmap — DevLeap

## Stage 0 — Foundation ✅

- [x] Repository structure and documentation.
- [x] Spring Boot backend skeleton with health endpoint.
- [x] React + Vite frontend scaffold with health connectivity.
- [x] Flyway configuration.
- [x] Docker Compose for local development.
- [x] GitHub Actions CI pipeline.
- [x] `AGENTS.md` with permanent rules.
- [x] All initial ADRs.

## Stage 1 — Identity and Users

- [ ] Supabase Auth integration.
- [ ] JWT validation in Spring Security.
- [ ] Internal user resolution (create on first login).
- [ ] User profile endpoint (`GET /api/v1/me`).
- [ ] USER / ADMIN roles.
- [ ] Frontend: login and registration screens.
- [ ] Frontend: authenticated routing.

## Stage 2 — Learning Catalog

- [ ] Learning path data model (migrations).
- [ ] Java Backend Developer path seed data.
- [ ] Skills and questions seed data (high-quality initial content).
- [ ] Learning path and skill endpoints.
- [ ] Admin interface: create and edit questions.
- [ ] Frontend: learning path selection.
- [ ] Frontend: question administration screen.

## Stage 3 — Daily Session

- [ ] Session assembly algorithm.
- [ ] Session persistence and resume.
- [ ] Answer recording.
- [ ] Explanation display.
- [ ] Session completion.
- [ ] Idempotency tests.
- [ ] Frontend: daily session flow.
- [ ] Frontend: answer + explanation UI.
- [ ] Frontend: session results screen.

## Stage 4 — Gamification

- [ ] XP calculation and ledger.
- [ ] Leveling system.
- [ ] Daily streaks.
- [ ] XP idempotency tests.
- [ ] Streak timezone tests.
- [ ] Frontend: XP and streak display.
- [ ] Frontend: level progress indicator.

## Stage 5 — Progress

- [ ] Skill mastery tracking.
- [ ] Spaced repetition scheduling.
- [ ] Dashboard with overview stats.
- [ ] Session history (paginated).
- [ ] Skill progress screen.
- [ ] Frontend: dashboard.
- [ ] Frontend: skill progress visualization.
- [ ] Frontend: session history.

## Stage 6 — Production Readiness

- [ ] Vercel deployment configuration.
- [ ] Render deployment configuration.
- [ ] Production environment variables documented.
- [ ] Correlation IDs in all responses.
- [ ] Rate limiting.
- [ ] Playwright e2e tests for critical flows.
- [ ] Production checklist verified.
- [ ] Runbook validated against production.

## Future (post-MVP)

- [ ] Placement test.
- [ ] Multiple learning paths.
- [ ] Competitive leaderboards.
- [ ] Achievement system.
- [ ] PWA manifest and offline support.
- [ ] Push notifications for streak reminders.
- [ ] Mobile app (React Native / Expo).
- [ ] Code execution sandbox for advanced question types.
