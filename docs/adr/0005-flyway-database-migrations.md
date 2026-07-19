# ADR-0005: Flyway as the Source of Truth for Database Schema

**Status**: Accepted  
**Date**: 2025-07-18

## Context

The database schema must evolve without manual intervention and without diverging between environments. We need a migration tool that integrates with Spring Boot and supports PostgreSQL.

## Decision

We use **Flyway** for all database schema changes.

Rules:
- Every schema change is a versioned SQL file in `backend/src/main/resources/db/migration/`.
- File naming: `V{version}__{description}.sql` (e.g. `V1__init_schema.sql`).
- Flyway runs automatically on Spring Boot startup.
- Applied migrations are never edited — new migrations correct or extend the schema.
- The `flyway_schema_history` table in PostgreSQL records which migrations have been applied.

## Alternatives considered

**Spring Data JPA `spring.jpa.hibernate.ddl-auto`**: Convenient for prototyping but dangerous in production (no versioning, no rollback control, can lose data). Rejected.

**Liquibase**: More feature-rich (XML/YAML format, rollback support, checksums). Flyway is simpler, SQL-native, and sufficient for our needs.

**Manual migrations**: Unreliable, non-repeatable, and incompatible with automated deployment.

## Positive consequences

- Migrations are versioned in Git alongside the code that uses them.
- The same migration sequence applies to every environment (local, CI, production).
- Startup fails fast if a migration cannot be applied — no silent schema drift.
- Zero-downtime deployment is possible with careful additive migrations.

## Negative consequences

- Applied migrations are immutable — requires discipline.
- Complex rollbacks require new migrations (no built-in undo in Flyway OSS).
- Checksum enforcement can surface problems if migrations are accidentally edited.
