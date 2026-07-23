import type { Clock } from "@/shared/domain/clock";

export type StreakActivity = "daily_session" | "lesson" | "review" | "challenge";

export interface StreakState {
  currentStreak: number;
  lastActivityDate: string | null;
}

export const MIN_REVIEW_QUESTIONS_FOR_STREAK = 5;

export function updateStreak(
  state: StreakState,
  activity: StreakActivity,
  clock: Clock,
  reviewQuestionCount?: number,
): StreakState {
  if (activity === "review" && (reviewQuestionCount ?? 0) < MIN_REVIEW_QUESTIONS_FOR_STREAK) {
    return state;
  }

  const today = clock.today();

  if (state.lastActivityDate === today) {
    return state;
  }

  const yesterday = getYesterday(clock);
  const isConsecutive = state.lastActivityDate === yesterday;

  return {
    currentStreak: isConsecutive ? state.currentStreak + 1 : 1,
    lastActivityDate: today,
  };
}

function getYesterday(clock: Clock): string {
  const now = clock.now();
  const yesterday = new Date(now.getTime() - 86_400_000);
  return yesterday.toISOString().slice(0, 10);
}

export function createInitialStreakState(): StreakState {
  return { currentStreak: 0, lastActivityDate: null };
}
