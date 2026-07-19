# ADR-0002: Hexagonal Architecture (Ports and Adapters)

**Status**: Accepted  
**Date**: 2025-07-18

## Context

The application must be portable: we want to replace Supabase with another auth provider, replace the database, or replace the notification system without rewriting business logic. We also need clear testability of domain rules in isolation from infrastructure.

## Decision

We adopt **Hexagonal Architecture** (also known as Ports and Adapters) within each module.

Each module's internal layout:
```
domain/          — pure Java: entities, value objects, domain services
application/
  port/in/       — use case interfaces
  port/out/      — repository and gateway interfaces
  service/       — use case implementations
adapter/
  in/web/        — Spring MVC REST controllers
  out/persistence/ — JPA repositories and mappers
config/          — Spring @Configuration classes
```

Dependencies point **inward**:
- `adapter` depends on `application`
- `application` depends on `domain`
- `domain` has no external dependencies

The domain must never import from: `org.springframework.*`, `jakarta.persistence.*`, `com.supabase.*`, or any infrastructure library.

## Alternatives considered

**Layered architecture (traditional MVC)**: Easy to implement but frequently degrades into controllers calling repositories directly, business logic leaking into infrastructure, and tight coupling to frameworks.

**Clean Architecture (Uncle Bob)**: Similar principles, more prescriptive about layers and DTOs at every boundary. We adopt the same conceptual intent with lighter-weight mechanics.

## Positive consequences

- Domain and use cases are testable without Spring context or database.
- Infrastructure can be replaced without touching business logic.
- New input adapters (e.g. GraphQL, CLI, event listener) can be added by implementing an input port.
- Architectural boundaries are machine-enforceable via ArchUnit.

## Negative consequences

- More files and mapping code than a simple layered architecture.
- Initial investment in defining ports before implementing adapters.
- Requires team discipline to maintain the inward dependency rule.

Where complete separation would add unnecessary complexity for trivial CRUD, we document the exception as an ADR or inline comment rather than breaking the rule silently.

## References

- Alistair Cockburn, "Hexagonal Architecture" (2005)
- Tom Hombergs, "Get Your Hands Dirty on Clean Architecture"
