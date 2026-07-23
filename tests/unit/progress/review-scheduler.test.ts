import { describe, it, expect } from "vitest";
import {
  createReviewItem,
  scheduleNextReview,
  isDueForReview,
  DEFAULT_REVIEW_SCHEDULE_CONFIG,
} from "@/modules/progress/domain/review-scheduler";

const TODAY = "2026-01-15";

describe("Review Scheduler", () => {
  describe("createReviewItem", () => {
    it("creates item with first interval as next review date", () => {
      const item = createReviewItem("q1", ["s1", "s2"], TODAY, DEFAULT_REVIEW_SCHEDULE_CONFIG);
      expect(item.questionId).toBe("q1");
      expect(item.skillIds).toEqual(["s1", "s2"]);
      expect(item.currentIntervalIndex).toBe(0);
      expect(item.consecutiveCorrect).toBe(0);
      expect(item.consecutiveIncorrect).toBe(0);
      expect(item.nextReviewDate).toBe("2026-01-15");
    });
  });

  describe("scheduleNextReview", () => {
    it("advances interval on correct answer", () => {
      const item = createReviewItem("q1", ["s1"], TODAY, DEFAULT_REVIEW_SCHEDULE_CONFIG);
      const next = scheduleNextReview(item, true, DEFAULT_REVIEW_SCHEDULE_CONFIG, TODAY);
      expect(next.currentIntervalIndex).toBe(1);
      expect(next.consecutiveCorrect).toBe(1);
      expect(next.consecutiveIncorrect).toBe(0);
      expect(next.nextReviewDate).toBe("2026-01-16");
    });

    it("progresses through intervals on consecutive correct", () => {
      let item = createReviewItem("q1", ["s1"], TODAY, DEFAULT_REVIEW_SCHEDULE_CONFIG);
      item = scheduleNextReview(item, true, DEFAULT_REVIEW_SCHEDULE_CONFIG, TODAY);
      expect(item.nextReviewDate).toBe("2026-01-16");
      item = scheduleNextReview(item, true, DEFAULT_REVIEW_SCHEDULE_CONFIG, "2026-01-16");
      expect(item.nextReviewDate).toBe("2026-01-19");
      item = scheduleNextReview(item, true, DEFAULT_REVIEW_SCHEDULE_CONFIG, "2026-01-19");
      expect(item.nextReviewDate).toBe("2026-01-26");
    });

    it("shortens interval on incorrect answer", () => {
      let item = createReviewItem("q1", ["s1"], TODAY, DEFAULT_REVIEW_SCHEDULE_CONFIG);
      item = scheduleNextReview(item, true, DEFAULT_REVIEW_SCHEDULE_CONFIG, TODAY);
      item = scheduleNextReview(item, true, DEFAULT_REVIEW_SCHEDULE_CONFIG, "2026-01-16");
      const atIndex2 = item.currentIntervalIndex;
      const wrong = scheduleNextReview(item, false, DEFAULT_REVIEW_SCHEDULE_CONFIG, "2026-01-19");
      expect(wrong.currentIntervalIndex).toBe(atIndex2 - 1);
      expect(wrong.consecutiveCorrect).toBe(0);
      expect(wrong.consecutiveIncorrect).toBe(1);
    });

    it("does not go below index 0 on incorrect", () => {
      const item = createReviewItem("q1", ["s1"], TODAY, DEFAULT_REVIEW_SCHEDULE_CONFIG);
      const wrong = scheduleNextReview(item, false, DEFAULT_REVIEW_SCHEDULE_CONFIG, TODAY);
      expect(wrong.currentIntervalIndex).toBe(0);
    });

    it("caps interval index at last in config", () => {
      let item = createReviewItem("q1", ["s1"], TODAY, DEFAULT_REVIEW_SCHEDULE_CONFIG);
      let date = TODAY;
      for (let i = 0; i < 10; i++) {
        item = scheduleNextReview(item, true, DEFAULT_REVIEW_SCHEDULE_CONFIG, date);
        date = item.nextReviewDate;
      }
      expect(item.currentIntervalIndex).toBe(DEFAULT_REVIEW_SCHEDULE_CONFIG.intervals.length - 1);
    });
  });

  describe("isDueForReview", () => {
    it("returns true when review date is today", () => {
      const item = createReviewItem("q1", ["s1"], TODAY, DEFAULT_REVIEW_SCHEDULE_CONFIG);
      expect(isDueForReview(item, TODAY)).toBe(true);
    });

    it("returns true when review date is past", () => {
      const item = createReviewItem("q1", ["s1"], TODAY, DEFAULT_REVIEW_SCHEDULE_CONFIG);
      expect(isDueForReview(item, "2026-01-20")).toBe(true);
    });

    it("returns false when review date is future", () => {
      let item = createReviewItem("q1", ["s1"], TODAY, DEFAULT_REVIEW_SCHEDULE_CONFIG);
      item = scheduleNextReview(item, true, DEFAULT_REVIEW_SCHEDULE_CONFIG, TODAY);
      expect(isDueForReview(item, TODAY)).toBe(false);
    });
  });
});
