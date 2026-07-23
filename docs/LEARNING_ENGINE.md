# Learning Engine

## Study Track Selection (Client-Side — Current)

Before any learning begins, users select a study track. The current client-side implementation supports three tracks:

- **Systems Design** — 15 questions covering distributed systems fundamentals
- **Java** — 15 questions covering OOP, collections, concurrency, and patterns
- **JavaScript** — 15 questions covering closures, async, prototypes, and ES6+

Each track has a pool of questions. The daily quiz draws 5 questions per day using a deterministic date-based seed. Selection is stored in `localStorage` and can be changed from the dashboard.

This client-side model will be replaced by the server-side selection pipeline as the backend matures.

## Skill Hierarchy

Skills form a tree via `parent_skill_id`:

```
Category (e.g., "JavaScript")
  └── Skill (e.g., "Closures")
        └── Sub-skill (e.g., "Lexical Scope")
```

Each skill has a unique `code`, a `category`, and an `is_active` flag. Questions are linked to skills through the `question_skills` join table, with roles (PRIMARY, SECONDARY, CONTEXT) and weights.

## Questions and Versioning

### Question Types

| Type                  | Evaluation                     |
| --------------------- | ------------------------------ |
| SINGLE_CHOICE         | Exactly one correct option     |
| MULTIPLE_CHOICE       | Set comparison of selected IDs |
| TRUE_FALSE            | Single correct option          |
| CODE_OUTPUT           | Single correct option          |
| BUG_IDENTIFICATION    | Single correct option          |
| ORDERING              | Exact sequence match           |
| CODE_COMPLETION       | Single correct option          |
| ARCHITECTURE_SCENARIO | Single correct option          |

### Difficulty vs Reasoning Level

These are independent axes:

| Difficulty | Numeric | Description             |
| ---------- | ------- | ----------------------- |
| EASY       | 1       | Introductory concepts   |
| MEDIUM     | 2       | Working knowledge       |
| HARD       | 3       | Advanced application    |
| EXPERT     | 4       | Expert-level challenges |

| Reasoning Level | Description                          |
| --------------- | ------------------------------------ |
| RECOGNIZE       | Recall or identify a fact            |
| APPLY           | Use knowledge in a standard context  |
| ANALYZE         | Break down and reason about behavior |
| COMBINE         | Synthesize multiple concepts         |

A question can be EASY+ANALYZE or HARD+RECOGNIZE — they measure different things.

### Immutable Versions

Questions use immutable versioning:

- Each edit creates a new `question_version` with an incremented `version_number`.
- `questions.current_version_number` points to the latest version.
- `correct_answer` is stored in `question_versions` and never exposed to the client.
- Sessions pin the exact version seen by the user via `quiz_session_questions.question_version_id`.

### Question Families

`question_families` groups questions that test the same concept with different wording. This enables variant rotation and prevents the same concept from appearing twice in a session.

## Mastery Calculation

`mastery` is a per-skill score from 0 to 100. Defined in `MasteryConfig` (`src/modules/progress/domain/mastery.ts`).

### Per-Skill Difficulty Adaptation

Mastery bands map to target difficulty for question selection:

| Mastery | Band       | Target Difficulty |
| ------- | ---------- | ----------------- |
| 0–29    | Beginner   | EASY              |
| 30–49   | Developing | MEDIUM            |
| 50–69   | Competent  | HARD              |
| 70–84   | Proficient | EXPERT            |
| 85–100  | Advanced   | EXPERT            |

The selection pipeline uses `getTargetDifficulty(mastery)` to match candidates.

### Mastery updates

**Correct answer:**

```
gain = baseGain + numericDifficulty × difficultyGainMultiplier
if hint used: gain *= (1 - hintPenaltyPercent / 100)
if challenge: gain *= (1 + challengeBonusPercent / 100)
mastery = min(100, mastery + round(gain))
```

**Incorrect answer:**

```
loss = baseLoss + numericDifficulty × difficultyLossMultiplier
mastery = max(0, mastery - round(loss))
```

Default values:

- `baseGain` = 5, `baseLoss` = 3
- `difficultyGainMultiplier` = 0.5, `difficultyLossMultiplier` = 0.3
- `hintPenaltyPercent` = 30, `challengeBonusPercent` = 25

