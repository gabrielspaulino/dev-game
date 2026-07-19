# Testing Strategy — DevLeap

## Testing pyramid

```
         /\
        /e2e\         Playwright — critical user flows (fewest, slowest)
       /------\
      /integr. \      Testcontainers + Spring Boot Test (medium)
     /----------\
    /  unit tests \   JUnit 5, Vitest (most, fastest)
   /--------------\
```

## Backend tests

### Unit tests

Location: `backend/src/test/java/**/*Test.java`

Coverage targets:
- All domain classes and value objects.
- All use case (application service) logic.
- Gamification calculations (XP, streaks, levels).
- Learning engine (session assembly algorithm).
- Time-sensitive logic (streaks, expiry) using injected `ClockProvider` with a fixed test clock.

Run:
```bash
cd backend && ./mvnw test
```

### Integration tests

Location: `backend/src/test/java/**/*IT.java`

Uses `@SpringBootTest` + Testcontainers (PostgreSQL container spun up automatically — no H2). Integration tests cover:
- Repository implementations.
- Full API controller tests (MockMvc).
- Flyway migration correctness.
- Security: unauthorized access returns 401, forbidden access returns 403.
- Session completion idempotency (duplicate requests should not double-grant XP).

Run:
```bash
cd backend && ./mvnw verify
```

> **Requirement**: Docker must be running for Testcontainers.

### Architecture tests (ArchUnit)

Location: `backend/src/test/java/**/arch/`

ArchUnit tests enforce:
- No domain class depends on Spring (`@Service`, `@Repository`, `@Component`, etc.).
- No domain class depends on JPA (`jakarta.persistence.*`).
- Controllers do not access repositories directly.
- Cross-module dependencies follow the allowed dependency graph.

These tests run as part of `mvn test` and fail the build if boundaries are violated.

### Migration tests

Location: `backend/src/test/java/**/migration/`

A dedicated test verifies that all Flyway migrations apply successfully against a clean Testcontainers database. This catches SQL syntax errors and data type issues before they reach production.

### Idempotency tests

Specific tests verify:
- Completing the same session twice grants XP exactly once.
- Updating a streak on the same day updates exactly once.
- Concurrent session completion requests do not double-grant XP (uses optimistic locking or DB unique constraints).

## Frontend tests

### Component tests

Location: `artifacts/frontend/src/**/*.test.tsx`

Framework: Vitest + React Testing Library.

Coverage targets:
- All reusable UI components.
- Forms (validation, submission, error states).
- Loading, error, and empty states.
- Question display and answer submission flow.

Run:
```bash
cd artifacts/frontend && pnpm test
```

### Hook tests

Location: `artifacts/frontend/src/hooks/**/*.test.ts`

Tests for custom hooks with mocked API responses.

### Validation tests

Location: `artifacts/frontend/src/lib/schemas/**/*.test.ts`

Tests for all Zod validation schemas used in forms.

## End-to-end tests

Location: `artifacts/frontend/e2e/`

Framework: Playwright.

Initial critical flows:
1. User registers and logs in.
2. User views the dashboard.
3. User starts a daily session.
4. User answers a question and sees the explanation.
5. User completes a session and sees updated XP and streak.
6. User views their skill progress.

Authentication strategy:
- E2E tests use a dedicated test user provisioned in the test environment.
- The test user's credentials are provided via environment variables (never committed).
- Tests never depend on specific question content — they assert on structural elements.

Run:
```bash
cd artifacts/frontend && pnpm test:e2e
```

## Test data strategy

- Unit tests: inline fixtures in test methods or factory methods (`UserFixtures.aUser()`).
- Integration tests: Flyway migration applies schema; test data inserted in `@BeforeEach`.
- E2E tests: dedicated test user provisioned before the test suite.
- Development: `seed` Spring profile loads realistic sample data.

## Policy against improper test removal

- Never delete a test to make the build pass.
- Never disable a test with `@Disabled`, `.skip`, or comment-out without written justification.
- Never weaken an assertion to accept incorrect behavior.
- Never modify a valid test to hide a regression.
- When intentional behavior changes, update the test and document the reason in the commit message.
- Every bug fix must include a regression test.

## Running the full verification suite

```bash
# Backend: unit + integration + architecture + migration
cd backend && ./mvnw verify

# Frontend: lint + typecheck + unit tests
cd artifacts/frontend && pnpm lint && pnpm typecheck && pnpm test

# E2E (requires running backend + frontend)
cd artifacts/frontend && pnpm test:e2e
```
