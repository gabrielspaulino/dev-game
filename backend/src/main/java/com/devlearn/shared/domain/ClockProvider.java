package com.devlearn.shared.domain;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Port for time access.
 *
 * <p>All business rules that depend on the current time must use this port
 * rather than calling {@link java.time.LocalDate#now()} or {@link Instant#now()}
 * directly. This enables deterministic testing of time-sensitive logic such as
 * daily streaks, session expiry, and spaced repetition scheduling.
 */
public interface ClockProvider {

    /**
     * Returns the current instant in UTC.
     */
    Instant now();

    /**
     * Returns today's date in the given time zone.
     */
    default LocalDate today(ZoneId zoneId) {
        return LocalDate.ofInstant(now(), zoneId);
    }

    /**
     * Returns today's date in UTC.
     */
    default LocalDate todayUtc() {
        return today(ZoneId.of("UTC"));
    }
}
