# AGENTS.md — AI Agent Rules for dev-game

This is the **primary source of instructions** for every AI coding agent working on this project.
Read this file at the start of every task. Then read the referenced documents for context.

---

## 1. Mandatory Reading Before Any Change

1. This file (`AGENTS.md`)
2. `README.md`
3. `docs/ARCHITECTURE.md`
4. The code related to the requested change
5. The related tests
6. Relevant ADRs in `docs/adr/`
7. Additional documents referenced by the affected module

---

## 2. Scope Discipline

- Implement only the requested scope.
- Do not automatically advance to the next roadmap stage.
- Do not modify unrelated files without a clear reason.
- Do not perform large refactors during a small feature or bug fix.
- Prefer the smallest coherent change.
- Report unrelated problems separately instead of silently fixing everything.

---

## 3. Testing Rules

- **Never delete tests** only to make the build pass.
- **Never disable tests** using skip, only, comments, config exclusions, or equivalent.
- **Never weaken assertions** to accept incorrect behavior.
- **Never modify a valid test** to hide a regression.
- Never reduce coverage intentionally without explaining the impact.
- Every bug fix must include a regression test that fails before the fix and passes after.
- New business rules must have unit tests.
- Persistence behavior must have integration tests.
- Authentication and authorization changes must have security tests.
- Do not consider a task complete while relevant tests are failing.
- Do not claim a test was executed unless it was actually executed.

---

## 4. Architecture Rules

```
UI + Framework Adapters → Application Use Cases → Domain
Infrastructure Adapters implement Ports defined by Application/Domain
The reverse dependency MUST NOT occur.
```

- Do not put core business logic in Route Handlers.
- Do not put core business logic in React components.
- Do not access the database directly from UI components.
- Do not expose ORM records through the API.
- Do not couple the domain to Next.js or Supabase.
- Do not couple application use cases directly to a specific ORM.
- Do not introduce microservices without an approved ADR.
- Do not create speculative abstractions without a real external boundary.
- Keep provider-specific code inside adapters.
- Preserve API compatibility or document breaking changes.

---

## 5. Vercel and Serverless Rules

- Do not rely on persistent process memory.
- Do not use local filesystem storage for application data.
- Do not assume requests hit the same server instance.
- Do not use in-memory locks for business consistency.
- Do not start permanent background loops.
- Do not perform long-running background work after returning an HTTP response.
- Use transactions, constraints, idempotency, and external services where appropriate.
- Use the **Node.js runtime** by default. Use Edge runtime only when documented.

---

## 6. Database Rules

- Every schema change must use a versioned migration (`npm run db:generate`).
- Never edit a migration that may already have run in another environment.
- Create a new migration to correct or evolve the schema.
- Never rely solely on manual Supabase dashboard changes.
- Test persistence behavior against PostgreSQL.
- Do not expose database credentials to the browser.
- Run migrations with `DIRECT_DATABASE_URL`, not the pooled URL.

---

## 7. Security Rules

- Never expose secrets to Client Components.
- Never prefix secrets with `NEXT_PUBLIC_`.
- Never expose the Supabase service-role key to the browser.
- Never log tokens, passwords, cookies, authorization headers, or secret keys.
- Validate all external inputs at the boundary (Route Handlers, Server Actions).
- Enforce authorization on the server — never trust frontend role checks.
- Resolve authenticated identity from the validated session or token.
- Verify resource ownership in server-side use cases.
- Return safe error responses without stack traces.

---

## 8. Documentation Rules

- Update docs when behavior, architecture, API, config, or workflow changes.
- Update `docs/API.md` when endpoints change.
- Update `docs/DATA_MODEL.md` when persistence or domain models change.
- Update `docs/ARCHITECTURE.md` when important dependencies or components change.
- Update `docs/GAME_RULES.md` when XP, levels, streaks, or reward behavior changes.
- Update `docs/LEARNING_ENGINE.md` when session-selection or mastery rules change.
- Create or update an ADR for significant architectural decisions.
- Update `.env.example` whenever configuration changes.

---

## 9. Mandatory Change Process

For every task:
1. Understand the requirement.
2. Inspect the existing implementation.
3. Identify affected modules and documents.
4. Identify risks and external boundaries.
5. Create or update tests first (TDD where practical).
6. Implement the smallest coherent change.
7. Run relevant tests.
8. Run linting: `npm run lint`
9. Run type checking: `npm run typecheck`
10. Run the production build: `npm run build`
11. Update documentation.
12. Review the diff for unrelated changes.
13. Summarize what was done, what commands ran, and what the outcomes were.

---

## 10. Prohibited Behavior

- Do not claim work was completed when it was not.
- Do not claim tests passed when they were not executed.
- Do not hide errors or failures.
- Do not invent files, endpoints, tables, or behavior.
- Do not add dead code.
- Do not leave unexplained TODO comments.
- Do not add dependencies without justification.
- Do not use `any` to bypass TypeScript errors without a documented reason.
- Do not suppress lint or TypeScript errors broadly.
- Do not add silent fallbacks for mandatory configuration.
- Do not commit secrets.
- Do not automatically advance to another roadmap stage.

---

## 11. Definition of Done

A task is complete only when:
- The requested behavior is implemented.
- Relevant tests exist and pass.
- Linting passes (`npm run lint`).
- Type checking passes (`npm run typecheck`).
- The production build passes (`npm run build`).
- Applicable documentation is updated.
- No secrets are present in the source code.
- Architectural boundaries are respected.
- Significant decisions are documented.
- The final report states what was and was not verified.

---

## 12. Key Documents

| Document | Purpose |
|---|---|
| `docs/ARCHITECTURE.md` | System design, modules, dependencies |
| `docs/PRODUCT.md` | Vision, scope, terminology |
| `docs/DEVELOPMENT.md` | Local setup and workflow |
| `docs/TESTING.md` | Testing strategy and commands |
| `docs/DEPLOYMENT.md` | Vercel + Supabase deployment |
| `docs/API.md` | API conventions and endpoint reference |
| `docs/DATA_MODEL.md` | Entities, schema, migrations |
| `docs/GAME_RULES.md` | XP, levels, streaks, rewards |
| `docs/LEARNING_ENGINE.md` | Session assembly, mastery, spaced repetition |
| `docs/SECURITY.md` | Auth, authorization, threat model |
| `docs/RUNBOOK.md` | Operational procedures |
| `docs/ROADMAP.md` | Implementation stages |
| `docs/adr/` | Architecture Decision Records |
