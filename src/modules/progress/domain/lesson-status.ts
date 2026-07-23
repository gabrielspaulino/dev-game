export const LESSON_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "COMPLETED_REVIEW_REQUIRED",
  "MASTERED",
] as const;

export type LessonStatus = (typeof LESSON_STATUSES)[number];

export interface LessonCompletionConfig {
  minimumScorePercent: number;
  targetedReviewSize: number;
}

export const DEFAULT_LESSON_COMPLETION_CONFIG: LessonCompletionConfig = {
  minimumScorePercent: 70,
  targetedReviewSize: 5,
};

export interface LessonAttemptResult {
  totalQuestions: number;
  correctAnswers: number;
  failedCriticalSkills: boolean;
  incorrectQuestionIds: string[];
  weakSkillIds: string[];
}

export function determineLessonStatus(
  attempt: LessonAttemptResult,
  config: LessonCompletionConfig,
): LessonStatus {
  const scorePercent = (attempt.correctAnswers / attempt.totalQuestions) * 100;

  if (scorePercent < config.minimumScorePercent || attempt.failedCriticalSkills) {
    return "COMPLETED_REVIEW_REQUIRED";
  }

  return "COMPLETED";
}

export interface TargetedReview {
  incorrectQuestionIds: string[];
  weakSkillIds: string[];
  questionCount: number;
}

export function buildTargetedReview(
  attempt: LessonAttemptResult,
  config: LessonCompletionConfig,
): TargetedReview {
  return {
    incorrectQuestionIds: attempt.incorrectQuestionIds,
    weakSkillIds: attempt.weakSkillIds,
    questionCount: Math.min(
      config.targetedReviewSize,
      attempt.incorrectQuestionIds.length +
        Math.max(0, config.targetedReviewSize - attempt.incorrectQuestionIds.length),
    ),
  };
}

const VALID_TRANSITIONS: Record<LessonStatus, LessonStatus[]> = {
  NOT_STARTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED", "COMPLETED_REVIEW_REQUIRED"],
  COMPLETED: ["MASTERED"],
  COMPLETED_REVIEW_REQUIRED: ["IN_PROGRESS", "COMPLETED"],
  MASTERED: [],
};

export function canTransition(from: LessonStatus, to: LessonStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
