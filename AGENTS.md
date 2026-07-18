# AGENTS.md — Permanent Instructions for AI Coding Agents

This file is the primary source of permanent instructions for every AI coding agent working on **DevLeap** — a gamified learning platform for software developers.

**Every agent MUST read this file before making any change.**

---

## Mandatory reading before any change

1. `AGENTS.md` (this file)
2. `README.md`
3. `docs/ARCHITECTURE.md`
4. The code and tests related to the requested change
5. Any ADRs related to the affected area (`docs/adr/`)

---

## Repository layout

```
/
├── backend/          Java 21 + Spring Boot (hexagonal architecture)
├── artifacts/frontend/   React + TypeScript + Vite (SPA)
├── docs/             All project documentation
├── .github/workflows/    CI pipelines
├── docker-compose.yml    Local development services
├── AGENTS.md         ← you are here
└── README.md
```

---

## Testing rules

- Never delete tests to make the build pass.
- Never disable tests with `@Disabled`, skip flags, comments, or equivalent without explicit authorization.
- Never weaken an assertion to accept incorrect behavior.
- Never modify a valid test to hide a regression.
- When behavior intentionally changes, update the tests and document the reason.
- When a test becomes obsolete, explain why before removing it, and replace it with a test for the new behavior.
- Every bug fix must include a regression test that fails before the fix and passes after.
- New business rules must include unit tests.
- Database integrations must include integration tests when appropriate.
- Critical user flows must include end-to-end tests.
- Do not consider a task complete while tests are failing.
- Do not ignore flaky tests. Investigate their root cause.

---

## Architecture rules

- Do not create dependencies from domain classes to Spring, JPA, Supabase, or any framework.
- Do not couple business rules to Supabase.
- Do not allow the frontend to directly access the database for core business operations.
- The frontend must consume the backend API for all main application rules.
- Do not expose JPA persistence entities through the API controllers.
- Do not place significant business logic in controllers.
- Do not place significant business logic in React components.
- Do not introduce microservices without an approved architecture decision record.
- Do not add a new library without justifying its necessity.
- Do not create speculative abstractions without a real boundary or use case.
- Preserve API backward compatibility or clearly document breaking changes.
- New dependencies between modules must respect architectural boundaries.
- Protect module boundaries using ArchUnit tests when appropriate.

---

## Database rules

- Every schema change must use a Flyway migration (`backend/src/main/resources/db/migration/`).
- Never edit a migration that may already have been executed in another environment.
- Create a new migration to correct or evolve the schema.
- Never rely on manual changes made in the Supabase dashboard.
- Never store secrets in the database or source code.
- Analyze backward compatibility for all migrations used during deployment.
- Prefer migrations that support zero-downtime deployment strategies.

---

## Documentation rules

- Update documentation whenever application behavior, architecture, configuration, API design, or development workflow changes.
- Update `docs/API.md` when endpoints are added or modified.
- Update `docs/DATA_MODEL.md` when entities or relationships change.
- Update `docs/ARCHITECTURE.md` when important components or dependencies change.
- Create or update an ADR for significant architectural decisions.
- Update `.env.example` whenever an environment variable is added.
- Never include real secrets in example files.
- Keep source code and documentation consistent.

---

## Security rules

- Never log access tokens, refresh tokens, passwords, or secret keys.
- Never expose internal stack traces directly to API clients.
- Validate every external input.
- Enforce authorization in the backend — never trust the frontend for roles or permissions.
- Do not rely only on frontend visibility controls.
- Apply the principle of least privilege.
- Do not trust user identifiers sent by the client as the authenticated identity.
- Resolve the authenticated user from the validated JWT token in the backend.
- Protect administrative endpoints by role (`ADMIN`).
- Never use the Supabase service role key in the frontend.

---

## Mandatory change process

For every task:

1. Understand the requirement.
2. Inspect the existing code.
3. Identify the affected modules.
4. Identify risks.
5. Write or update tests.
6. Implement the smallest coherent change.
7. Run the related tests.
8. Run the complete test suite when feasible.
9. Run linting and type checking.
10. Update documentation.
11. Summarize the changes.
12. Report the commands executed and their results.
13. Report real risks or pending work.

---

## Prohibited behavior

- Do not claim that something was tested unless the test was actually executed.
- Do not invent files, endpoints, or application behavior that do not exist.
- Do not hide errors.
- Do not modify unrelated files without a clear reason.
- Do not reformat large parts of the project during a small change.
- Do not add dead code.
- Do not leave TODO comments without context.
- Do not use magic values when configuration or constants are more appropriate.
- Do not create silent fallbacks for mandatory configuration.
- Do not perform destructive changes without explaining their impact.

---

## Definition of done

A task is complete only when:

- The requirement has been implemented.
- Tests have been created or updated.
- Relevant tests pass.
- Linting passes.
- Type checking passes.
- Applicable documentation has been updated.
- No secrets are present in source code.
- The code respects architectural boundaries.
- Relevant decisions are documented.
- The agent clearly reports what was completed and what could not be verified.

---

## Backend conventions

- Use Java records for DTOs when appropriate.
- Use `Optional` consistently — never return `null` from domain or application layer methods.
- Define clear domain exceptions in each module (e.g. `SessionNotFoundException`).
- Keep transactions at the correct boundary — use cases, not controllers.
- Controllers must not access repositories directly.
- No circular dependencies between modules.
- Use `UUID` for all public and internal identifiers (not database sequences).
- Inject `ClockProvider` for time — never call `LocalDate.now()` or `Instant.now()` directly in business logic.

## Frontend conventions

- Strict TypeScript — avoid `any`.
- Never scatter HTTP calls across React components — centralize in service hooks.
- Separate UI components, hooks, services, schemas, and pages.
- Consistent error handling with clear error states.
- Basic accessibility in all components.
- No critical business logic on the client.

---

## Running commands

```bash
# Backend
cd backend
mvn verify                  # full build + tests
mvn spring-boot:run         # start dev server
mvn flyway:migrate          # apply migrations manually

# Frontend
cd artifacts/frontend
pnpm dev                    # start dev server
pnpm typecheck              # type check
pnpm test                   # run tests
pnpm lint                   # lint

# Codegen (update API types from OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen
```
