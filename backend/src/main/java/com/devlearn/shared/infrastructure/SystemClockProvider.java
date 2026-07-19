package com.devlearn.shared.infrastructure;

import com.devlearn.shared.domain.ClockProvider;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;

/**
 * Production implementation of {@link ClockProvider}.
 *
 * <p>Uses {@link Clock#systemUTC()} so the underlying clock can be replaced
 * in tests via dependency injection without modifying business logic.
 */
@Component
public class SystemClockProvider implements ClockProvider {

    private final Clock clock;

    public SystemClockProvider() {
        this.clock = Clock.systemUTC();
    }

    /** Package-private constructor for testing with a fixed clock. */
    SystemClockProvider(Clock clock) {
        this.clock = clock;
    }

    @Override
    public Instant now() {
        return Instant.now(clock);
    }
}
