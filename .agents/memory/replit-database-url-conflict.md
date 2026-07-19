---
name: Replit DATABASE_URL conflict with JDBC
description: Replit auto-injects DATABASE_URL in libpq format (postgresql://...) which Spring Boot's JDBC driver rejects. Workaround and profile strategy.
---

## Rule

Never use `${DATABASE_URL}` in Spring Boot's `spring.datasource.url`. Replit auto-injects `DATABASE_URL=postgresql://...` (libpq scheme), which the JDBC driver rejects with "claims to not accept jdbcUrl".

**Why:** Replit's managed PostgreSQL provisioning sets `DATABASE_URL` in the process environment before the app starts. Spring Boot picks it up literally. The `postgresql://` scheme is valid for libpq/psycopg2 but NOT for JDBC — JDBC requires `jdbc:postgresql://`.

**How to apply:**
- Use `DEVLEARN_DB_URL` (or any project-specific name) for the JDBC URL in `application.yml`.
- Keep a `replit` Spring profile (`application-replit.yml`) that excludes `DataSourceAutoConfiguration`, `HibernateJpaAutoConfiguration`, and `FlywayAutoConfiguration` so the backend starts without any database in the Replit workspace.
- Activate via `-Dspring.profiles.active=replit` in the artifact.toml dev run command.
- On Render/production, set `DEVLEARN_DB_URL=jdbc:postgresql://...` directly.
- The `-DskipTests` Maven flag skips test execution but NOT test compilation; use `-Dmaven.test.skip=true` to skip both in CI/workflow builds.
