import { describe, it, expect } from "vitest";
import {
  calculateAnswerXp,
  calculateNoHintBonus,
  buildIdempotencyKey,
  DEFAULT_XP_POLICY,
} from "@/modules/gamification/domain/xp-policy";

describe("XP Policy", () => {
  describe("calculateAnswerXp", () => {
    it("awards regular XP for non-difficult answer", () => {
      expect(calculateAnswerXp(DEFAULT_XP_POLICY, false, false)).toBe(5);
    });

    it("awards higher XP for difficult answer", () => {
      expect(calculateAnswerXp(DEFAULT_XP_POLICY, true, false)).toBe(8);
    });

    it("applies review multiplier to regular answer", () => {
      expect(calculateAnswerXp(DEFAULT_XP_POLICY, false, true)).toBe(2);
    });

    it("applies review multiplier to difficult answer", () => {
      expect(calculateAnswerXp(DEFAULT_XP_POLICY, true, true)).toBe(4);
    });

    it("uses custom policy values", () => {
      const custom = { ...DEFAULT_XP_POLICY, correctRegularAnswer: 10 };
      expect(calculateAnswerXp(custom, false, false)).toBe(10);
    });
  });

  describe("calculateNoHintBonus", () => {
    it("calculates 20% bonus by default", () => {
      expect(calculateNoHintBonus(DEFAULT_XP_POLICY, 100)).toBe(20);
    });

    it("rounds down fractional bonus", () => {
      expect(calculateNoHintBonus(DEFAULT_XP_POLICY, 7)).toBe(1);
    });
  });

  describe("buildIdempotencyKey", () => {
    it("builds key from action and entity", () => {
      expect(buildIdempotencyKey("lesson_completion", "lesson-1")).toBe(
        "lesson_completion:lesson-1",
      );
    });

    it("includes date when provided", () => {
      expect(buildIdempotencyKey("daily_session", "session-1", "2026-01-15")).toBe(
        "daily_session:session-1:2026-01-15",
      );
    });
  });

  describe("DEFAULT_XP_POLICY", () => {
    it("has expected default values", () => {
      expect(DEFAULT_XP_POLICY.lessonCompletion).toBe(20);
      expect(DEFAULT_XP_POLICY.dailySessionCompletion).toBe(25);
      expect(DEFAULT_XP_POLICY.moduleChallengeCompletion).toBe(50);
      expect(DEFAULT_XP_POLICY.courseCompletion).toBe(200);
      expect(DEFAULT_XP_POLICY.perfectLessonBonus).toBe(15);
      expect(DEFAULT_XP_POLICY.weakSkillReviewBonus).toBe(10);
    });
  });
});
