import { describe, it, expect } from "vitest";
import {
  calculateLevel,
  xpForNextLevel,
  DEFAULT_LEVEL_THRESHOLDS,
} from "@/modules/gamification/domain/level";

describe("Level", () => {
  describe("calculateLevel", () => {
    it("returns 1 for 0 XP", () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it("returns 1 for 99 XP", () => {
      expect(calculateLevel(99)).toBe(1);
    });

    it("returns 2 for 100 XP", () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it("returns 5 for 1000 XP", () => {
      expect(calculateLevel(1000)).toBe(5);
    });

    it("returns 10 for 5000 XP", () => {
      expect(calculateLevel(5000)).toBe(10);
    });

    it("returns highest level for very high XP", () => {
      expect(calculateLevel(999_999)).toBe(30);
    });

    it("supports custom thresholds", () => {
      const custom = [
        { level: 1, xpRequired: 0 },
        { level: 2, xpRequired: 50 },
      ];
      expect(calculateLevel(50, custom)).toBe(2);
      expect(calculateLevel(49, custom)).toBe(1);
    });
  });

  describe("xpForNextLevel", () => {
    it("returns progress within a level", () => {
      const result = xpForNextLevel(150);
      expect(result).not.toBeNull();
      expect(result!.currentLevel).toBe(2);
      expect(result!.xpInLevel).toBe(50);
      expect(result!.xpToNext).toBe(200);
    });

    it("returns null at max level", () => {
      const result = xpForNextLevel(999_999);
      expect(result).toBeNull();
    });

    it("returns 0 xpInLevel at exact threshold", () => {
      const result = xpForNextLevel(100);
      expect(result).not.toBeNull();
      expect(result!.currentLevel).toBe(2);
      expect(result!.xpInLevel).toBe(0);
    });
  });
});
