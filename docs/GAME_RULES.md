# Game Rules — DevLeap

This document defines the gamification rules precisely. All formulas are centralized in the `gamification` module. Do not distribute these calculations across unrelated parts of the codebase.

## XP calculation

### Per session

```
session_xp = base_xp + accuracy_bonus + streak_bonus
```

| Component | Formula | Notes |
|-----------|---------|-------|
| `base_xp` | `10 × number_of_questions_in_session` | Fixed per question |
| `accuracy_bonus` | `floor(base_xp × accuracy_rate × 0.5)` | `accuracy_rate` = correct / total |
| `streak_bonus` | `floor(base_xp × min(current_streak, 30) × 0.01)` | Capped at 30-day streak |

**Example**: Session with 10 questions, 8 correct, 7-day streak:
- `base_xp` = 100
- `accuracy_bonus` = floor(100 × 0.8 × 0.5) = 40
- `streak_bonus` = floor(100 × 7 × 0.01) = 7
- Total: **147 XP**

These formulas are configurable via Spring application properties (`devlearn.gamification.*`). Do not hardcode the multipliers in business logic — inject them.

### Idempotency

XP is recorded in `experience_transactions` with an `idempotency_key`:
- Format: `session:{session_id}:complete`
- Inserting a duplicate key is rejected at the database level (UNIQUE constraint).
- The use case checks for the existing key before inserting.

XP is granted **exactly once** per session, regardless of how many times the completion endpoint is called.

### Duplicate grant prevention

```java
// Pseudocode — see GamificationService.java
if (xpLedger.existsByIdempotencyKey(key)) {
    return existingTransaction(key); // no double-grant
}
xpLedger.record(userId, sessionId, amount, key);
```

## Leveling

Levels are derived from total XP using a configurable threshold table. Level formulas are simple in the MVP and may be evolved later.

```
XP required for level N = 100 × N × (N + 1) / 2
```

| Level | XP required | Cumulative XP |
|-------|-------------|--------------|
| 1 | 100 | 100 |
| 2 | 300 | 400 |
| 3 | 600 | 1000 |
| 4 | 1000 | 2000 |
| 5 | 1500 | 3500 |

`users.level` is updated after each XP grant. The level calculation is centralized in `GamificationPolicy.levelForXp(int totalXp)`.

## Daily streaks

### Rules

1. A streak is maintained by completing **at least one session per calendar day** in the user's local timezone (as recorded by the session timestamp in the backend).
2. When the user completes a session:
   - If `last_session_date` = today: **no change** (streak already updated today).
   - If `last_session_date` = yesterday: **increment** `current_streak` by 1.
   - Otherwise: **reset** `current_streak` to 1.
3. `longest_streak` is updated if `current_streak` exceeds it.
4. Streak update is idempotent for multiple completions on the same day.

### Timezone handling

- Sessions are timestamped in **UTC**.
- The user's local date is determined at session start using their declared timezone preference.
- Streak comparison uses the **user's local date**, not UTC date.
- The backend stores `session_date` as a `DATE` column (local date of session start).

### Missed day grace period

MVP: No grace period. Failing to complete a session on any calendar day resets the streak to 1.
Future: A streak freeze item may be introduced.

## When a session is considered complete

A session transitions from `IN_PROGRESS` to `COMPLETED` when:
- The user explicitly calls `POST /api/v1/daily-sessions/{id}/complete`, **and**
- All `session_questions` have been answered (`answered = true`).

Attempting to complete a session with unanswered questions returns a `422 Unprocessable Entity`.

## How correct and incorrect answers affect progress

- Correct answer: mastery score for the associated skill increases.
- Incorrect answer: mastery score decreases (bounded at 0).
- Mastery score changes are proportional to question difficulty.

Mastery update formula:
```
delta = difficulty_weight × (correct ? +1 : -0.5)
new_mastery = clamp(old_mastery + delta, 0, 100)
```

`difficulty_weight` values (configurable):
| Difficulty | Weight |
|------------|--------|
| 1 | 2 |
| 2 | 3 |
| 3 | 5 |
| 4 | 8 |
| 5 | 13 |

## Daily limits

MVP: One session per day. A second call to `POST /api/v1/daily-sessions` on the same day returns the existing `IN_PROGRESS` or `COMPLETED` session.

Future: Multiple sessions per day may be introduced (e.g. bonus sessions after the daily session is completed).

## Session replay protection

Completed sessions cannot receive new answers. `POST /api/v1/daily-sessions/{id}/answers` on a `COMPLETED` session returns `409 Conflict`.
