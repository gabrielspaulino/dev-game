/**
 * Clock port.
 *
 * All business rules that depend on the current time must use this interface.
 * This makes time-dependent logic deterministic in tests.
 *
 * Production: SystemClock returns the real current time.
 * Tests: FixedClock returns a controlled time you choose.
 *
 * Rules:
 * - Never call `new Date()` directly in domain or application code.
 * - Always inject a Clock dependency.
 */

export interface Clock {
  /**
   * Returns the current UTC time as a Date object.
   */
  now(): Date;

  /**
   * Returns the current UTC date string (YYYY-MM-DD).
   * Useful for daily streak and session-date comparisons.
   */
  today(): string;
}

/**
 * Production clock that delegates to the system time.
 */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }

  today(): string {
    return this.now().toISOString().slice(0, 10);
  }
}

/**
 * Controllable clock for tests.
 * Set a fixed time so streak, session, and XP logic is deterministic.
 *
 * @example
 * const clock = new FixedClock(new Date("2026-01-15T10:00:00Z"));
 * expect(clock.today()).toBe("2026-01-15");
 */
export class FixedClock implements Clock {
  private readonly fixedTime: Date;

  constructor(fixedTime: Date) {
    this.fixedTime = new Date(fixedTime);
  }

  now(): Date {
    return new Date(this.fixedTime);
  }

  today(): string {
    return this.now().toISOString().slice(0, 10);
  }
}
