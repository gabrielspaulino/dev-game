/**
 * Correlation ID utilities.
 *
 * Every server request should carry a correlation ID so logs across
 * different services and log entries can be linked to the same request.
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a new correlation ID.
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Extract a correlation ID from request headers, or generate a new one.
 */
export function resolveCorrelationId(headers: Headers): string {
  return (
    headers.get("x-correlation-id") ??
    headers.get("x-request-id") ??
    generateCorrelationId()
  );
}
