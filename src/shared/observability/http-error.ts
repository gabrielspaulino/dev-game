/**
 * HTTP error response helpers.
 *
 * Maps AppErrors to safe, documented JSON responses.
 * Never exposes stack traces or internal database details.
 */

import { NextResponse } from "next/server";
import { isAppError, InternalError } from "@/shared/domain/errors";
import { createLogger } from "@/shared/infrastructure/logger";

const log = createLogger({ module: "http-error" });

export interface ApiErrorBody {
  code: string;
  message: string;
  timestamp: string;
  path: string;
  correlationId: string;
  validationErrors: Array<{ field: string; message: string }>;
}

/**
 * Convert any error into a safe NextResponse.
 * AppErrors are mapped directly. Unknown errors become 500s.
 */
export function toErrorResponse(
  err: unknown,
  path: string,
  correlationId: string,
): NextResponse<ApiErrorBody> {
  const timestamp = new Date().toISOString();

  if (isAppError(err)) {
    if (err.statusCode >= 500) {
      log.error({ err, correlationId, path }, "Server error");
    } else {
      log.warn({ code: err.code, correlationId, path }, err.message);
    }

    const body: ApiErrorBody = {
      code: err.code,
      message: err.message,
      timestamp,
      path,
      correlationId,
      validationErrors:
        "validationErrors" in err
          ? (err.validationErrors as Array<{ field: string; message: string }>)
          : [],
    };

    return NextResponse.json(body, { status: err.statusCode });
  }

  // Unknown errors — log the full error but return a safe message
  log.error({ err, correlationId, path }, "Unexpected error");

  const internalError = new InternalError("An unexpected error occurred.");
  const body: ApiErrorBody = {
    code: internalError.code,
    message: internalError.message,
    timestamp,
    path,
    correlationId,
    validationErrors: [],
  };

  return NextResponse.json(body, { status: 500 });
}
