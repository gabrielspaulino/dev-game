# ADR-0002 — Hexagonal Architecture and Ports & Adapters

**Status:** Accepted  
**Date:** 2026-07-21

## Context

We need to decide how to structure the internal layers of each module so that business rules remain isolated from external providers (databases, authentication, notifications).

## Decision

We will apply **Hexagonal Architecture (Ports and Adapters)** principles within each module.

Dependency rule:
```
UI + Framework Adapters → Application Use Cases → Domain
Infrastructure Adapters implement Ports ← defined by Application/Domain
```

- **Domain layer:** Entities, value objects, domain services. No external imports.
- **Application layer:** Use cases. Depends only on domain and ports. No framework imports.
- **Ports:** TypeScript interfaces for external dependencies (repositories, clocks, selectors).
- **Adapters:** Implementations of ports (Drizzle, Supabase, etc.). Live in infrastructure.
- **Framework layer:** Next.js Route Handlers, Server Components. Calls application use cases.

## Alternatives Considered

- **Active Record / direct ORM usage:** Simple but couples domain to ORM. Replacing the database requires rewriting business rules.
- **Transaction Script:** No clear domain model. Hard to test business rules in isolation.
- **Hexagonal (selected):** Business rules are independent of frameworks and external providers. Easy to test with fake adapters. Providers are replaceable.

## Positive Consequences

- Domain rules can be unit-tested without a database or HTTP server.
- Authentication providers are replaceable without touching business logic.
- Database ORM is replaceable without touching use cases.
- Clear responsibility boundaries for every layer.

## Negative Consequences

- More files and interfaces than a simple approach.
- Mapping between domain objects and persistence records adds boilerplate.
- Requires team discipline to keep layers clean.

## Follow-up Actions

- Enforce the dependency rule with dependency-cruiser in CI.
- Create `Clock`, `QuestionSelector`, and repository port interfaces before implementing adapters.
