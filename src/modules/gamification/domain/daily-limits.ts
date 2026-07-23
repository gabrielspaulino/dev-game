export interface DailyLimitsConfig {
  maxDailySessions: number;
  maxNewLessons: number;
  maxChallengeAttempts: number;
  unlimitedReviews: boolean;
  unlimitedPractice: boolean;
}

export const DEFAULT_FREE_LIMITS: DailyLimitsConfig = {
  maxDailySessions: 1,
  maxNewLessons: 2,
  maxChallengeAttempts: 2,
  unlimitedReviews: true,
  unlimitedPractice: true,
};

export interface DailyUsage {
  date: string;
  dailySessionsCompleted: number;
  newLessonsStarted: number;
  challengeAttempts: number;
}

export type ActivityType =
  "daily_session" | "new_lesson" | "challenge_attempt" | "review" | "practice";

export function canPerformActivity(
  limits: DailyLimitsConfig,
  usage: DailyUsage,
  activity: ActivityType,
  today: string,
): boolean {
  if (usage.date !== today) return true;

  switch (activity) {
    case "daily_session":
      return usage.dailySessionsCompleted < limits.maxDailySessions;
    case "new_lesson":
      return usage.newLessonsStarted < limits.maxNewLessons;
    case "challenge_attempt":
      return usage.challengeAttempts < limits.maxChallengeAttempts;
    case "review":
      return limits.unlimitedReviews;
    case "practice":
      return limits.unlimitedPractice;
  }
}

export function recordActivity(
  usage: DailyUsage,
  activity: ActivityType,
  today: string,
): DailyUsage {
  const base: DailyUsage =
    usage.date === today
      ? { ...usage }
      : {
          date: today,
          dailySessionsCompleted: 0,
          newLessonsStarted: 0,
          challengeAttempts: 0,
        };

  switch (activity) {
    case "daily_session":
      return {
        ...base,
        dailySessionsCompleted: base.dailySessionsCompleted + 1,
      };
    case "new_lesson":
      return { ...base, newLessonsStarted: base.newLessonsStarted + 1 };
    case "challenge_attempt":
      return { ...base, challengeAttempts: base.challengeAttempts + 1 };
    case "review":
    case "practice":
      return base;
  }
}

export function createEmptyUsage(today: string): DailyUsage {
  return {
    date: today,
    dailySessionsCompleted: 0,
    newLessonsStarted: 0,
    challengeAttempts: 0,
  };
}
