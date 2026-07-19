# ADR-0001: Modular Monolith Architecture

**Status**: Accepted  
**Date**: 2025-07-18

## Context

DevLeap needs an architecture that supports rapid initial development with a small team while preserving the ability to scale and evolve components independently in the future.

Common approaches:
1. Single-module monolith (fast to start, hard to evolve)
2. Modular monolith (structured, one deployable unit)
3. Microservices from day one (complex, expensive, premature)

## Decision

We implement DevLeap as a **modular monolith**: a single Spring Boot deployable unit internally organized into discrete business modules (`identity`, `users`, `learning`, `questions`, `sessions`, `progress`, `gamification`, `administration`).

Module boundaries are enforced by:
- Java package structure.
- ArchUnit tests that fail the build if illegal cross-module imports are detected.
- A documented dependency graph (`docs/ARCHITECTURE.md`).

## Alternatives considered

**Microservices from day one**: Rejected. Adds operational complexity (service discovery, distributed tracing, network failures) before the domain is well-understood. Premature decomposition leads to incorrect service boundaries.

**Single-module monolith**: Rejected. Without internal boundaries, the codebase degrades into an unmaintainable "big ball of mud" as it grows.

## Positive consequences

- Simple deployment (one artifact).
- No network latency between modules.
- Atomic transactions across module boundaries when needed.
- Faster development in early stages.
- Clear path to extract modules as microservices when a module needs independent scaling.

## Negative consequences

- All modules scale together — a high-traffic module cannot be scaled independently without extraction.
- Shared deployment cycle — any change requires redeploying the entire backend.
- Requires discipline to maintain module boundaries (mitigated by ArchUnit tests).

## References

- Sam Newman, "Monolith to Microservices" — chapter on modular monoliths.
- Martin Fowler, "Modular Monolith or Microservices?"
