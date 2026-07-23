import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  difficultyEnum,
  reasoningLevelEnum,
  questionTypeEnum,
  questionStatusEnum,
  criticalityEnum,
  skillRoleEnum,
  selectionReasonEnum,
  lessonQuestionRoleEnum,
  sessionTypeEnum,
  sessionStatusEnum,
} from "./enums";

// ── Users (stub for FK targets — full implementation in Stage 1) ──

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("USER"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Skills ──

export const skills = pgTable(
  "skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentSkillId: uuid("parent_skill_id").references((): any => skills.id),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_skills_parent").on(t.parentSkillId),
    index("idx_skills_category").on(t.category),
    index("idx_skills_code").on(t.code),
  ],
);

// ── Question Families ──

export const questionFamilies = pgTable("question_families", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Lessons (stub for FK targets — full implementation in Stage 2) ──

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  moduleId: uuid("module_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Questions ──

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    questionFamilyId: uuid("question_family_id").references(() => questionFamilies.id),
    primarySkillId: uuid("primary_skill_id")
      .notNull()
      .references(() => skills.id),
    questionType: questionTypeEnum("question_type").notNull(),
    difficulty: difficultyEnum("difficulty").notNull(),
    reasoningLevel: reasoningLevelEnum("reasoning_level").notNull(),
    status: questionStatusEnum("status").notNull().default("DRAFT"),
    languageCode: text("language_code").notNull().default("pt-BR"),
    criticality: criticalityEnum("criticality").notNull().default("NORMAL"),
    estimatedTimeSeconds: integer("estimated_time_seconds"),
    currentVersionNumber: integer("current_version_number").notNull().default(1),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_questions_primary_skill").on(t.primarySkillId),
    index("idx_questions_status").on(t.status),
    index("idx_questions_difficulty").on(t.difficulty),
    index("idx_questions_reasoning_level").on(t.reasoningLevel),
    index("idx_questions_language").on(t.languageCode),
    index("idx_questions_family").on(t.questionFamilyId),
    index("idx_questions_published").on(t.status, t.languageCode, t.primarySkillId, t.difficulty),
  ],
);

// ── Question Versions ──

export const questionVersions = pgTable(
  "question_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    versionNumber: integer("version_number").notNull(),
    title: text("title"),
    prompt: text("prompt").notNull(),
    content: jsonb("content").notNull().default({}),
    correctAnswer: jsonb("correct_answer").notNull(),
    validationConfig: jsonb("validation_config").notNull().default({}),
    generalExplanation: text("general_explanation").notNull(),
    practicalContext: text("practical_context"),
    sourceNotes: text("source_notes"),
    changelog: text("changelog"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_question_version").on(t.questionId, t.versionNumber),
    index("idx_qv_question_version_desc").on(t.questionId),
  ],
);

// ── Question Options ──

export const questionOptions = pgTable(
  "question_options",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionVersionId: uuid("question_version_id")
      .notNull()
      .references(() => questionVersions.id, { onDelete: "cascade" }),
    optionKey: text("option_key").notNull(),
    content: text("content").notNull(),
    contentData: jsonb("content_data").notNull().default({}),
    displayOrder: integer("display_order").notNull(),
    explanation: text("explanation"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_option_key").on(t.questionVersionId, t.optionKey),
    uniqueIndex("uq_option_order").on(t.questionVersionId, t.displayOrder),
  ],
);

// ── Question Skills ──

export const questionSkills = pgTable(
  "question_skills",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    role: skillRoleEnum("role").notNull(),
    weight: numeric("weight", { precision: 3, scale: 2 }).notNull(),
    isRequired: boolean("is_required").notNull().default(true),
  },
  (t) => [
    primaryKey({ columns: [t.questionId, t.skillId] }),
    index("idx_qs_skill_role").on(t.skillId, t.role),
    check("chk_weight_range", sql`weight > 0 AND weight <= 1`),
  ],
);

// ── Question Prerequisites ──

export const questionPrerequisites = pgTable(
  "question_prerequisites",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    minimumMastery: integer("minimum_mastery").notNull().default(30),
  },
  (t) => [
    primaryKey({ columns: [t.questionId, t.skillId] }),
    check("chk_mastery_range", sql`minimum_mastery >= 0 AND minimum_mastery <= 100`),
  ],
);

