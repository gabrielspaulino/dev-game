import { describe, it, expect } from "vitest";
import { FixedClock } from "@/shared/domain/clock";
import {
  updateStreak,
  createInitialStreakState,
  MIN_REVIEW_QUESTIONS_FOR_STREAK,
} from "@/modules/gamification/domain/streak";

describe("Streak", () => {
  const jan15 = new FixedClock(new Date("2026-01-15T10:00:00Z"));
  const jan16 = new FixedClock(new Date("2026-01-16T10:00:00Z"));
  const jan18 = new FixedClock(new Date("2026-01-18T10:00:00Z"));

  describe("updateStreak", () => {
    it("starts at 1 for first activity", () => {
      const state = createInitialStreakState();
      const result = updateStreak(state, "daily_session", jan15);
      expect(result.currentStreak).toBe(1);
      expect(result.lastActivityDate).toBe("2026-01-15");
    });

    it("increments streak on consecutive day", () => {
      const state = { currentStreak: 3, lastActivityDate: "2026-01-15" };
      const result = updateStreak(state, "lesson", jan16);
      expect(result.currentStreak).toBe(4);
    });

    it("resets to 1 after missed day", () => {
      const state = { currentStreak: 5, lastActivityDate: "2026-01-15" };
      const result = updateStreak(state, "daily_session", jan18);
      expect(result.currentStreak).toBe(1);
    });

    it("is idempotent for same day", () => {
      const state = { currentStreak: 3, lastActivityDate: "2026-01-15" };
      const result = updateStreak(state, "daily_session", jan15);
      expect(result.currentStreak).toBe(3);
      expect(result).toBe(state);
    });

    it("ignores review with fewer than required questions", () => {
      const state = createInitialStreakState();
      const result = updateStreak(state, "review", jan15, 4);
      expect(result.currentStreak).toBe(0);
    });

    it("counts review with enough questions", () => {
      const state = createInitialStreakState();
      const result = updateStreak(state, "review", jan15, MIN_REVIEW_QUESTIONS_FOR_STREAK);
      expect(result.currentStreak).toBe(1);
    });

    it("accepts challenge activity", () => {
      const state = createInitialStreakState();
      const result = updateStreak(state, "challenge", jan15);
      expect(result.currentStreak).toBe(1);
    });
  });

  describe("createInitialStreakState", () => {
    it("starts at 0 with no activity date", () => {
      const state = createInitialStreakState();
      expect(state.currentStreak).toBe(0);
      expect(state.lastActivityDate).toBeNull();
    });
  });
});
