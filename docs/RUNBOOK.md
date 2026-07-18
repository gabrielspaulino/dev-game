# Runbook — DevLeap

Operational procedures and incident response.

## How to check application health

```bash
# Quick health check (returns 200 if up)
curl https://your-backend.onrender.com/api/healthz

# Full health check including DB (Spring Actuator)
curl https://your-backend.onrender.com/api/actuator/health

# Metrics
curl https://your-backend.onrender.com/api/actuator/metrics
```

Expected responses:
- `GET /api/healthz` → `{"status":"UP"}`
- `GET /api/actuator/health` → `{"status":"UP","components":{"db":{"status":"UP"},...}}`

If the DB component is `DOWN`, there is a database connectivity issue.

## How to investigate login failures

**Symptoms**: Users cannot log in; frontend shows auth error.

1. Check frontend browser console for the specific error (JWT format, CORS, network).
2. Check backend logs in Render for `401` responses.
3. Verify `SUPABASE_JWT_ISSUER` and `SUPABASE_JWT_AUDIENCE` environment variables match your Supabase project settings.
4. Verify the Supabase JWKS endpoint is reachable from the backend:
   ```bash
   curl https://your-project.supabase.co/auth/v1/.well-known/jwks.json
   ```
5. Check Supabase Auth logs in the Supabase dashboard → Logs → Auth.
6. Verify Supabase Redirect URLs include the production frontend domain.

## How to investigate database failures

**Symptoms**: `{"status":"DOWN"}` from actuator/health; 500 errors on data endpoints.

1. Check backend logs for `DataAccessException` or connection pool errors.
2. Verify `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` are set correctly.
3. Test database connectivity from the Render shell (if available):
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```
4. Check Supabase dashboard → Settings → Database for connection limits.
5. Check if the connection pool is exhausted — look for "timeout waiting for connection from pool" in logs.

## How to investigate migration failures

**Symptoms**: Application fails to start; logs show Flyway error.

1. Check Render startup logs for `FlywayException`.
2. Common causes:
   - Checksum mismatch: a committed migration file was modified after being applied. **Never edit applied migrations** — create a new one.
   - SQL syntax error: fix the migration file and deploy again.
   - Missing precondition: a migration depends on data that doesn't exist in the target environment.
3. To repair a checksum mismatch (last resort, only if migration was not applied to production):
   ```sql
   DELETE FROM flyway_schema_history WHERE version = 'problematic_version';
   ```
4. For production migration failures, consider rolling back to the previous deployment and fixing the migration.

## How to investigate HTTP 5xx errors

1. Check Render logs for the request's correlation ID (present in error responses as `correlationId`).
2. Search logs by correlation ID to find the full stack trace.
3. 5xx errors are never exposed to clients — the response body only contains the error format from `docs/API.md`.
4. Common causes: NullPointerException in a mapper, database constraint violation, external service timeout.

## How to identify CORS issues

**Symptoms**: Browser console shows CORS error; preflight request fails.

1. Verify `CORS_ALLOWED_ORIGINS` in Render matches the exact frontend origin (including protocol, no trailing slash).
2. Check backend logs for CORS rejection log messages.
3. Verify the Vercel deployment domain is in the allowed origins list.
4. For preview deployments, add the Vercel preview URL pattern to allowed origins.

## How to roll back a deployment

### Backend (Render)
1. Go to Render → Your service → Events.
2. Click "Roll back" next to the previous successful deployment.
3. Or: revert the Git commit, push, and Render redeploys automatically.

### Frontend (Vercel)
1. Go to Vercel → Your project → Deployments.
2. Find the last stable deployment, click the three-dot menu → "Promote to Production".

### Database
- Flyway migrations are forward-only. To reverse a schema change, write a new `V{n+1}__rollback_description.sql`.
- Data rollback requires a database backup. Ensure regular backups are configured in Supabase.

## How to disable a feature through configuration

DevLeap uses Spring application properties for feature flags:

```yaml
devlearn:
  features:
    placement-test-enabled: false
    streak-enabled: true
```

These can be overridden via environment variables in Render:
```
DEVLEARN_FEATURES_PLACEMENT-TEST-ENABLED=false
```

## Where to inspect logs

| Environment | Location |
|-------------|---------|
| Local | Terminal running `./mvnw spring-boot:run` |
| Render | Render dashboard → Your service → Logs |
| Vercel | Vercel dashboard → Your project → Functions/Logs |
| Supabase | Supabase dashboard → Logs → API, Auth, Database |

Logs are structured JSON. Search by `correlationId` to trace a specific request across log lines.

## How to handle common incidents

### "Users can't complete sessions — 409 Conflict"
Likely idempotency key collision. Check if the client is generating unique keys per session completion. The key must be `session:{session_id}:complete` — one per session ID.

### "XP not updating after session"
1. Check `experience_transactions` table for the session's idempotency key.
2. If missing, the XP grant failed — check backend logs for the error.
3. If present, the frontend may be showing stale data — check if TanStack Query is invalidating the user profile cache after session completion.

### "Streak reset unexpectedly"
1. Check `streaks` table for the user's `last_session_date`.
2. Verify the backend's timezone detection is reading the user's timezone correctly.
3. Check if the session completed near midnight — timezone edge cases.

### "Backend not starting on Render"
1. Check startup logs for Flyway errors or missing environment variables.
2. Verify Java 21 runtime is selected in Render.
3. Verify the start command is `java -jar target/*.jar` and the build command produced a fat JAR.
