-- V1: Initial schema for DevLeap
-- Creates the core tables required for the application.
-- All UUIDs are generated at the application level (not DB sequences)
-- to avoid coupling to database-specific identity generation.

-- ============================================================
-- Enable extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY,
    external_id     VARCHAR(255) NOT NULL UNIQUE,  -- Supabase user sub
    email           VARCHAR(255) NOT NULL UNIQUE,
    display_name    VARCHAR(255),
    avatar_url      TEXT,
    role            VARCHAR(50) NOT NULL DEFAULT 'USER'
                        CHECK (role IN ('USER', 'ADMIN')),
    total_xp        INTEGER NOT NULL DEFAULT 0,
    level           INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_external_id ON users (external_id);
CREATE INDEX idx_users_email ON users (email);

-- ============================================================
-- Learning paths
-- ============================================================
CREATE TABLE learning_paths (
    id          UUID PRIMARY KEY,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Skills
-- ============================================================
CREATE TABLE skills (
    id               UUID PRIMARY KEY,
    learning_path_id UUID NOT NULL REFERENCES learning_paths (id),
    slug             VARCHAR(255) NOT NULL UNIQUE,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    display_order    INTEGER NOT NULL DEFAULT 0,
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_learning_path_id ON skills (learning_path_id);

-- ============================================================
-- Questions
-- ============================================================
CREATE TABLE questions (
    id          UUID PRIMARY KEY,
    skill_id    UUID NOT NULL REFERENCES skills (id),
    type        VARCHAR(50) NOT NULL
                    CHECK (type IN ('MULTIPLE_CHOICE', 'CODE_OUTPUT', 'BUG_IDENTIFICATION')),
    content     TEXT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty  INTEGER NOT NULL DEFAULT 3
                    CHECK (difficulty BETWEEN 1 AND 5),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_skill_id ON questions (skill_id);
CREATE INDEX idx_questions_type ON questions (type);
CREATE INDEX idx_questions_difficulty ON questions (difficulty);

-- ============================================================
-- Question options
-- ============================================================
CREATE TABLE question_options (
    id            UUID PRIMARY KEY,
    question_id   UUID NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    content       TEXT NOT NULL,
    correct       BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_question_options_question_id ON question_options (question_id);

-- ============================================================
-- Daily sessions
-- ============================================================
CREATE TABLE daily_sessions (
    id               UUID PRIMARY KEY,
    user_id          UUID NOT NULL REFERENCES users (id),
    session_date     DATE NOT NULL,
    status           VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS'
                         CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'EXPIRED')),
    total_questions  INTEGER NOT NULL DEFAULT 0,
    correct_answers  INTEGER NOT NULL DEFAULT 0,
    xp_earned        INTEGER NOT NULL DEFAULT 0,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, session_date)  -- One session per user per day
);

CREATE INDEX idx_daily_sessions_user_id ON daily_sessions (user_id);
CREATE INDEX idx_daily_sessions_user_date ON daily_sessions (user_id, session_date);

-- ============================================================
-- Session questions (pre-selected questions for a session)
-- ============================================================
CREATE TABLE session_questions (
    id            UUID PRIMARY KEY,
    session_id    UUID NOT NULL REFERENCES daily_sessions (id) ON DELETE CASCADE,
    question_id   UUID NOT NULL REFERENCES questions (id),
    display_order INTEGER NOT NULL DEFAULT 0,
    answered      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_questions_session_id ON session_questions (session_id);

-- ============================================================
-- User answers
-- ============================================================
CREATE TABLE user_answers (
    id                  UUID PRIMARY KEY,
    session_question_id UUID NOT NULL REFERENCES session_questions (id) ON DELETE CASCADE,
    selected_option_id  UUID NOT NULL REFERENCES question_options (id),
    correct             BOOLEAN NOT NULL,
    time_taken_ms       INTEGER,
    answered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_answers_session_question_id ON user_answers (session_question_id);

-- ============================================================
-- User skill progress (mastery tracking + spaced repetition)
-- ============================================================
CREATE TABLE user_skill_progress (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users (id),
    skill_id        UUID NOT NULL REFERENCES skills (id),
    mastery_score   INTEGER NOT NULL DEFAULT 0
                        CHECK (mastery_score BETWEEN 0 AND 100),
    questions_seen  INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    last_seen_at    TIMESTAMPTZ,
    next_review_at  TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, skill_id)
);

CREATE INDEX idx_user_skill_progress_user_id ON user_skill_progress (user_id);
CREATE INDEX idx_user_skill_progress_next_review ON user_skill_progress (user_id, next_review_at);

-- ============================================================
-- Experience transactions (XP ledger)
-- ============================================================
CREATE TABLE experience_transactions (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users (id),
    session_id      UUID REFERENCES daily_sessions (id),
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,  -- Prevents double-grants
    amount          INTEGER NOT NULL,
    reason          VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_experience_transactions_user_id ON experience_transactions (user_id);
CREATE INDEX idx_experience_transactions_idempotency ON experience_transactions (idempotency_key);

-- ============================================================
-- Streaks
-- ============================================================
CREATE TABLE streaks (
    id                UUID PRIMARY KEY,
    user_id           UUID NOT NULL UNIQUE REFERENCES users (id),
    current_streak    INTEGER NOT NULL DEFAULT 0,
    longest_streak    INTEGER NOT NULL DEFAULT 0,
    last_session_date DATE,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_streaks_user_id ON streaks (user_id);
