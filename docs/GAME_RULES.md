# Game Rules

This document defines all gamification rules. Business logic that implements these rules must live in tested domain or application services — never scattered across unrelated files.

## XP (Experience Points)

### How XP is awarded

XP is awarded when a daily session is completed.

**Base formula (configurable, Stage 4):**

```
session_xp = correct_answers × XP_PER_CORRECT_ANSWER
           + (is_perfect_session ? XP_PERFECT_BONUS : 0)
```

Default values (subject to tuning):

- `XP_PER_CORRECT_ANSWER` = 10
- `XP_PERFECT_BONUS` = 50

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

## Daily Sessions

### When a session is considered complete

A daily session is complete when:

1. The user has answered all questions in the session.
2. The application has processed the answers server-side.
3. The `complete` endpoint has been called and has succeeded.

### Daily limits

One session per user per calendar day (in the user's time zone). Attempting to create a second session returns the existing one.

### Session retries

An incomplete session can be resumed. Answers are recorded as the user submits them. The session is complete only when all questions have been answered and the completion endpoint is called.

## Correctness Calculation

Correctness is always calculated server-side. The server knows the correct option(s) for each question. The client must never send a `correct: true` field.

## Progress Effect

A correct answer increases mastery for the associated skill. An incorrect answer decreases mastery (within bounds). The exact delta is defined in `docs/LEARNING_ENGINE.md`.

## Concurrency Behavior

Session completion is protected by:

- A database transaction that updates the session status, creates the XP transaction, and updates the streak atomically.
- The idempotency key on `ExperienceTransaction` prevents duplicate XP even if the transaction is retried.

## Administrative Adjustments

Administrators may manually adjust XP by creating an `ExperienceTransaction` with `reason: "admin_adjustment"`. All adjustments are recorded in the ledger and are auditable.
