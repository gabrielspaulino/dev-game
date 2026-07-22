# ADR-0004 — Supabase as the Initial PostgreSQL and Authentication Provider

**Status:** Accepted  
**Date:** 2026-07-21

## Context

We need a hosted PostgreSQL database and an authentication system for the MVP. We want to move quickly without operating database infrastructure ourselves.

## Decision

We will use **Supabase** as:

1. The initial **PostgreSQL provider** (managed PostgreSQL with pgBouncer connection pooling).
2. The initial **authentication provider** (Supabase Auth with JWTs).

Supabase is treated as a **replaceable external provider**, not a core architectural dependency:

- The domain never imports Supabase SDK types.
- The `IdentityProvider` port abstracts authentication.
- Repository ports abstract persistence.
- `SupabaseIdentityProvider` is one adapter — not the only possible one.

## Alternatives Considered

- **Neon (PostgreSQL):** Serverless PostgreSQL with excellent Vercel integration. Authentication would need a separate provider.
- **PlanetScale (MySQL):** Not PostgreSQL — foreign key support requires workarounds. Eliminated.
- **Auth0 or Clerk:** More specialized auth, higher cost for MVP. Can be adopted later.
- **Self-hosted PostgreSQL:** Too much operational overhead for MVP.
- **Supabase (selected):** Provides both PostgreSQL and auth in one platform. Generous free tier. Well-supported with Next.js.

## Positive Consequences

- Single platform for database and auth reduces setup complexity.
- Generous free tier for MVP.
- pgBouncer connection pooling is included.
- Auth redirect URLs and JWT management are handled.

## Negative Consequences

- Vendor dependency for both database and auth simultaneously.
- Supabase RLS is explicitly NOT used as the primary authorization mechanism (use cases enforce authorization instead).
- Supabase user IDs must be mapped to internal user IDs — managed by the `identity` module.

## Follow-up Actions

- Never import Supabase SDK types into domain or application layers.
- Implement `SupabaseIdentityProvider` as an adapter that implements `IdentityProvider`.
- Document the Supabase configuration in `docs/DEPLOYMENT.md`.
