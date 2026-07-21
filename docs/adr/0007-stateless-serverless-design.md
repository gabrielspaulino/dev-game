# ADR-0007 — Stateless and Serverless-Compatible Application Design

**Status:** Accepted  
**Date:** 2026-07-21

## Context

Vercel runs Next.js functions as stateless serverless functions. Multiple instances may handle requests concurrently. Instances do not share memory. Instances may be restarted at any time.

We need to design the application to be safe and correct under these constraints.

## Decision

The application must be designed as a **stateless, serverless-compatible system**:

1. **No persistent in-memory state.** Do not store session data, caches, or locks in process memory.
2. **No local filesystem writes** for application data.
3. **No in-memory locks.** Use database transactions, constraints, and idempotency keys for consistency.
4. **No assumptions about request routing.** Do not assume the same instance handles consecutive requests from the same user.
5. **Bounded request processing.** Every request must complete within Vercel's function timeout. Long-running work is prohibited.
6. **Idempotent critical operations.** XP awards, streak updates, and session completion use idempotency keys and database unique constraints.

## Rationale

These constraints are non-negotiable given the Vercel deployment model. Violating them produces subtle, hard-to-reproduce bugs (e.g., XP is counted correctly on one instance but lost when the function restarts).

## Consequences

### Positive

- Application scales horizontally without coordination.
- No state to synchronize between instances.
- No memory leaks from accumulated in-memory state.
- Idempotency keys make operations safe to retry.

### Negative

- Cannot use in-memory caches (use Redis or database-backed caches instead, when needed).
- Cannot use background jobs without an external queue.
- Database is the source of truth for all state — requires careful transaction design.

## Enforced by

- Rules in `AGENTS.md` (section 5).
- Code review.
- Architecture tests (dependency-cruiser prevents importing Node.js-specific state patterns).

## Follow-up Actions

- Add in-memory lock detection to architecture checks (future).
- Document the external job-processing port when background jobs become necessary.
