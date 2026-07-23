import { describe, it, expect } from "vitest";
import {
  canPerformActivity,
  recordActivity,
  createEmptyUsage,
  DEFAULT_FREE_LIMITS,
  type DailyUsage,
} from "@/modules/gamification/domain/daily-limits";

const TODAY = "2026-01-15";

function makeUsage(overrides: Partial<DailyUsage> = {}): DailyUsage {
  return { ...createEmptyUsage(TODAY), ...overrides };
}

describe("Daily Limits", () => {
  describe("canPerformActivity", () => {
    it("allows first daily session", () => {
      expect(canPerformActivity(DEFAULT_FREE_LIMITS, makeUsage(), "daily_session", TODAY)).toBe(
        true,
      );
    });

    it("blocks second daily session", () => {
      const usage = makeUsage({ dailySessionsCompleted: 1 });
      expect(canPerformActivity(DEFAULT_FREE_LIMITS, usage, "daily_session", TODAY)).toBe(false);
    });

    it("allows up to 2 new lessons", () => {
      expect(
        canPerformActivity(
          DEFAULT_FREE_LIMITS,
          makeUsage({ newLessonsStarted: 1 }),
          "new_lesson",
          TODAY,
        ),
      ).toBe(true);
      expect(
        canPerformActivity(
          DEFAULT_FREE_LIMITS,
          makeUsage({ newLessonsStarted: 2 }),
          "new_lesson",
          TODAY,
        ),
      ).toBe(false);
    });

    it("allows up to 2 challenge attempts", () => {
      expect(
        canPerformActivity(
          DEFAULT_FREE_LIMITS,
          makeUsage({ challengeAttempts: 1 }),
          "challenge_attempt",
          TODAY,
        ),
      ).toBe(true);
      expect(
        canPerformActivity(
          DEFAULT_FREE_LIMITS,
          makeUsage({ challengeAttempts: 2 }),
          "challenge_attempt",
          TODAY,
        ),
      ).toBe(false);
    });

    it("always allows reviews", () => {
      expect(canPerformActivity(DEFAULT_FREE_LIMITS, makeUsage(), "review", TODAY)).toBe(true);
    });

    it("always allows practice", () => {
      expect(canPerformActivity(DEFAULT_FREE_LIMITS, makeUsage(), "practice", TODAY)).toBe(true);
    });

    it("resets limits on new day", () => {
      const usage = makeUsage({ dailySessionsCompleted: 1 });
      expect(canPerformActivity(DEFAULT_FREE_LIMITS, usage, "daily_session", "2026-01-16")).toBe(
        true,
      );
    });
  });

  describe("recordActivity", () => {
    it("increments daily session count", () => {
      const result = recordActivity(makeUsage(), "daily_session", TODAY);
      expect(result.dailySessionsCompleted).toBe(1);
    });

    it("increments new lesson count", () => {
      const result = recordActivity(makeUsage(), "new_lesson", TODAY);
      expect(result.newLessonsStarted).toBe(1);
    });

    it("increments challenge attempt count", () => {
      const result = recordActivity(makeUsage(), "challenge_attempt", TODAY);
      expect(result.challengeAttempts).toBe(1);
    });

    it("does not increment for review", () => {
      const result = recordActivity(makeUsage(), "review", TODAY);
      expect(result.dailySessionsCompleted).toBe(0);
    });

    it("resets counters when recording on new day", () => {
      const yesterday = makeUsage({
        date: "2026-01-14",
        dailySessionsCompleted: 1,
        newLessonsStarted: 2,
      });
      const result = recordActivity(yesterday, "daily_session", TODAY);
      expect(result.date).toBe(TODAY);
      expect(result.dailySessionsCompleted).toBe(1);
      expect(result.newLessonsStarted).toBe(0);
    });
  });
});
