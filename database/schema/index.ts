/**
 * Database schema — Stage 0 placeholder.
 *
 * The schema grows incrementally with each implementation stage.
 * Stage 1 adds: users, external_identities
 * Stage 2 adds: learning_paths, modules, lessons, skills, questions, question_options
 * Stage 3 adds: daily_sessions, session_questions, user_answers
 * Stage 4 adds: experience_transactions, streaks, achievements, user_achievements
 * Stage 5 adds: user_skill_progress, placement_tests
 */

// Stage 0: schema is intentionally empty.
// The first migration creates no tables — this lets drizzle-kit
// generate a valid baseline and verify the toolchain works.
export {};
