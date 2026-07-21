/**
 * Structured logger.
 *
 * Uses pino for structured JSON logs in production and pino-pretty in
 * development. Logs are written to stdout — never to the filesystem.
 *
 * Rules:
 * - Never log tokens, passwords, cookies, authorization headers, or secrets.
 * - Always include a correlationId when available.
 * - This module is server-only.
 */

import "server-only";
import pino from "pino";

const isDevelopment = process.env["NODE_ENV"] !== "production";
const logLevel = process.env["LOG_LEVEL"] ?? (isDevelopment ? "debug" : "info");

export const logger = pino({
  level: logLevel,
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "HH:MM:ss",
        },
      }
    : undefined,
  redact: {
    paths: [
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "cookie",
      "serviceRoleKey",
      "*.password",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
    ],
    censor: "[REDACTED]",
  },
});

export type Logger = typeof logger;

/**
 * Create a child logger with a fixed context.
 * Use this in modules to add structured context to every log entry.
 *
 * @example
 * const log = createLogger({ module: "sessions" });
 * log.info({ userId }, "Session created");
 */
export function createLogger(bindings: Record<string, unknown>): Logger {
  return logger.child(bindings) as Logger;
}
