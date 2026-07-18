package com.devlearn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * DevLeap application entry point.
 *
 * <p>Modules: identity, users, learning, questions, sessions,
 * progress, gamification, administration, shared.
 *
 * <p>Architecture: Modular monolith with Hexagonal Architecture (Ports and Adapters).
 * See docs/ARCHITECTURE.md.
 */
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
