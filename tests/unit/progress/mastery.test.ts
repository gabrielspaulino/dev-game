import { describe, it, expect } from "vitest";
import {
  getMasteryBand,
  calculateMasteryGain,
  calculateMasteryLoss,
  applyMasteryChange,
  applyRecencyDecay,
  DEFAULT_MASTERY_CONFIG,
  MASTERY_MIN,
  MASTERY_MAX,
} from "@/modules/progress/domain/mastery";

describe("Mastery", () => {
  describe("getMasteryBand", () => {
    it("returns Beginner for 0", () => {
      expect(getMasteryBand(0)).toBe("Beginner");
    });

    it("returns Beginner for 29", () => {
      expect(getMasteryBand(29)).toBe("Beginner");
    });

    it("returns Developing for 30", () => {
      expect(getMasteryBand(30)).toBe("Developing");
    });

    it("returns Competent for 50", () => {
      expect(getMasteryBand(50)).toBe("Competent");
    });

    it("returns Proficient for 70", () => {
      expect(getMasteryBand(70)).toBe("Proficient");
    });

    it("returns Advanced for 85", () => {
      expect(getMasteryBand(85)).toBe("Advanced");
    });

    it("returns Advanced for 100", () => {
      expect(getMasteryBand(100)).toBe("Advanced");
    });
  });

  describe("calculateMasteryGain", () => {
    it("applies base gain plus difficulty bonus", () => {
      const gain = calculateMasteryGain(DEFAULT_MASTERY_CONFIG, 3, false, false);
      expect(gain).toBe(Math.round(5 + 3 * 0.5));
    });

    it("applies hint penalty", () => {
      const gain = calculateMasteryGain(DEFAULT_MASTERY_CONFIG, 1, true, false);
      const base = 5 + 1 * 0.5;
      expect(gain).toBe(Math.round(base * 0.7));
    });

    it("applies challenge bonus", () => {
      const gain = calculateMasteryGain(DEFAULT_MASTERY_CONFIG, 1, false, true);
      const base = 5 + 1 * 0.5;
      expect(gain).toBe(Math.round(base * 1.25));
    });

    it("applies both hint penalty and challenge bonus", () => {
      const gain = calculateMasteryGain(DEFAULT_MASTERY_CONFIG, 2, true, true);
      const base = 5 + 2 * 0.5;
      const withHint = base * 0.7;
      const withChallenge = withHint * 1.25;
      expect(gain).toBe(Math.round(withChallenge));
    });
  });

  describe("calculateMasteryLoss", () => {
    it("applies base loss plus difficulty penalty", () => {
      const loss = calculateMasteryLoss(DEFAULT_MASTERY_CONFIG, 3);
      expect(loss).toBe(Math.round(3 + 3 * 0.3));
    });
  });

  describe("applyMasteryChange", () => {
    it("increases mastery for correct answer", () => {
      const result = applyMasteryChange(50, true, DEFAULT_MASTERY_CONFIG, 3, false, false);
      expect(result).toBeGreaterThan(50);
    });

    it("decreases mastery for incorrect answer", () => {
      const result = applyMasteryChange(50, false, DEFAULT_MASTERY_CONFIG, 3, false, false);
      expect(result).toBeLessThan(50);
    });

    it("never exceeds 100", () => {
      const result = applyMasteryChange(99, true, DEFAULT_MASTERY_CONFIG, 5, false, true);
      expect(result).toBe(MASTERY_MAX);
    });

    it("never goes below 0", () => {
      const result = applyMasteryChange(1, false, DEFAULT_MASTERY_CONFIG, 5, false, false);
      expect(result).toBe(MASTERY_MIN);
    });
  });

  describe("applyRecencyDecay", () => {
    it("does not decay on same day", () => {
      expect(applyRecencyDecay(80, 0, DEFAULT_MASTERY_CONFIG)).toBe(80);
    });

    it("decays over time", () => {
      expect(applyRecencyDecay(80, 10, DEFAULT_MASTERY_CONFIG)).toBe(75);
    });

    it("caps decay at maxRecencyDecay", () => {
      expect(applyRecencyDecay(80, 100, DEFAULT_MASTERY_CONFIG)).toBe(65);
    });

    it("never goes below 0", () => {
      expect(applyRecencyDecay(5, 100, DEFAULT_MASTERY_CONFIG)).toBe(MASTERY_MIN);
    });
  });
});
