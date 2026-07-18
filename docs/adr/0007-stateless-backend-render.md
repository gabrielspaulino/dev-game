# ADR-0007: Stateless Backend Hosted on Render

**Status**: Accepted  
**Date**: 2025-07-18

## Context

The Spring Boot backend must be hosted with minimal operational overhead while remaining horizontally scalable and compatible with the Twelve-Factor App methodology.

## Decision

The backend is a **stateless Spring Boot application** hosted on **Render**:
- No in-memory session state (Spring Security is stateless — JWT, not cookies).
- No local file system state.
- All persistent state in PostgreSQL (Supabase).
- Port binding via `PORT` environment variable (Render sets this automatically).
- Health check via `GET /api/actuator/health`.

Deployed as a Docker container or native Java 21 on Render.

## Alternatives considered

**AWS ECS / EKS**: More control, significantly more operational complexity. Not justified at MVP.

**Heroku**: Simple, but more expensive at scale and the platform has declined in developer experience.

**Railway**: Similar to Render, viable alternative. Render selected for better Java/Docker support documentation.

**Fly.io**: Good for containers but less familiar to the initial team.

## Positive consequences

- Stateless design enables horizontal scaling from day one.
- No session affinity required — any instance can serve any request.
- Render's managed environment reduces ops burden.
- Automatic deploys on Git push.
- Built-in health check support.

## Negative consequences

- Render's free tier has cold start delays — acceptable for MVP.
- Container startup time (JVM) is slower than Node.js. Mitigated with GraalVM native image in future.
- Vendor dependency — migrating to another host is straightforward (change the deployment config only).

## Future

When load increases, migrate to a container orchestrator (Kubernetes on EKS/GKE) or switch to GraalVM native image for fast startup and lower memory footprint.