### Recency decay

Mastery decays when skills are not reviewed:

- `recencyDecayPerDay` = 0.5
- `maxRecencyDecay` = 15

## Selection Pipeline

The question selection pipeline assembles sessions through six stages:

```
SessionPlanner → CandidateQuery → EligibilityFilter → Ranking → DiversitySelection → SessionPersistence
```

### 1. Session Planner (`session-planner.ts`)

Creates a `SessionPlan` with the target question count and mix policy:

| Category      | Target % | Source                                              |
| ------------- | -------- | --------------------------------------------------- |
| Review        | 40%      | Questions due for spaced review                     |
| Current level | 30%      | Questions matching user's current mastery band      |
| New content   | 20%      | Questions the user has never seen                   |
| Challenge     | 10%      | Questions above the user's current difficulty level |

### 2. Candidate Query (`ports.ts` → `QuestionCandidateRepository`)

Fetches published questions by skill or lesson. Returns `QuestionCandidate` objects with metadata needed for ranking.

### 3. Eligibility Filtering (`eligibility.ts`)

Removes candidates that are:

- Recently answered (within cooldown period)
- Before their `next_eligible_at` spaced-repetition date
- Exceeding max attempts within the cooldown window

### 4. Candidate Ranking (`ranking.ts`)

Scores each candidate on five weighted dimensions:

| Dimension        | Weight | Score 1.0 when...                          |
| ---------------- | ------ | ------------------------------------------ |
| Difficulty match | 0.30   | Candidate matches user's target difficulty |
| Recency          | 0.20   | Never seen or not seen in 21+ days         |
| Novelty          | 0.25   | Never attempted                            |
| Skill priority   | 0.15   | Matches a focus skill                      |
| Criticality      | 0.10   | Marked CRITICAL                            |

Each candidate also gets a `selectionReason` (NEW_CONTENT, SPACED_REVIEW, WEAK_SKILL, CHALLENGE, etc.).

### 5. Diversity Selection (`diversity.ts`)

Selects the top-scored candidates while enforcing diversity:

| Constraint          | Default Limit |
| ------------------- | ------------- |
| Max same skill      | 3             |
| Max same difficulty | 4             |
| Max same type       | 3             |

### 6. Session Persistence (`ports.ts` → `SessionPersistencePort`)

Creates the `quiz_session` and `quiz_session_questions` records. Pins each question to its current version.

### Orchestrator (`question-selection-service.ts`)

`QuestionSelectionService.assembleSession(plan, now)` ties the pipeline together. It depends on four ports (all injected):

- `QuestionCandidateRepository`
- `UserMasteryRepository`
- `UserHistoryRepository`
- `SessionPersistencePort`

## Spaced Repetition

Review scheduling uses expanding/contracting intervals, defined in `ReviewScheduleConfig` (`src/modules/progress/domain/review-scheduler.ts`).

### Default intervals

`[0, 1, 3, 7, 21]` days — the index advances on correct answers and retreats on incorrect ones.

### Interval adjustment

- **Correct:** advance index + 1, then use `extendFactor` (x1.5) once past the last interval
- **Incorrect:** retreat index - 1, then use `shortenFactor` (x0.5) for custom intervals
- **Min interval:** 1 day, **Max interval:** 60 days

Each `ReviewItem` tracks `consecutiveCorrect` and `consecutiveIncorrect` for adaptive scheduling. The `user_question_history.next_eligible_at` column stores the next review date.

## Server-Side Answer Evaluation

The client must never be trusted with:

- Whether the answer is correct
- The score
- Mastery changes
- XP
- Completion status

These values are calculated server-side using `question_versions.correct_answer`. The `evaluateAnswer()` function in `answer-evaluation.ts` receives the correct answer from the server, never from the client.

## Deterministic Tests

The selection pipeline is fully deterministic in tests. All randomness is avoided — ranking produces a stable sort by score, and diversity selection iterates in rank order.

## Algorithm Evolution

The learning engine is encapsulated behind ports. Improving the algorithm requires only:

1. Writing a new implementation of the relevant port.
2. Updating the config or weights.
3. Adding tests for the new behavior.

The domain and persistence layers are unaffected.
