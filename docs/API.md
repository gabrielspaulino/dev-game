# API Reference — DevLeap

## Conventions

- Base path: `/api/v1`
- Format: JSON (`Content-Type: application/json`)
- Authentication: Bearer JWT in `Authorization` header
- Versioning: URL path (`/v1/`)

## Authentication

All endpoints except `/api/healthz` and `/api/actuator/**` require a valid Supabase JWT.

```http
Authorization: Bearer <supabase-jwt>
```

The backend validates the token signature and extracts the internal user identity. Client-asserted roles and user IDs are ignored.

## Response codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No content (successful DELETE) |
| 400 | Bad request (validation error) |
| 401 | Unauthenticated |
| 403 | Forbidden (authenticated but insufficient role) |
| 404 | Not found |
| 409 | Conflict (duplicate, idempotency) |
| 422 | Unprocessable entity |
| 500 | Internal server error |

## Error format

All error responses use this structure:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/v1/daily-sessions",
  "correlationId": "a3f2-...",
  "validationErrors": [
    {
      "field": "email",
      "message": "must be a valid email address"
    }
  ]
}
```

`validationErrors` is only present for `400` responses with field-level errors.

## Pagination

List endpoints that may return large results support cursor-based pagination:

```
GET /api/v1/history?cursor=<opaque-cursor>&limit=20
```

Response:
```json
{
  "items": [...],
  "nextCursor": "<opaque-cursor-or-null>",
  "hasMore": true
}
```

## Idempotency

POST requests for operations that must not be duplicated (session completion, XP grants) accept an optional `Idempotency-Key` header.

```http
Idempotency-Key: <client-generated-uuid>
```

The server stores the result for 24 hours. Replaying the same key returns the original response without side effects.

## Live API documentation

When running locally:
```
http://localhost:8080/api/swagger-ui.html
```

## Endpoints (Stage 0)

### Health

```
GET /api/healthz
GET /api/actuator/health
```

Response (200):
```json
{ "status": "UP" }
```

---

## Endpoints (planned — Stage 1+)

### Identity & Users

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/me` | Get authenticated user profile | USER |
| PUT | `/api/v1/me` | Update user profile | USER |

### Learning paths

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/learning-paths` | List available learning paths | USER |
| GET | `/api/v1/learning-paths/{id}` | Get a specific learning path | USER |

### Placement test

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/placement-tests` | Start placement test | USER |
| POST | `/api/v1/placement-tests/{id}/complete` | Submit placement answers | USER |

### Daily sessions

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/daily-sessions/current` | Get today's active session | USER |
| POST | `/api/v1/daily-sessions` | Create/resume today's session | USER |
| GET | `/api/v1/daily-sessions/{id}` | Get a specific session | USER |
| POST | `/api/v1/daily-sessions/{id}/answers` | Submit an answer | USER |
| POST | `/api/v1/daily-sessions/{id}/complete` | Complete a session | USER |

### Progress & Stats

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/progress` | Get skill progress across all skills | USER |
| GET | `/api/v1/stats` | Get summary stats (XP, streak, level) | USER |
| GET | `/api/v1/history` | Get session history (paginated) | USER |

### Administration

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/admin/questions` | List all questions | ADMIN |
| POST | `/api/v1/admin/questions` | Create a question | ADMIN |
| GET | `/api/v1/admin/questions/{id}` | Get a question | ADMIN |
| PUT | `/api/v1/admin/questions/{id}` | Update a question | ADMIN |
| DELETE | `/api/v1/admin/questions/{id}` | Delete a question | ADMIN |
