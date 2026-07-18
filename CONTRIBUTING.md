# Contributing to DevLeap

Thank you for your interest in contributing.

## Before contributing

1. Read [`AGENTS.md`](AGENTS.md) — the permanent rules all contributors (human and AI) must follow.
2. Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
3. Check open issues and existing pull requests to avoid duplication.

## Development workflow

1. Fork the repository.
2. Create a branch from `main`: `git checkout -b feat/my-feature`.
3. Follow the mandatory change process in `AGENTS.md`.
4. Ensure all tests pass: `cd backend && ./mvnw verify`.
5. Ensure frontend checks pass: `cd artifacts/frontend && pnpm typecheck && pnpm test`.
6. Update documentation as required.
7. Open a pull request against `main`.

## Code style

- Backend: standard Java conventions, enforced by Checkstyle (see `backend/pom.xml`).
- Frontend: ESLint + Prettier configuration in `artifacts/frontend`.
- Run `pnpm lint` before committing frontend changes.

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add streak calculation for daily sessions
fix: prevent duplicate XP grants on session replay
docs: update API.md with new /progress endpoint
test: add integration test for session completion
```

## Adding a dependency

- Backend: add to `backend/pom.xml` and document the reason in the PR description.
- Frontend: add to `artifacts/frontend/package.json` via `pnpm add`.
- Justify every new dependency — prefer extending existing libraries.

## Adding an ADR

Create a new file in `docs/adr/` following the existing ADR format. Include context, decision, alternatives, consequences, and status.
