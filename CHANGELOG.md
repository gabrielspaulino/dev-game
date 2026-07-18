# Changelog

All notable changes to DevLeap are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- Stage 0 — Foundation: project structure, backend skeleton, frontend scaffold, documentation, CI pipeline.

---

## [0.1.0] — Stage 0 — Foundation

### Added
- Initial monorepo structure (`backend/`, `artifacts/frontend/`, `docs/`).
- Spring Boot 3.x backend with health endpoint and Springdoc OpenAPI.
- React + TypeScript + Vite frontend with health connectivity check.
- Flyway configuration and initial database migration skeleton.
- Docker Compose for local PostgreSQL.
- GitHub Actions CI pipeline for backend and frontend.
- Full documentation set: PRODUCT, ARCHITECTURE, DEVELOPMENT, TESTING, DEPLOYMENT, API, DATA_MODEL, GAME_RULES, LEARNING_ENGINE, RUNBOOK.
- Architecture Decision Records: 0001–0007.
- `AGENTS.md` with permanent AI agent rules.
- `SECURITY.md` with threat model.
- `.env.example` files for backend and frontend.
- Render deployment configuration (`render.yaml`).
- Vercel deployment configuration (`vercel.json`).
- Dockerfile for backend container.