// ── Lesson Questions ──

export const lessonQuestions = pgTable(
  "lesson_questions",
  {
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    role: lessonQuestionRoleEnum("role").notNull().default("REGULAR"),
    weight: numeric("weight", { precision: 3, scale: 2 }).notNull().default("1"),
    isMandatory: boolean("is_mandatory").notNull().default(false),
    displayOrder: integer("display_order"),
    minimumDifficulty: difficultyEnum("minimum_difficulty"),
    maximumDifficulty: difficultyEnum("maximum_difficulty"),
  },
  (t) => [
    primaryKey({ columns: [t.lessonId, t.questionId] }),
    index("idx_lq_lesson_role").on(t.lessonId, t.role),
  ],
);

// ── Quiz Sessions ──

export const quizSessions = pgTable(
  "quiz_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    sessionType: sessionTypeEnum("session_type").notNull(),
    status: sessionStatusEnum("status").notNull().default("ACTIVE"),
    lessonId: uuid("lesson_id").references(() => lessons.id),
    sessionDate: text("session_date").notNull(),
    questionCount: integer("question_count").notNull(),
    planConfig: jsonb("plan_config").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    expiredAt: timestamp("expired_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_qs_user_date").on(t.userId, t.sessionDate),
    index("idx_qs_user_status").on(t.userId, t.status),
  ],
);

// ── Quiz Session Questions ──

export const quizSessionQuestions = pgTable(
  "quiz_session_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => quizSessions.id),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    questionVersionId: uuid("question_version_id")
      .notNull()
      .references(() => questionVersions.id),
    position: integer("position").notNull(),
    selectionReason: selectionReasonEnum("selection_reason").notNull(),
    targetSkillId: uuid("target_skill_id").references(() => skills.id),
    assignedDifficulty: difficultyEnum("assigned_difficulty"),
    masteryBefore: numeric("mastery_before", { precision: 5, scale: 2 }),
    selectionScore: numeric("selection_score", { precision: 7, scale: 4 }),
    selectionMetadata: jsonb("selection_metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_session_position").on(t.sessionId, t.position),
    uniqueIndex("uq_session_question").on(t.sessionId, t.questionId),
    index("idx_sqq_session").on(t.sessionId),
  ],
);

// ── Quiz Answers ──

export const quizAnswers = pgTable(
  "quiz_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionQuestionId: uuid("session_question_id")
      .notNull()
      .references(() => quizSessionQuestions.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    submittedAnswer: jsonb("submitted_answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    score: numeric("score", { precision: 5, scale: 2 }).notNull(),
    attemptNumber: integer("attempt_number").notNull().default(1),
    hintsUsed: integer("hints_used").notNull().default(0),
    answerTimeSeconds: integer("answer_time_seconds"),
    evaluatedSkillChanges: jsonb("evaluated_skill_changes").notNull().default({}),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    answeredAt: timestamp("answered_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_answer_attempt").on(t.sessionQuestionId, t.attemptNumber),
    index("idx_qa_user_time").on(t.userId, t.answeredAt),
  ],
);

// ── User Question History ──

export const userQuestionHistory = pgTable(
  "user_question_history",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    firstAnsweredAt: timestamp("first_answered_at", { withTimezone: true }).notNull().defaultNow(),
    lastAnsweredAt: timestamp("last_answered_at", { withTimezone: true }).notNull().defaultNow(),
    totalAttempts: integer("total_attempts").notNull().default(1),
    correctCount: integer("correct_count").notNull().default(0),
    incorrectCount: integer("incorrect_count").notNull().default(0),
    lastResult: boolean("last_result").notNull(),
    lastVersionId: uuid("last_version_id")
      .notNull()
      .references(() => questionVersions.id),
    nextEligibleAt: timestamp("next_eligible_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.questionId] }),
    index("idx_uqh_user_next").on(t.userId, t.nextEligibleAt),
    index("idx_uqh_user_last").on(t.userId, t.lastAnsweredAt),
  ],
);
