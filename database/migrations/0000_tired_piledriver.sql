CREATE TYPE "public"."criticality" AS ENUM('NORMAL', 'IMPORTANT', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT');--> statement-breakpoint
CREATE TYPE "public"."lesson_question_role" AS ENUM('INTRODUCTION', 'REGULAR', 'REVIEW', 'CHALLENGE', 'FINAL_ASSESSMENT');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'CODE_OUTPUT', 'BUG_IDENTIFICATION', 'ORDERING', 'CODE_COMPLETION', 'ARCHITECTURE_SCENARIO');--> statement-breakpoint
CREATE TYPE "public"."reasoning_level" AS ENUM('RECOGNIZE', 'APPLY', 'ANALYZE', 'COMBINE');--> statement-breakpoint
CREATE TYPE "public"."selection_reason" AS ENUM('NEW_CONTENT', 'CURRENT_TOPIC', 'SPACED_REVIEW', 'WEAK_SKILL', 'PREREQUISITE_CHECK', 'CHALLENGE', 'FINAL_ASSESSMENT');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('ACTIVE', 'COMPLETED', 'EXPIRED', 'ABANDONED');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('daily', 'lesson', 'review', 'challenge', 'final_assessment');--> statement-breakpoint
CREATE TYPE "public"."skill_role" AS ENUM('PRIMARY', 'SECONDARY', 'CONTEXT');--> statement-breakpoint
CREATE TABLE "lesson_questions" (
	"lesson_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"role" "lesson_question_role" DEFAULT 'REGULAR' NOT NULL,
	"weight" numeric(3, 2) DEFAULT '1' NOT NULL,
	"is_mandatory" boolean DEFAULT false NOT NULL,
	"display_order" integer,
	"minimum_difficulty" "difficulty",
	"maximum_difficulty" "difficulty",
	CONSTRAINT "lesson_questions_lesson_id_question_id_pk" PRIMARY KEY("lesson_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"module_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_families_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_version_id" uuid NOT NULL,
	"option_key" text NOT NULL,
	"content" text NOT NULL,
	"content_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"display_order" integer NOT NULL,
	"explanation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_prerequisites" (
	"question_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"minimum_mastery" integer DEFAULT 30 NOT NULL,
	CONSTRAINT "question_prerequisites_question_id_skill_id_pk" PRIMARY KEY("question_id","skill_id"),
	CONSTRAINT "chk_mastery_range" CHECK (minimum_mastery >= 0 AND minimum_mastery <= 100)
);
--> statement-breakpoint
CREATE TABLE "question_skills" (
	"question_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"role" "skill_role" NOT NULL,
	"weight" numeric(3, 2) NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	CONSTRAINT "question_skills_question_id_skill_id_pk" PRIMARY KEY("question_id","skill_id"),
	CONSTRAINT "chk_weight_range" CHECK (weight > 0 AND weight <= 1)
);
--> statement-breakpoint
CREATE TABLE "question_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"title" text,
	"prompt" text NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"correct_answer" jsonb NOT NULL,
	"validation_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"general_explanation" text NOT NULL,
	"practical_context" text,
	"source_notes" text,
	"changelog" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"question_family_id" uuid,
	"primary_skill_id" uuid NOT NULL,
	"question_type" "question_type" NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"reasoning_level" "reasoning_level" NOT NULL,
	"status" "question_status" DEFAULT 'DRAFT' NOT NULL,
	"language_code" text DEFAULT 'pt-BR' NOT NULL,
	"criticality" "criticality" DEFAULT 'NORMAL' NOT NULL,
	"estimated_time_seconds" integer,
	"current_version_number" integer DEFAULT 1 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	CONSTRAINT "questions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quiz_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_question_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"submitted_answer" jsonb NOT NULL,
	"is_correct" boolean NOT NULL,
	"score" numeric(5, 2) NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"hints_used" integer DEFAULT 0 NOT NULL,
	"answer_time_seconds" integer,
	"evaluated_skill_changes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"idempotency_key" text NOT NULL,
	"answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_answers_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "quiz_session_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_version_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"selection_reason" "selection_reason" NOT NULL,
	"target_skill_id" uuid,
	"assigned_difficulty" "difficulty",
	"mastery_before" numeric(5, 2),
	"selection_score" numeric(7, 4),
	"selection_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_type" "session_type" NOT NULL,
	"status" "session_status" DEFAULT 'ACTIVE' NOT NULL,
	"lesson_id" uuid,
	"session_date" text NOT NULL,
	"question_count" integer NOT NULL,
	"plan_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"expired_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_skill_id" uuid,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_question_history" (
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"first_answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_answered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"total_attempts" integer DEFAULT 1 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"incorrect_count" integer DEFAULT 0 NOT NULL,
	"last_result" boolean NOT NULL,
	"last_version_id" uuid NOT NULL,
	"next_eligible_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_question_history_user_id_question_id_pk" PRIMARY KEY("user_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'USER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_questions" ADD CONSTRAINT "lesson_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_prerequisites" ADD CONSTRAINT "question_prerequisites_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_prerequisites" ADD CONSTRAINT "question_prerequisites_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_skills" ADD CONSTRAINT "question_skills_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_skills" ADD CONSTRAINT "question_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_question_family_id_question_families_id_fk" FOREIGN KEY ("question_family_id") REFERENCES "public"."question_families"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_primary_skill_id_skills_id_fk" FOREIGN KEY ("primary_skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_session_question_id_quiz_session_questions_id_fk" FOREIGN KEY ("session_question_id") REFERENCES "public"."quiz_session_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session_questions" ADD CONSTRAINT "quiz_session_questions_session_id_quiz_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session_questions" ADD CONSTRAINT "quiz_session_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session_questions" ADD CONSTRAINT "quiz_session_questions_question_version_id_question_versions_id_fk" FOREIGN KEY ("question_version_id") REFERENCES "public"."question_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_session_questions" ADD CONSTRAINT "quiz_session_questions_target_skill_id_skills_id_fk" FOREIGN KEY ("target_skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_parent_skill_id_skills_id_fk" FOREIGN KEY ("parent_skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_history" ADD CONSTRAINT "user_question_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_history" ADD CONSTRAINT "user_question_history_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_question_history" ADD CONSTRAINT "user_question_history_last_version_id_question_versions_id_fk" FOREIGN KEY ("last_version_id") REFERENCES "public"."question_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lq_lesson_role" ON "lesson_questions" USING btree ("lesson_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_option_key" ON "question_options" USING btree ("question_version_id","option_key");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_option_order" ON "question_options" USING btree ("question_version_id","display_order");--> statement-breakpoint
CREATE INDEX "idx_qs_skill_role" ON "question_skills" USING btree ("skill_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_question_version" ON "question_versions" USING btree ("question_id","version_number");--> statement-breakpoint
CREATE INDEX "idx_qv_question_version_desc" ON "question_versions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_questions_primary_skill" ON "questions" USING btree ("primary_skill_id");--> statement-breakpoint
CREATE INDEX "idx_questions_status" ON "questions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_questions_difficulty" ON "questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_questions_reasoning_level" ON "questions" USING btree ("reasoning_level");--> statement-breakpoint
CREATE INDEX "idx_questions_language" ON "questions" USING btree ("language_code");--> statement-breakpoint
CREATE INDEX "idx_questions_family" ON "questions" USING btree ("question_family_id");--> statement-breakpoint
CREATE INDEX "idx_questions_published" ON "questions" USING btree ("status","language_code","primary_skill_id","difficulty");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_answer_attempt" ON "quiz_answers" USING btree ("session_question_id","attempt_number");--> statement-breakpoint
CREATE INDEX "idx_qa_user_time" ON "quiz_answers" USING btree ("user_id","answered_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_session_position" ON "quiz_session_questions" USING btree ("session_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_session_question" ON "quiz_session_questions" USING btree ("session_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_sqq_session" ON "quiz_session_questions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_qs_user_date" ON "quiz_sessions" USING btree ("user_id","session_date");--> statement-breakpoint
CREATE INDEX "idx_qs_user_status" ON "quiz_sessions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_skills_parent" ON "skills" USING btree ("parent_skill_id");--> statement-breakpoint
CREATE INDEX "idx_skills_category" ON "skills" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_skills_code" ON "skills" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_uqh_user_next" ON "user_question_history" USING btree ("user_id","next_eligible_at");--> statement-breakpoint
CREATE INDEX "idx_uqh_user_last" ON "user_question_history" USING btree ("user_id","last_answered_at");