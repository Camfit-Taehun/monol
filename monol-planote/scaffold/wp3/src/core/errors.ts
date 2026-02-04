export type ErrorCode =
  | "INVALID_ARGUMENT"
  | "NOT_FOUND"
  | "PATH_OUTSIDE_ROOT"
  | "PLAN_ROOT_MISSING"
  | "LOCKED"
  | "READ_ONLY"
  | "ANCHOR_AMBIGUOUS"
  | "SCHEMA_MIGRATION_REQUIRED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
