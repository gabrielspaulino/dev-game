# Testing Guide

## Philosophy

- Tests protect the business rules and the user experience.
- Tests document intended behavior.
- A test that is deleted or weakened is a regression waiting to happen.
- All significant behavior must be covered: happy paths, edge cases, error paths.

## Test Stack

| Type | Tool | Location |
|------|------|----------|
| Unit | Vitest | `src/**/*.test.ts(x)` |
| Component | Vitest + React Testing Library | `src/**/*.test.tsx` |
| Integration | Vitest + PostgreSQL | `tests/integration/` |
| Architecture | dependency-cruiser | `tests/architecture/` |
| E2E | Playwright | `tests/e2e/` |

## Running Tests

```bash
# Unit tests (fast)
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# End-to-end (requires running app)
npm run test:e2e

# Architecture checks
npm run test:arch
```

## Unit Tests

Test domain rules and application use cases in isolation. No database, no HTTP, no framework.

Location: `src/modules/<name>/domain/*.test.ts` and `src/modules/<name>/application/*.test.ts`

### What to test

- XP calculation rules
- Level calculation from total XP
- Streak logic (increment, reset, grace period)
- Mastery score calculations
- Session question-selection policies (percentages)
- Idempotency key generation
- Clock-dependent behavior using `FixedClock`
- Error cases and domain invariants

### Test conventions

```ts
import { describe, it, expect } from "vitest";
import { FixedClock } from "@/shared/domain/clock";

describe("StreakService", () => {
  it("increments the streak when the user completes a session today", () => {
    const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
    // ...
  });

  it("resets the streak when more than one day has elapsed", () => {
    // ...
  });
});
```

## Component Tests

Test React component behavior: rendering, form validation, loading/error/empty states, user interactions.

Location: Co-located with components (`src/components/Foo.test.tsx`) or `src/app/**/*.test.tsx`.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionCard } from "./QuestionCard";

it("displays the explanation after submitting an answer", async () => {
  const user = userEvent.setup();
  render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} />);
  await user.click(screen.getByRole("button", { name: /Option A/ }));
  expect(screen.getByText(/Explanation/)).toBeInTheDocument();
});
```

## Integration Tests

Test repository adapters against a real PostgreSQL database.

Location: `tests/integration/`

Use **Testcontainers** when supported, or point at a dedicated test database.

### What to test

- Repository CRUD operations
- Migration correctness
- Unique constraints and idempotency keys
- Transaction atomicity
- Duplicate-session prevention
- Duplicate-XP prevention

### Test isolation

Each test must:
- Run migrations before the suite.
- Clear relevant tables between tests (not truncate everything blindly — be targeted).
- Not depend on data left by another test.

## Architecture Tests

Run `npm run test:arch` to check module boundaries using dependency-cruiser.

This enforces:
- No circular dependencies.
- Domain must not depend on infrastructure.
- Domain must not import Next.js.
- No undocumented cross-module dependencies.

## End-to-End Tests

Location: `tests/e2e/`

Playwright tests cover critical user flows:
1. Authentication (registration, login, logout)
2. Onboarding (learning path selection)
3. Placement test flow
4. Starting a daily session
5. Answering questions and viewing explanations
6. Completing a session and viewing results
7. Viewing updated XP, streak, and skill progress
8. Admin panel access control

Use a controlled test environment — do not run E2E tests against production.

## Policy Against Deleting or Weakening Tests

These actions are **prohibited without explicit authorization**:
- Deleting a test to make the build pass
- Skipping a test with `it.skip`, `test.only`, or config exclusions
- Weakening an assertion (`expect(x).toBeDefined()` when `expect(x).toBe("value")` was passing)
- Modifying a valid test to accept incorrect behavior

When a test becomes genuinely obsolete:
- Explain why the behavior it tested no longer applies.
- Replace it with tests for the new behavior.

## Flaky Tests

- Investigate flaky tests — do not mark them as skip.
- Common causes: time-dependent code (use `FixedClock`), randomness (use controlled selectors), race conditions (use `waitFor` in RTL, retry in Playwright).
- Document the fix.

## Test Data Strategy

- Use factories or builders to create test entities.
- Prefer explicit, meaningful test values over random data.
- Use `FixedClock` for all time-dependent tests.
- Use controlled question selectors for session-assembly tests.
- Never use production data in tests.
