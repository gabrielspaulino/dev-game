# Runbook

Operational procedures for the dev-game application.

## Check Application Availability

```bash
curl https://your-domain/api/v1/health
```

Healthy response: `{ "status": "ok", ... }`
Degraded response: `{ "status": "degraded", ... }` (database unreachable)

Check Vercel dashboard → Deployments for function errors.

## Investigate Login Failures

1. Check Supabase Auth logs: Supabase dashboard → Auth → Logs.
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel.
3. Verify the auth callback URL is registered in Supabase Auth settings.
4. Check Vercel function logs for `UNAUTHORIZED` errors.

## Investigate API Failures

1. Collect the `X-Correlation-Id` from the response header.
2. Search Vercel function logs for that correlation ID.
3. Identify the error code and stack (if internal) in logs.
4. Check the error code against `docs/API.md` for expected behavior.

## Investigate Database Connection Issues

1. Check the health endpoint: `GET /api/v1/health` → `services.database`.
2. Verify `DATABASE_URL` is set in Vercel.
3. Verify the Supabase project is running (Supabase dashboard).
4. Check connection limits in Supabase dashboard → Database → Connections.
5. Verify pgBouncer is enabled and using the correct port (6543 for pooled).

## Investigate Migration Problems

1. Run `npm run db:migrate` locally pointing at the affected database.
2. Check the `drizzle_migrations` table to see which migrations have been applied.
3. Never edit an applied migration — write a new one to correct the schema.
4. If a migration fails partway, investigate the partial state and write a corrective migration.

## Identify Authentication Configuration Issues

1. Verify `SUPABASE_JWT_ISSUER` matches your Supabase project URL + `/auth/v1`.
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is the correct key from your Supabase project settings.
3. Verify `ENABLE_LOCAL_AUTH=false` in production (check Vercel env vars).

## Identify Vercel Runtime Failures

1. Check Vercel dashboard → Functions logs for the affected route.
2. Look for cold-start errors, timeout errors, or missing environment variables.
3. Check `X-Vercel-Id` response header and use it to find the specific log entry.

## Investigate HTTP 5xx Responses

1. Collect the `correlationId` from the error response body.
2. Search function logs for that ID.
3. Look for `InternalError` or unhandled exception log entries.
4. Check database connectivity if the error mentions the DB.

## Inspect Logs

Logs are available in:
- **Vercel dashboard:** Project → Functions → Logs (real-time and historical)
- **Locally:** `npm run dev` (pretty-printed pino logs in terminal)

Set `LOG_LEVEL=debug` for verbose logs during investigation.

## Roll Back a Deployment

1. Go to Vercel dashboard → Deployments.
2. Find the last known good deployment.
3. Click **Promote to Production**.
4. If the rollback involves schema changes, assess whether a compensating database migration is needed.

## Disable a Feature Through Configuration

```
FEATURE_ADMIN_PANEL=false  → Disables admin panel routes
ENABLE_LOCAL_AUTH=false    → Must always be false in production
```

Set the variable in Vercel and redeploy.

## Respond to Common Incidents

### "Users can't log in"
1. Check Supabase Auth logs.
2. Verify auth configuration (callback URLs, anon key).
3. Check health endpoint for database status.

### "XP not updating after session"
1. Check logs for the session completion request.
2. Verify the idempotency key was not reused unexpectedly.
3. Check ExperienceTransaction table for missing or duplicate records.

### "Streak reset incorrectly"
1. Verify user's time zone is set correctly.
2. Check the `Streak.last_session_date` value in the database.
3. Check logs for any error during streak update.

### "Database is at connection limit"
1. Verify `DATABASE_URL` uses the pgBouncer pooled URL (port 6543).
2. Check for any code that opens a connection without reusing the singleton.
3. Consider reducing Vercel concurrency or increasing Supabase connection limits.
