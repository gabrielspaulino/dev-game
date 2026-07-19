# Data Model — DevLeap

## Entity overview

DevLeap uses PostgreSQL. The schema is managed exclusively by Flyway migrations.

All entities use UUID primary keys to avoid coupling to database sequences and to allow future distribution.

## Entity-relationship diagram

```mermaid
erDiagram
    users {
        uuid id PK
        varchar external_id UK "Supabase user sub"
        varchar email UK
        varchar display_name
        varchar avatar_url
        varchar role "USER | ADMIN"
        int total_xp
        int level
        timestamp created_at
        timestamp updated_at
    }

    learning_paths {
        uuid id PK
        varchar slug UK
        varchar title
        text description
        boolean active
        timestamp created_at
    }

    skills {
        uuid id PK
        uuid learning_path_id FK
        varchar slug UK
        varchar title
        text description
        int display_order
        boolean active
        timestamp created_at
    }

    questions {
        uuid id PK
        uuid skill_id FK
        varchar type "MULTIPLE_CHOICE | CODE_OUTPUT | BUG_IDENTIFICATION"
        text content
        text explanation
        int difficulty "1-5"
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    question_options {
        uuid id PK
        uuid question_id FK
        text content
        boolean correct
        int display_order
    }

    daily_sessions {
        uuid id PK
        uuid user_id FK
        date session_date
        varchar status "IN_PROGRESS | COMPLETED | EXPIRED"
        int total_questions
        int correct_answers
        int xp_earned
        timestamp started_at
        timestamp completed_at
        timestamp created_at
    }

    session_questions {
        uuid id PK
        uuid session_id FK
        uuid question_id FK
        int display_order
        boolean answered
        timestamp created_at
    }

    user_answers {
        uuid id PK
        uuid session_question_id FK
        uuid selected_option_id FK
        boolean correct
        int time_taken_ms
        timestamp answered_at
    }

    user_skill_progress {
        uuid id PK
        uuid user_id FK
        uuid skill_id FK
        int mastery_score "0-100"
        int questions_seen
        int correct_answers
        timestamp last_seen_at
        timestamp next_review_at "spaced repetition"
        timestamp updated_at
        UK "user_id, skill_id"
    }

    experience_transactions {
        uuid id PK
        uuid user_id FK
        uuid session_id FK
        varchar idempotency_key UK
        int amount
        varchar reason "SESSION_COMPLETE | STREAK_BONUS | ..."
        timestamp created_at
    }

    streaks {
        uuid id PK
        uuid user_id FK UK "one per user"
        int current_streak
        int longest_streak
        date last_session_date
        timestamp updated_at
    }

    users ||--o{ daily_sessions : "has"
    users ||--o{ user_skill_progress : "tracks"
    users ||--o{ experience_transactions : "earns"
    users ||--|| streaks : "has"
    learning_paths ||--o{ skills : "contains"
    skills ||--o{ questions : "has"
    questions ||--o{ question_options : "has"
    daily_sessions ||--o{ session_questions : "contains"
    session_questions ||--o| user_answers : "answered_by"
    skills ||--o{ user_skill_progress : "measured_by"
```

## Entity descriptions

### users
The internal user account, created on first login after JWT validation. `external_id` links to Supabase's user sub. `total_xp` and `level` are denormalized from `experience_transactions` for fast reads.

### learning_paths
A curated curriculum (e.g. "Java Backend Developer"). Multiple paths may exist; users enroll in one.

### skills
A discrete topic within a learning path (e.g. "Spring Boot"). Ordered by `display_order`.

### questions
A single practice question. Type determines the interaction model. `difficulty` (1–5) influences question selection.

### question_options
The choices for a question. Exactly one option is `correct=true`. Wrong options serve as distractors.

### daily_sessions
A daily practice session. One `IN_PROGRESS` session is allowed per user per day. Sessions cannot be replayed after `COMPLETED`.

### session_questions
The specific questions included in a session, in display order. Pre-persisted when the session is created so it does not change mid-session.

### user_answers
Records each answer submitted in a session. Linked to `session_questions`, not questions directly, to preserve session context.

### user_skill_progress
Tracks mastery (0–100) per user per skill. Used by the learning engine to select review vs. new content. `next_review_at` drives spaced repetition scheduling.

### experience_transactions
Immutable XP ledger. Each grant has an `idempotency_key` (e.g. `session:{session_id}:complete`) to prevent duplicate grants. `total_xp` in `users` is the sum of all transactions.

### streaks
One row per user. Streak logic: if `last_session_date = today - 1 day`, increment; if `last_session_date = today`, no change; otherwise reset to 1.

## Domain vs. persistence models

JPA entities (suffix `JpaEntity`) are kept strictly in `adapter/out/persistence/`. They are never returned from use cases or exposed through controllers.

Domain entities (in `domain/`) contain business rules and use value objects for type safety (e.g. `MasteryScore`, `DifficultyLevel`). They are mapped from/to JPA entities by adapter mappers.

Controllers receive and return DTOs (records in `adapter/in/web/dto/`).

This separation is documented in ADR-0002.

## Auditing

`created_at` and `updated_at` columns are set automatically. The backend uses a JPA `@EntityListeners` auditing setup. Timestamp resolution is UTC.

## Indexes

Key indexes (defined in Flyway migrations):
- `users(external_id)` — fast JWT → internal user lookup
- `daily_sessions(user_id, session_date)` — get today's session
- `user_skill_progress(user_id, skill_id)` — get skill state for session assembly
- `experience_transactions(idempotency_key)` — duplicate prevention
