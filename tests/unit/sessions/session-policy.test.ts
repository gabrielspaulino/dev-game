import { describe, it, expect } from "vitest";
import {
  calculateMixCounts,
  isSessionExpired,
  DEFAULT_SESSION_MIX,
  SESSION_EXPIRY_DAYS,
} from "@/modules/sessions/domain/session-policy";

describe("Session Policy", () => {
  describe("calculateMixCounts", () => {
    it("distributes 10 questions with default mix", () => {
      const counts = calculateMixCounts(10, DEFAULT_SESSION_MIX);
      expect(counts.review).toBe(4);
      expect(counts.currentLevel).toBe(3);
      expect(counts.challenge).toBe(1);
      expect(counts.newContent).toBe(2);
    });

    it("total equals input question count", () => {
      const counts = calculateMixCounts(10, DEFAULT_SESSION_MIX);
      const total = counts.review + counts.currentLevel + counts.newContent + counts.challenge;
      expect(total).toBe(10);
    });

    it("handles rounding for non-round totals", () => {
      const counts = calculateMixCounts(7, DEFAULT_SESSION_MIX);
      const total = counts.review + counts.currentLevel + counts.newContent + counts.challenge;
      expect(total).toBe(7);
    });

    it("handles 0 questions", () => {
      const counts = calculateMixCounts(0, DEFAULT_SESSION_MIX);
      expect(counts.review).toBe(0);
      expect(counts.currentLevel).toBe(0);
      expect(counts.newContent).toBe(0);
      expect(counts.challenge).toBe(0);
    });
  });

  describe("isSessionExpired", () => {
    it("returns false for fresh session", () => {
      const created = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-15T12:00:00Z");
      expect(isSessionExpired(created, now)).toBe(false);
    });

    it("returns false at exactly 7 days", () => {
      const created = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-22T10:00:00Z");
      expect(isSessionExpired(created, now)).toBe(false);
    });

    it("returns true after 7 days", () => {
      const created = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-22T10:00:01Z");
      expect(isSessionExpired(created, now)).toBe(true);
    });

    it("respects custom expiry days", () => {
      const created = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-16T10:00:01Z");
      expect(isSessionExpired(created, now, 1)).toBe(true);
    });
  });
});
