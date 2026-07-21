/**
 * Typed domain errors.
 *
 * Use these error classes to communicate known failure states from domain
 * and application layers to the HTTP adapter layer. The adapter maps each
 * error class to an appropriate HTTP status code and safe response body.
 *
 * Rules:
 * - Never include stack traces or internal details in error messages.
 * - Never expose ORM or database errors directly.
 * - Keep error codes SCREAMING_SNAKE_CASE and document them in docs/API.md.
 */

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// ─── Not Found ────────────────────────────────────────────────────────────── //

export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  readonly statusCode = 404;
}

// ─── Unauthorized ─────────────────────────────────────────────────────────── //

export class UnauthorizedError extends AppError {
  readonly code = "UNAUTHORIZED";
  readonly statusCode = 401;
}

// ─── Forbidden ────────────────────────────────────────────────────────────── //

export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN";
  readonly statusCode = 403;
}

// ─── Conflict ─────────────────────────────────────────────────────────────── //

export class ConflictError extends AppError {
  readonly code: string;
  readonly statusCode = 409;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// ─── Validation ───────────────────────────────────────────────────────────── //

export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly statusCode = 422;
  readonly validationErrors: ReadonlyArray<{ field: string; message: string }>;

  constructor(
    message: string,
    validationErrors: Array<{ field: string; message: string }> = [],
  ) {
    super(message);
    this.validationErrors = validationErrors;
  }
}

// ─── Domain Rule Violations ───────────────────────────────────────────────── //

export class DomainError extends AppError {
  readonly code: string;
  readonly statusCode = 422;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// ─── Internal ─────────────────────────────────────────────────────────────── //

export class InternalError extends AppError {
  readonly code = "INTERNAL_ERROR";
  readonly statusCode = 500;
}

// ─── Type Guards ──────────────────────────────────────────────────────────── //

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
