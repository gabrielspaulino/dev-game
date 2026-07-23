export interface SessionMixPolicy {
  review: number;
  currentLevel: number;
  newContent: number;
  challenge: number;
}

export const DEFAULT_SESSION_MIX: SessionMixPolicy = {
  review: 0.4,
  currentLevel: 0.3,
  newContent: 0.2,
  challenge: 0.1,
};

export interface SessionSizeConfig {
  lessonMin: number;
  lessonMax: number;
  dailySession: number;
}

export const DEFAULT_SESSION_SIZE: SessionSizeConfig = {
  lessonMin: 5,
  lessonMax: 8,
  dailySession: 10,
};

export const SESSION_EXPIRY_DAYS = 7;

export type SessionType = "daily" | "lesson" | "review" | "challenge" | "final_assessment";

export const SESSION_STATUSES = ["ACTIVE", "COMPLETED", "EXPIRED", "ABANDONED"] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export function calculateMixCounts(
  totalQuestions: number,
  mix: SessionMixPolicy,
): Record<keyof SessionMixPolicy, number> {
  const review = Math.round(totalQuestions * mix.review);
  const currentLevel = Math.round(totalQuestions * mix.currentLevel);
  const challenge = Math.round(totalQuestions * mix.challenge);
  const newContent = totalQuestions - review - currentLevel - challenge;

  return {
    review: Math.max(0, review),
    currentLevel: Math.max(0, currentLevel),
    newContent: Math.max(0, newContent),
    challenge: Math.max(0, challenge),
  };
}

export function isSessionExpired(
  createdAt: Date,
  now: Date,
  expiryDays: number = SESSION_EXPIRY_DAYS,
): boolean {
  const expiryMs = expiryDays * 24 * 60 * 60 * 1000;
  return now.getTime() - createdAt.getTime() > expiryMs;
}
