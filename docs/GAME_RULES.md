# Game Rules

This document defines all gamification rules. Business logic that implements these rules must live in tested domain or application services — never scattered across unrelated files.

## XP (Experience Points)

### How XP is awarded

XP is awarded per correct answer and on activity completion. All values are defined in `XpPolicyConfig` (`src/modules/gamification/domain/xp-policy.ts`).

| Action                          | XP  |
| ------------------------------- | --- |
| Correct answer (regular)        | 5   |
| Correct answer (difficulty ≥ 4) | 8   |
| Lesson completion               | 20  |
| Daily session completion        | 25  |
| Module challenge completion     | 50  |
| Course completion               | 200 |
| Perfect lesson bonus            | 15  |
| Weak-skill review bonus         | 10  |

**Modifiers:**

- **No-hint bonus:** +20% of base answer XP when no hint was used
- **Review XP multiplier:** ×0.5 for review questions (prevents XP farming)

### How XP is recorded

Every XP award creates an `ExperienceTransaction` record:

```
user_id, amount, reason, idempotency_key, created_at
```

The ledger is append-only. The user's total XP is computed as `SUM(amount)` over all transactions.

Do not maintain only a mutable total — the ledger is the source of truth.

### How duplicate XP is prevented

Each XP award has a unique `idempotency_key` (e.g., `session:{session_id}:completion`). The `ExperienceTransaction` table has a `UNIQUE(user_id, idempotency_key)` constraint. A duplicate completion request receives the same result without creating a second transaction.

## User Levels

User level is calculated from total XP using a configurable threshold table:

| Level | XP Required |
| ----- | ----------- |
| 1     | 0           |
| 2     | 100         |
| 3     | 300         |
| 4     | 600         |
| 5     | 1,000       |
| 10    | 5,000       |
| ...   | ...         |

The formula is centralized in a domain service. Thresholds are configurable without schema changes.

**Never trust a level value sent by the browser.**

## Daily Streaks

### How streaks work

A streak is the count of consecutive calendar days on which the user completed a session.

- A session completed on day N extends a streak maintained through day N-1.
- Exactly one completion per day counts toward the streak (additional completions are no-ops).
- Missing a day resets the streak to 1 on the next completion.

### Time-zone behavior

All streak calculations use the user's local date. The user's IANA time-zone identifier is stored on the user profile. Date comparisons use UTC offset from that time zone.

If no time zone is set, UTC is used.

### Idempotency

A second request to complete the same session on the same day must not increment the streak twice. The `Streak` record includes a `last_session_date` column. The streak service compares this with today's date before updating.

## Study Track Selection

Users choose a study track on first visit. Available tracks:

- **Systems Design** — distributed systems, caching, load balancing, databases
- **Java** — OOP, collections, streams, concurrency, design patterns
- **JavaScript** — closures, async/await, prototypes, event loop, ES6+

The selected track determines which question pool the daily quiz draws from. Users can change their track at any time from the dashboard.

## Daily Quiz

### When a quiz is considered complete

A daily quiz is complete when:

1. The user has answered all questions in the quiz (5 questions per day).
2. XP has been awarded and the streak updated.

### Daily limits

One quiz per user per calendar day. Completing the quiz displays the dashboard with streak encouragement until the next day.

### Question selection

Questions are selected deterministically from the track's pool using the current date as a seed. This ensures consistent daily quizzes that change each day.

## Focus Points

Focus Points gate expensive actions (advanced lessons, retry challenges, hints, skipping mandatory questions). Defined in `FocusPointsConfig` (`src/modules/gamification/domain/focus-points.ts`).

| Parameter      | Default        |
| -------------- | -------------- |
| Maximum        | 5              |
| Regen interval | 3 hours        |
| Regen amount   | 1 per interval |

Regeneration is lazy — computed on access, not via background timers.

### Recovery from reviews

Completing a review session with ≥ 4/5 correct recovers 1 Focus Point, up to 3 recoveries per day.

## Daily Limits (Free Tier)

Defined in `DailyLimitsConfig` (`src/modules/gamification/domain/daily-limits.ts`).

| Activity           | Limit     |
| ------------------ | --------- |
| Daily sessions     | 1         |
| New lessons        | 2         |
| Challenge attempts | 2         |
| Reviews            | Unlimited |
| Practice           | Unlimited |

## Sessions

### Session types

`daily`, `lesson`, `review`, `challenge`, `final_assessment`

### Session statuses

`ACTIVE` → `COMPLETED` or `EXPIRED` or `ABANDONED`

### Session size

| Type          | Questions |
| ------------- | --------- |
| Daily session | 10        |
| Lesson        | 5–8       |

### Session expiry

Sessions expire after 7 days of inactivity.

### When a session is considered complete

A session is complete when all questions have been answered and the completion endpoint is called.

## Question Types

Six question types are supported (`src/modules/questions/domain/question.ts`):

- `multiple-choice` — single correct answer
- `multiple-correct` — multiple correct answers
- `code-output` — predict code output
- `bug-identification` — find the bug
- `architecture-scenario` — system design decisions
- `ordering` — arrange items in correct order

Difficulty ranges from 1 (introductory) to 5 (expert). Questions with difficulty ≥ 4 are "difficult" and earn higher XP.

## Correctness Calculation

Correctness is always calculated server-side (`src/modules/questions/domain/answer-evaluation.ts`). The server knows the correct option(s) for each question. The client must never send a `correct: true` field.

## Progress Effect

A correct answer increases mastery for the associated skill. An incorrect answer decreases mastery (within bounds). The exact delta is defined in `docs/LEARNING_ENGINE.md`.

## Lesson Completion

Lessons have a state machine: `NOT_STARTED` → `IN_PROGRESS` → `COMPLETED` or `COMPLETED_REVIEW_REQUIRED` → `MASTERED`.

- Score ≥ 70% with no critical skill failures → `COMPLETED`
- Score < 70% or critical skill failure → `COMPLETED_REVIEW_REQUIRED` (targeted review generated)
- `COMPLETED_REVIEW_REQUIRED` can transition back to `IN_PROGRESS` for retry

## Module Completion

A module is complete when all mandatory lessons are completed, average skill mastery ≥ 70, no skill below 50 mastery, and module challenge score ≥ 75%.

## Course Completion

A course is complete when all mandatory modules are completed, average skill mastery ≥ 70, no skill below 50 mastery, and final assessment score ≥ 75%. Mastery status requires average skill mastery ≥ 85.

## Concurrency Behavior

Session completion is protected by:

- A database transaction that updates the session status, creates the XP transaction, and updates the streak atomically.
- The idempotency key on `ExperienceTransaction` prevents duplicate XP even if the transaction is retried.

## Administrative Adjustments

Administrators may manually adjust XP by creating an `ExperienceTransaction` with `reason: "admin_adjustment"`. All adjustments are recorded in the ledger and are auditable.
