# Contributing to dev-game

Thank you for your interest in contributing!

## Before You Start

1. Read `AGENTS.md` — it contains the mandatory rules for all contributors and AI agents.
2. Read `docs/ARCHITECTURE.md` — understand the module boundaries before writing code.
3. Read `docs/DEVELOPMENT.md` — set up your local environment.

## Development Workflow

1. Create a feature branch from `main`.
2. Write tests before or alongside implementation.
3. Ensure all verifications pass before opening a pull request:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

## Pull Request Requirements

- Reference the relevant issue or roadmap stage.
- Describe what changed and why.
- Include a testing plan.
- Ensure CI passes before requesting review.
- Update documentation when behavior changes.
- Do not include unrelated changes.

## Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat(sessions): add daily session generation use case
fix(gamification): prevent duplicate XP awards on concurrent requests
docs(adr): add ADR-0009 for spaced repetition algorithm
chore(deps): upgrade drizzle-orm to 0.40
```

## Code of Conduct

This project follows a respectful, professional standard.
Constructive feedback is always welcome.
