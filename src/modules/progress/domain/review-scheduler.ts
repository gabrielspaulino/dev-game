export interface ReviewScheduleConfig {
  intervals: number[];
  shortenFactor: number;
  extendFactor: number;
  minInterval: number;
  maxInterval: number;
}

export const DEFAULT_REVIEW_SCHEDULE_CONFIG: ReviewScheduleConfig = {
  intervals: [0, 1, 3, 7, 21],
  shortenFactor: 0.5,
  extendFactor: 1.5,
  minInterval: 1,
  maxInterval: 60,
};

export interface ReviewItem {
  questionId: string;
  skillIds: string[];
  currentIntervalIndex: number;
  customIntervalDays: number | null;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  nextReviewDate: string;
}

export function scheduleNextReview(
  item: ReviewItem,
  wasCorrect: boolean,
  config: ReviewScheduleConfig,
  todayStr: string,
): ReviewItem {
  if (wasCorrect) {
    const newConsecutiveCorrect = item.consecutiveCorrect + 1;
    const nextIndex = Math.min(item.currentIntervalIndex + 1, config.intervals.length - 1);
    let intervalDays =
      config.intervals[nextIndex] ?? config.intervals[config.intervals.length - 1]!;

    if (item.customIntervalDays !== null) {
      intervalDays = Math.min(
        config.maxInterval,
        Math.round(item.customIntervalDays * config.extendFactor),
      );
    }

    return {
      ...item,
      currentIntervalIndex: nextIndex,
      customIntervalDays: nextIndex >= config.intervals.length - 1 ? intervalDays : null,
      consecutiveCorrect: newConsecutiveCorrect,
      consecutiveIncorrect: 0,
      nextReviewDate: addDays(todayStr, intervalDays),
    };
  }

  const newConsecutiveIncorrect = item.consecutiveIncorrect + 1;
  const shortenedIndex = Math.max(0, item.currentIntervalIndex - 1);
  let intervalDays = config.intervals[shortenedIndex] ?? config.minInterval;

  if (item.customIntervalDays !== null) {
    intervalDays = Math.max(
      config.minInterval,
      Math.round(item.customIntervalDays * config.shortenFactor),
    );
  }

  return {
    ...item,
    currentIntervalIndex: shortenedIndex,
    customIntervalDays:
      shortenedIndex === 0 && intervalDays <= config.intervals[0]! ? null : intervalDays,
    consecutiveCorrect: 0,
    consecutiveIncorrect: newConsecutiveIncorrect,
    nextReviewDate: addDays(todayStr, Math.max(intervalDays, config.minInterval)),
  };
}

export function createReviewItem(
  questionId: string,
  skillIds: string[],
  todayStr: string,
  config: ReviewScheduleConfig,
): ReviewItem {
  const firstInterval = config.intervals[0] ?? 0;
  return {
    questionId,
    skillIds,
    currentIntervalIndex: 0,
    customIntervalDays: null,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    nextReviewDate: addDays(todayStr, firstInterval),
  };
}

export function isDueForReview(item: ReviewItem, todayStr: string): boolean {
  return item.nextReviewDate <= todayStr;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
