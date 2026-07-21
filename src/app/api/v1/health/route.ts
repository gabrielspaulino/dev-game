/**
 * GET /api/v1/health
 *
 * Public health endpoint. Returns application status and basic diagnostics.
 * Safe to call without authentication.
 *
 * Response:
 * - 200: Application is healthy
 * - 503: Application is degraded (e.g., database unavailable)
 *
 * Rules:
 * - Must not expose secrets, stack traces, or database credentials.
 * - Must not require authentication.
 * - Must respond quickly (short timeout for DB check).
 */

import { NextResponse } from "next/server";
import { resolveCorrelationId } from "@/shared/observability/correlation";
import { createLogger } from "@/shared/infrastructure/logger";

// Force Node.js runtime — needed for postgres driver
export const runtime = "nodejs";

// Do not cache health checks
export const dynamic = "force-dynamic";

const log = createLogger({ module: "health" });

const VERSION = process.env["npm_package_version"] ?? "0.1.0";

type DatabaseStatus = "connected" | "disconnected" | "unknown";
type AppStatus = "ok" | "degraded" | "error";

interface HealthResponse {
  status: AppStatus;
  version: string;
  timestamp: string;
  services: {
    database: DatabaseStatus;
  };
}

async function checkDatabase(): Promise<DatabaseStatus> {
  // Only attempt a database check if DATABASE_URL is configured
  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) return "unknown";

  try {
    // Lazy import to avoid loading the full DB module when DB is not configured
    const { db } = await import("@/shared/infrastructure/db");
    await db.execute("SELECT 1");
    return "connected";
  } catch {
    return "disconnected";
  }
}

export async function GET(request: Request): Promise<NextResponse<HealthResponse>> {
  const correlationId = resolveCorrelationId(new Headers(request.headers));
  const timestamp = new Date().toISOString();

  log.debug({ correlationId }, "Health check");

  const database = await checkDatabase();
  const status: AppStatus = database === "disconnected" ? "degraded" : "ok";
  const httpStatus = status === "ok" ? 200 : 503;

  const body: HealthResponse = {
    status,
    version: VERSION,
    timestamp,
    services: { database },
  };

  return NextResponse.json(body, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store",
      "X-Correlation-Id": correlationId,
    },
  });
}
