# ADR-0003: Supabase as the Initial Replaceable Auth and Database Provider

**Status**: Accepted  
**Date**: 2025-07-18

## Context

DevLeap needs authentication and a managed PostgreSQL database. We want to move quickly without operating infrastructure but preserve the ability to switch providers without rewriting the domain.

## Decision

We use **Supabase** as the initial provider for:
1. **Authentication**: Supabase Auth issues JWTs that the backend validates.
2. **Managed PostgreSQL**: Supabase hosts the production PostgreSQL database.

Supabase is treated as a **replaceable external dependency**:
- Authentication is abstracted behind the `IdentityProvider` port.
- The initial implementation is `SupabaseIdentityProvider` (validates Supabase JWTs).
- The backend accesses PostgreSQL through a standard JDBC connection, Spring Data JPA, and Flyway — no Supabase SDK or proprietary API is used in the database layer.
- The frontend uses the Supabase JS client only for auth flows. API calls go through the backend.
- The Supabase service role key is never used in the frontend.

## Alternatives considered

**Auth0**: More feature-rich but higher cost at early stage. Switching later is possible via a new `Auth0IdentityProvider` implementation.

**Clerk**: Good DX but vendor lock-in concern. A future `ClerkIdentityProvider` can replace `SupabaseIdentityProvider`.

**Custom auth (JWT with bcrypt)**: More control, more responsibility. Not worth the risk at MVP stage.

**Self-hosted PostgreSQL on Render**: Possible, but removes managed backup and HA from the scope of our concern.

## Positive consequences

- Fast setup: no infrastructure to manage.
- Managed backups, HA, and connection pooling from Supabase.
- Standard JDBC means no Supabase SDK lock-in in the persistence layer.
- Auth migration path: implement a new `IdentityProvider` adapter — no domain changes.

## Negative consequences

- Supabase pricing may increase as scale grows.
- Supabase-specific JWT validation (JWKS endpoint) is in the adapter, not the domain.
- Local development requires either a local Supabase instance or a dev profile with a fake identity provider.

## Migration path

To migrate away from Supabase:
1. Implement a new `IdentityProvider` (e.g. `KeycloakIdentityProvider`).
2. Migrate the database to a new PostgreSQL host by updating `DATABASE_URL`.
3. Update Flyway migration configuration.
4. No domain or use case code changes required.
