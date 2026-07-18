# Learning Engine — DevLeap

This document describes how questions are selected, how skills are represented, how mastery is measured, and how daily sessions are assembled.

## Question selection algorithm

Daily sessions are assembled by `SessionAssemblyService` in the `sessions` module. The algorithm is configurable and testable through a `SessionCompositionPolicy` interface.

### Session composition

A session contains `N` questions (default: 10, configurable via `devlearn.session.question-count`), assembled from four buckets:

| Bucket | Default % | Description |
|--------|-----------|-------------|
| **Review** | 40% | Questions for skills with low mastery or past-due `next_review_at` |
| **Current level** | 30% | Questions at the user's current skill level |
| **New content** | 20% | Questions from skills the user hasn't seen yet |
| **Challenge** | 10% | Questions above the user's current level |

These percentages are defined as a `SessionCompositionPolicy` and injected by configuration. They are easily modified or tested with alternative policies.

### Overrepetition prevention

Questions seen in the last 3 sessions are excluded from selection unless no other questions are available. This threshold is configurable (`devlearn.session.repetition-cooldown-sessions`).

### Deterministic selection for testing

`SessionAssemblyService` accepts a `Randomizer` port. The production implementation uses a seeded random. Tests inject a `FixedOrderRandomizer` that selects questions in a predictable order.

## Skill representation

A **skill** is a discrete topic within a learning path (e.g. "Spring Boot", "SQL", "Concurrency").

Each user has a `UserSkillProgress` record per skill that tracks:
- `mastery_score`: 0–100, representing how well the skill is known.
- `questions_seen`: total questions encountered for this skill.
- `correct_answers`: total correct answers for this skill.
- `last_seen_at`: when the user last answered a question for this skill.
- `next_review_at`: the scheduled date for the next spaced repetition review.

## Skill mastery measurement

Mastery is a 0–100 score. It increases with correct answers and decreases with wrong answers, weighted by question difficulty. See `docs/GAME_RULES.md` for the formula.

Mastery thresholds:
| Score | Status |
|-------|--------|
| 0–39 | Needs work |
| 40–69 | Learning |
| 70–89 | Proficient |
| 90–100 | Mastered |

A skill is considered "mastered" when `mastery_score >= 90` and at least 20 questions have been seen.

## Spaced repetition

DevLeap uses a simplified SM-2-inspired algorithm for scheduling reviews.

After answering a question for a skill, `next_review_at` is updated:
```
interval = base_interval × ease_factor ^ repetition_count
next_review_at = now + interval
```

For the MVP, values are simplified:
- `base_interval` = 1 day (correct answer) or 0 days (wrong answer — review tomorrow)
- `ease_factor` = 1.5 (configurable)
- `repetition_count` = number of consecutive correct answers

This is tracked at the **skill** level (not individual question level) in the MVP.

## Placement test

The placement test is a special session type that:
1. Presents 15 questions spanning all skills in the learning path.
2. Uses difficulty 2–3 questions to quickly calibrate the user's level.
3. On completion, sets the initial `mastery_score` for each skill based on the test results.
4. Is taken only once per learning path enrollment.

Algorithm:
```
initial_mastery = (correct_in_skill / questions_in_skill) × 70
```
Max initial mastery from placement: 70 (prevents skipping review immediately).

## Daily session assembly — step by step

```
1. Load user's UserSkillProgress for all skills in the enrolled path.
2. Identify skills due for review (next_review_at <= today).
3. Select review questions (40% of target count) from due skills.
4. Select current-level questions (30%) from the user's active skill.
5. Select new questions (20%) from skills with mastery_score = 0.
6. Select challenge questions (10%) from skills above current level.
7. Shuffle questions within each bucket.
8. Exclude questions seen in recent sessions (cooldown period).
9. Persist selected questions as SessionQuestion records.
10. Return the assembled session.
```

The algorithm is encapsulated in `SessionAssemblyService` and tested independently of HTTP or persistence concerns.

## Resume capability

If a user has an `IN_PROGRESS` session from today, `GET /api/v1/daily-sessions/current` returns it. The client resumes from the last unanswered question. Session questions are pre-persisted at session creation — the set does not change.

## Algorithm evolution

This document is the authoritative description of the current algorithm. When the algorithm changes:
1. Update this document first.
2. Update `SessionCompositionPolicy` implementation.
3. Update unit tests.
4. Consider an ADR if the change is significant.

Future improvements:
- Per-question spaced repetition (SM-2 at question granularity).
- Adaptive difficulty based on recent answer patterns.
- Learning path milestone detection.
- Cross-skill knowledge graph for prerequisite ordering.
