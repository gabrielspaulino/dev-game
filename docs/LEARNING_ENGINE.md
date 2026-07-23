# Learning Engine

## Study Track Selection (Client-Side — Current)

Before any learning begins, users select a study track. The current client-side implementation supports three tracks:

- **Systems Design** — 15 questions covering distributed systems fundamentals
- **Java** — 15 questions covering OOP, collections, concurrency, and patterns
- **JavaScript** — 15 questions covering closures, async, prototypes, and ES6+

Each track has a pool of questions. The daily quiz draws 5 questions per day using a deterministic date-based seed (ensuring the same quiz for the same day, but different questions each day). Selection is stored in `localStorage` and can be changed from the dashboard.

This client-side model will be replaced by server-side study tracks when Stages 2–3 are implemented.

## Skill Representation

Each `Skill` belongs to a `Lesson`, which belongs to a `LearningModule`, which belongs to a `LearningPath`.

```
LearningPath → LearningModule → Lesson → Skill
```

A `Skill` has a `difficulty` rating (1–5) and is associated with questions through the `QuestionSkill` join table.

## Questions and Skills

A `Question` may test multiple skills (many-to-many via `QuestionSkill`). When a question is answered, mastery is updated for all associated skills.

## Difficulty Levels

Questions have a `difficulty` value from 1 (introductory) to 5 (expert).

## Mastery Calculation

`UserSkillProgress.mastery` is a score from 0 to 100.

### Mastery updates (Stage 5)

| Event            | Effect                                       |
| ---------------- | -------------------------------------------- |
| Correct answer   | `mastery = min(100, mastery + MASTERY_GAIN)` |
| Incorrect answer | `mastery = max(0, mastery - MASTERY_LOSS)`   |

Default constants (configurable, not hardcoded):

- `MASTERY_GAIN` = 5
- `MASTERY_LOSS` = 3

### Mastery tiers

| Mastery | Label      |
| ------- | ---------- |
| 0–30    | Novice     |
| 31–60   | Developing |
| 61–85   | Proficient |
| 86–100  | Expert     |

## Session Assembly

Daily sessions are assembled from the question bank using a configurable mix policy.

### Question mix (configurable, not scattered in code)

| Category      | Target % | Source                                                        |
| ------------- | -------- | ------------------------------------------------------------- |
| Review        | 40%      | Questions the user has seen, with low or declining mastery    |
| Current level | 30%      | Questions matching the user's current skill level             |
| New content   | 20%      | Questions the user has not seen before                        |
| Challenge     | 10%      | Questions one difficulty level above the user's current level |

These percentages are centralized in a single `SessionAssemblyPolicy` configuration object. Changing them requires only editing the config, not hunting through multiple files.

### Question selection

Within each category, questions are selected using a controlled `QuestionSelector` port. The production implementation shuffles and samples. Tests use a deterministic implementation (no randomness).

### Constraints

- A question must not appear twice in the same session.
- The same question must not appear in two consecutive days of sessions.
- Sessions are assembled and persisted before the user sees any questions. Questions do not change after the session starts.

### Duplicate session prevention

At most one active session per user per calendar day. A second creation request returns the existing session. Protected by a `UNIQUE(user_id, session_date)` constraint.

## Placement Test

The placement test is a short assessment (10–20 questions across all skills and difficulty levels) that establishes an initial mastery score for each skill.

- Questions are selected to cover all skills in the chosen learning path.
- The user's answers update `UserSkillProgress.mastery` for each skill.
- The placement test skips skills the user already has evidence for.
- After the placement test, the first daily session is assembled based on the results.

## Spaced Repetition

Questions that the user answered incorrectly, or that have low mastery, are prioritized in the "Review" category.

The review scheduling algorithm in the MVP is simple:

1. Questions with the lowest mastery score are reviewed first.
2. Questions not seen in the longest time are reviewed next within the same mastery tier.

A more sophisticated SRS algorithm (SM-2 or similar) can be implemented later by replacing the `QuestionSelector` without changing the domain.

## Deterministic Tests

The session assembly algorithm is fully deterministic in tests. Inject a `FixedClock` and a deterministic `QuestionSelector` (one that returns questions in a fixed order) to produce reproducible results.

## Algorithm Evolution

The learning engine is encapsulated behind the `SessionAssembler` application service and the `QuestionSelector` port. Improving the algorithm requires only:

1. Writing a new `QuestionSelector` implementation.
2. Updating the assembly policy.
3. Adding tests for the new behavior.

The domain and persistence layers are unaffected.
