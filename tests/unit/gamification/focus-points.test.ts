import { describe, it, expect } from "vitest";
import { FixedClock } from "@/shared/domain/clock";
import {
  calculateRegenerated,
  canSpend,
  spend,
  recoverFromReview,
  createInitialFocusPointsState,
  DEFAULT_FOCUS_POINTS_CONFIG,
  type FocusPointsState,
} from "@/modules/gamification/domain/focus-points";

const THREE_HOURS = 3 * 60 * 60 * 1000;

function makeState(overrides: Partial<FocusPointsState> = {}): FocusPointsState {
  return {
    current: 5,
    lastRegenAt: new Date("2026-01-15T10:00:00Z"),
    reviewRecoveriesToday: 0,
    reviewRecoveryDate: "2026-01-15",
    ...overrides,
  };
}

describe("Focus Points", () => {
  describe("calculateRegenerated", () => {
    it("does not regenerate before interval", () => {
      const clock = new FixedClock(new Date("2026-01-15T12:00:00Z"));
      const state = makeState({ current: 3 });
      const result = calculateRegenerated(state, DEFAULT_FOCUS_POINTS_CONFIG, clock);
      expect(result.current).toBe(3);
    });

    it("regenerates 1 point after 3 hours", () => {
      const clock = new FixedClock(new Date("2026-01-15T13:00:00Z"));
      const state = makeState({ current: 3 });
      const result = calculateRegenerated(state, DEFAULT_FOCUS_POINTS_CONFIG, clock);
      expect(result.current).toBe(4);
    });

    it("regenerates multiple points over multiple intervals", () => {
      const clock = new FixedClock(
        new Date(new Date("2026-01-15T10:00:00Z").getTime() + THREE_HOURS * 3),
      );
      const state = makeState({ current: 1 });
      const result = calculateRegenerated(state, DEFAULT_FOCUS_POINTS_CONFIG, clock);
      expect(result.current).toBe(4);
    });

    it("caps at maximum", () => {
      const clock = new FixedClock(
        new Date(new Date("2026-01-15T10:00:00Z").getTime() + THREE_HOURS * 10),
      );
      const state = makeState({ current: 3 });
      const result = calculateRegenerated(state, DEFAULT_FOCUS_POINTS_CONFIG, clock);
      expect(result.current).toBe(5);
    });

    it("advances lastRegenAt by consumed intervals", () => {
      const clock = new FixedClock(
        new Date(new Date("2026-01-15T10:00:00Z").getTime() + THREE_HOURS * 2 + 1000),
      );
      const state = makeState({ current: 3 });
      const result = calculateRegenerated(state, DEFAULT_FOCUS_POINTS_CONFIG, clock);
      expect(result.current).toBe(5);
      const expectedTime = new Date("2026-01-15T10:00:00Z").getTime() + THREE_HOURS * 2;
      expect(result.lastRegenAt.getTime()).toBe(expectedTime);
    });
  });

  describe("canSpend", () => {
    it("returns true when enough points", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      expect(canSpend(makeState({ current: 3 }), DEFAULT_FOCUS_POINTS_CONFIG, clock, 2)).toBe(true);
    });

    it("returns false when not enough points", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      expect(canSpend(makeState({ current: 1 }), DEFAULT_FOCUS_POINTS_CONFIG, clock, 2)).toBe(
        false,
      );
    });

    it("considers regeneration before checking", () => {
      const clock = new FixedClock(
        new Date(new Date("2026-01-15T10:00:00Z").getTime() + THREE_HOURS),
      );
      expect(canSpend(makeState({ current: 1 }), DEFAULT_FOCUS_POINTS_CONFIG, clock, 2)).toBe(true);
    });
  });

  describe("spend", () => {
    it("deducts points", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      const result = spend(makeState({ current: 3 }), DEFAULT_FOCUS_POINTS_CONFIG, clock, 1);
      expect(result).not.toBeNull();
      expect(result!.current).toBe(2);
    });

    it("returns null when insufficient", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      const result = spend(makeState({ current: 0 }), DEFAULT_FOCUS_POINTS_CONFIG, clock, 1);
      expect(result).toBeNull();
    });

    it("regenerates before spending", () => {
      const clock = new FixedClock(
        new Date(new Date("2026-01-15T10:00:00Z").getTime() + THREE_HOURS * 2),
      );
      const result = spend(makeState({ current: 0 }), DEFAULT_FOCUS_POINTS_CONFIG, clock, 1);
      expect(result).not.toBeNull();
      expect(result!.current).toBe(1);
    });
  });

  describe("recoverFromReview", () => {
    it("recovers 1 point with 4/5 correct", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      const state = makeState({ current: 3 });
      const result = recoverFromReview(state, DEFAULT_FOCUS_POINTS_CONFIG, clock, 4, 5);
      expect(result).not.toBeNull();
      expect(result!.current).toBe(4);
    });

    it("rejects when fewer than 4 correct", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      const result = recoverFromReview(
        makeState({ current: 3 }),
        DEFAULT_FOCUS_POINTS_CONFIG,
        clock,
        3,
        5,
      );
      expect(result).toBeNull();
    });

    it("rejects when fewer than 5 questions", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      const result = recoverFromReview(
        makeState({ current: 3 }),
        DEFAULT_FOCUS_POINTS_CONFIG,
        clock,
        4,
        4,
      );
      expect(result).toBeNull();
    });

    it("caps at maximum", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      const result = recoverFromReview(
        makeState({ current: 5 }),
        DEFAULT_FOCUS_POINTS_CONFIG,
        clock,
        5,
        5,
      );
      expect(result).toBeNull();
    });

    it("limits to 3 recoveries per day", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      const state = makeState({ current: 1, reviewRecoveriesToday: 3 });
      const result = recoverFromReview(state, DEFAULT_FOCUS_POINTS_CONFIG, clock, 5, 5);
      expect(result).toBeNull();
    });

    it("resets daily recovery counter on new day", () => {
      const clock = new FixedClock(new Date("2026-01-16T10:00:00Z"));
      const state = makeState({
        current: 1,
        lastRegenAt: new Date("2026-01-16T10:00:00Z"),
        reviewRecoveriesToday: 3,
        reviewRecoveryDate: "2026-01-15",
      });
      const result = recoverFromReview(state, DEFAULT_FOCUS_POINTS_CONFIG, clock, 5, 5);
      expect(result).not.toBeNull();
      expect(result!.current).toBe(2);
      expect(result!.reviewRecoveriesToday).toBe(1);
      expect(result!.reviewRecoveryDate).toBe("2026-01-16");
    });
  });

  describe("createInitialFocusPointsState", () => {
    it("starts at maximum", () => {
      const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
      const state = createInitialFocusPointsState(DEFAULT_FOCUS_POINTS_CONFIG, clock);
      expect(state.current).toBe(5);
      expect(state.reviewRecoveriesToday).toBe(0);
    });
  });
});
