import type { Clock } from "@/shared/domain/clock";

export interface FocusPointsConfig {
  maximum: number;
  regenIntervalMs: number;
  regenAmount: number;
  reviewRecoveryAmount: number;
  reviewRecoveryMinCorrect: number;
  reviewRecoveryMinQuestions: number;
  maxReviewRecoveryPerDay: number;
}

export const DEFAULT_FOCUS_POINTS_CONFIG: FocusPointsConfig = {
  maximum: 5,
  regenIntervalMs: 3 * 60 * 60 * 1000,
  regenAmount: 1,
  reviewRecoveryAmount: 1,
  reviewRecoveryMinCorrect: 4,
  reviewRecoveryMinQuestions: 5,
  maxReviewRecoveryPerDay: 3,
};

export type FocusPointsSpendReason =
  "advanced_lesson" | "retry_challenge" | "reveal_hint" | "skip_mandatory_question";

export interface FocusPointsState {
  current: number;
  lastRegenAt: Date;
  reviewRecoveriesToday: number;
  reviewRecoveryDate: string;
}

export function calculateRegenerated(
  state: FocusPointsState,
  config: FocusPointsConfig,
  clock: Clock,
): FocusPointsState {
  const now = clock.now();
  const elapsed = now.getTime() - state.lastRegenAt.getTime();

  if (elapsed < config.regenIntervalMs) return state;

  const intervals = Math.floor(elapsed / config.regenIntervalMs);
  const regenPoints = intervals * config.regenAmount;
  const newCurrent = Math.min(config.maximum, state.current + regenPoints);
  const consumedTime = intervals * config.regenIntervalMs;

  return {
    ...state,
    current: newCurrent,
    lastRegenAt: new Date(state.lastRegenAt.getTime() + consumedTime),
  };
}

export function canSpend(
  state: FocusPointsState,
  config: FocusPointsConfig,
  clock: Clock,
  amount: number,
): boolean {
  const updated = calculateRegenerated(state, config, clock);
  return updated.current >= amount;
}

export function spend(
  state: FocusPointsState,
  config: FocusPointsConfig,
  clock: Clock,
  amount: number,
): FocusPointsState | null {
  const updated = calculateRegenerated(state, config, clock);
  if (updated.current < amount) return null;
  return { ...updated, current: updated.current - amount };
}

export function recoverFromReview(
  state: FocusPointsState,
  config: FocusPointsConfig,
  clock: Clock,
  correctAnswers: number,
  totalQuestions: number,
): FocusPointsState | null {
  if (totalQuestions < config.reviewRecoveryMinQuestions) return null;
  if (correctAnswers < config.reviewRecoveryMinCorrect) return null;

  const updated = calculateRegenerated(state, config, clock);
  const today = clock.today();
  const todayRecoveries = updated.reviewRecoveryDate === today ? updated.reviewRecoveriesToday : 0;

  if (todayRecoveries >= config.maxReviewRecoveryPerDay) return null;
  if (updated.current >= config.maximum) return null;

  return {
    ...updated,
    current: Math.min(config.maximum, updated.current + config.reviewRecoveryAmount),
    reviewRecoveriesToday: todayRecoveries + 1,
    reviewRecoveryDate: today,
  };
}

export function createInitialFocusPointsState(
  config: FocusPointsConfig,
  clock: Clock,
): FocusPointsState {
  return {
    current: config.maximum,
    lastRegenAt: clock.now(),
    reviewRecoveriesToday: 0,
    reviewRecoveryDate: clock.today(),
  };
}
