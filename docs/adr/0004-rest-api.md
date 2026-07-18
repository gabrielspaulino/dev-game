# ADR-0004: REST API

**Status**: Accepted  
**Date**: 2025-07-18

## Context

The frontend needs a well-defined interface to the backend. We need to choose an API style.

## Decision

We use a **RESTful HTTP API** with:
- JSON request and response bodies.
- Standard HTTP methods (GET, POST, PUT, PATCH, DELETE).
- Standard HTTP status codes.
- URL versioning (`/api/v1/`).
- Springdoc OpenAPI for documentation (Swagger UI available in non-production environments).
- Consistent error response format (see `docs/API.md`).

## Alternatives considered

**GraphQL**: More flexible querying, but significant complexity (schema definition, N+1 protection, resolver logic). Not worth the overhead for a backend with a single primary client (the SPA).

**gRPC**: Excellent for service-to-service communication, poor DX for browser clients without grpc-web. Not appropriate for a public-facing web API.

**tRPC**: Strong TypeScript integration but couples frontend and backend in the same language ecosystem. Incompatible with our Java backend.

## Positive consequences

- Well-understood by frontend developers.
- Excellent tooling: Swagger UI, Postman, curl.
- Stateless HTTP is naturally compatible with horizontal scaling.
- Springdoc generates OpenAPI spec automatically from controller annotations.

## Negative consequences

- Multiple round trips for complex queries (mitigated by well-designed aggregate endpoints).
- Over/under-fetching compared to GraphQL (acceptable at MVP scale).
- Versioning discipline required to maintain backward compatibility.
