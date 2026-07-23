import { pgEnum } from "drizzle-orm/pg-core";

export const difficultyEnum = pgEnum("difficulty", ["EASY", "MEDIUM", "HARD", "EXPERT"]);

export const reasoningLevelEnum = pgEnum("reasoning_level", [
  "RECOGNIZE",
  "APPLY",
  "ANALYZE",
  "COMBINE",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "CODE_OUTPUT",
  "BUG_IDENTIFICATION",
  "ORDERING",
  "CODE_COMPLETION",
  "ARCHITECTURE_SCENARIO",
]);

export const questionStatusEnum = pgEnum("question_status", [
  "DRAFT",
  "IN_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
]);

export const criticalityEnum = pgEnum("criticality", ["NORMAL", "IMPORTANT", "CRITICAL"]);

export const skillRoleEnum = pgEnum("skill_role", ["PRIMARY", "SECONDARY", "CONTEXT"]);

export const selectionReasonEnum = pgEnum("selection_reason", [
  "NEW_CONTENT",
  "CURRENT_TOPIC",
  "SPACED_REVIEW",
  "WEAK_SKILL",
  "PREREQUISITE_CHECK",
  "CHALLENGE",
  "FINAL_ASSESSMENT",
]);

export const lessonQuestionRoleEnum = pgEnum("lesson_question_role", [
  "INTRODUCTION",
  "REGULAR",
  "REVIEW",
  "CHALLENGE",
  "FINAL_ASSESSMENT",
]);

export const sessionTypeEnum = pgEnum("session_type", [
  "daily",
  "lesson",
  "review",
  "challenge",
  "final_assessment",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "ACTIVE",
  "COMPLETED",
  "EXPIRED",
  "ABANDONED",
]);
