import { describe, it, expect } from "vitest";
import { FixedClock, SystemClock } from "./clock";

describe("FixedClock", () => {
  it("returns the fixed time on now()", () => {
    const fixed = new Date("2026-01-15T10:00:00Z");
    const clock = new FixedClock(fixed);
    expect(clock.now().toISOString()).toBe("2026-01-15T10:00:00.000Z");
  });

  it("returns the fixed date string on today()", () => {
    const clock = new FixedClock(new Date("2026-01-15T23:59:59Z"));
    expect(clock.today()).toBe("2026-01-15");
  });

  it("does not mutate the original date when now() is called multiple times", () => {
    const fixed = new Date("2026-01-15T10:00:00Z");
    const clock = new FixedClock(fixed);
    const first = clock.now();
    first.setFullYear(2000);
    // Second call should still return the fixed time
    expect(clock.now().getFullYear()).toBe(2026);
  });
});

describe("SystemClock", () => {
  it("returns a Date close to the current time", () => {
    const clock = new SystemClock();
    const before = Date.now();
    const result = clock.now();
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });

  it("returns today in YYYY-MM-DD format", () => {
    const clock = new SystemClock();
    const today = clock.today();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
