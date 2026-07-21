/**
 * Shared validation utilities.
 *
 * All external input (Route Handler requests, form data) must be validated
 * at the boundary before reaching application use cases.
 */

import { z, ZodError } from "zod";
import { ValidationError } from "@/shared/domain/errors";

/**
 * Parse and validate external input using a Zod schema.
 * Converts ZodError into a typed ValidationError for uniform error handling.
 */
export function parseInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const validationErrors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    throw new ValidationError("Validation failed.", validationErrors);
  }

  return result.data;
}

/**
 * Re-export zod for convenience so callers don't need to install separately.
 */
export { z, ZodError };
