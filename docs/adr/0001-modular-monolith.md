# ADR-0001 — Modular Monolith Architecture

**Status:** Accepted  
**Date:** 2026-07-21

## Context

We need to choose how to organize the codebase. Options range from a simple layered monolith to a distributed microservices architecture.

The product is a new application with evolving requirements. The team is small. The infrastructure must be simple enough to deploy to Vercel.

## Decision

We will implement the application as a **modular monolith**: a single deployable unit organized by business domain rather than technical type.

Business modules (`identity`, `users`, `learning`, `questions`, `sessions`, `progress`, `gamification`, `administration`) have internal boundaries. Modules communicate through explicitly defined interfaces (ports). No module imports from another module's internal layers.

## Alternatives Considered

- **Simple layered monolith:** Easy to start but promotes coupling. Domain logic leaks into infrastructure and vice versa.
- **Microservices from the start:** Too much operational overhead for a new product. Premature distribution creates distributed system problems without the scale to justify them.
- **Modular monolith (selected):** Clear domain boundaries enable future extraction if needed. One deployment. No distributed system complexity.

## Positive Consequences

- Single deployment — easy to manage on Vercel.
- Clear domain ownership — each module has an explicit boundary.
- Testable in isolation — modules can be tested with fake adapters.
- Evolvable — a module can be extracted into a service later by replacing its adapters with HTTP clients.

## Negative Consequences

- Requires discipline to maintain module boundaries (mitigated by dependency-cruiser checks in CI).
- All modules scale together (acceptable at this stage).

## Follow-up Actions

- Configure dependency-cruiser to enforce module boundaries in CI.
- Document inter-module dependencies as they are introduced.
