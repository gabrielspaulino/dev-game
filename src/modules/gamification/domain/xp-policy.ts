export interface XpPolicyConfig {
  correctRegularAnswer: number;
  correctDifficultAnswer: number;
  lessonCompletion: number;
  dailySessionCompletion: number;
  moduleChallengeCompletion: number;
  courseCompletion: number;
  perfectLessonBonus: number;
  weakSkillReviewBonus: number;
  noHintBonusPercent: number;
  reviewXpMultiplier: number;
}

export const DEFAULT_XP_POLICY: XpPolicyConfig = {
  correctRegularAnswer: 5,
  correctDifficultAnswer: 8,
  lessonCompletion: 20,
  dailySessionCompletion: 25,
  moduleChallengeCompletion: 50,
  courseCompletion: 200,
  perfectLessonBonus: 15,
  weakSkillReviewBonus: 10,
  noHintBonusPercent: 20,
  reviewXpMultiplier: 0.5,
};

export type XpReason =
  | "correct_answer"
  | "lesson_completion"
  | "daily_session_completion"
  | "module_challenge_completion"
  | "course_completion"
  | "perfect_lesson_bonus"
  | "weak_skill_review_bonus"
  | "no_hint_bonus"
  | "admin_adjustment";

export interface XpAward {
  amount: number;
  reason: XpReason;
  idempotencyKey: string;
}

export function calculateAnswerXp(
  policy: XpPolicyConfig,
  isDifficult: boolean,
  isReview: boolean,
): number {
  const base = isDifficult ? policy.correctDifficultAnswer : policy.correctRegularAnswer;
  return isReview ? Math.floor(base * policy.reviewXpMultiplier) : base;
}

export function calculateNoHintBonus(policy: XpPolicyConfig, baseXp: number): number {
  return Math.floor(baseXp * (policy.noHintBonusPercent / 100));
}

export function buildIdempotencyKey(action: string, entityId: string, date?: string): string {
  const parts = [action, entityId];
  if (date) parts.push(date);
  return parts.join(":");
}
