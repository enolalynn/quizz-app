export const ErrorCodes = {
  AUTH_MISSING_FIELDS: "AUTH_MISSING_FIELDS",
  AUTH_INVALID_USER: "AUTH_INVALID_USER",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  ERROR_ONE: "ERROR_ONE",
  DUPLICATE: "DUPLICATE",
  NOT_FOUND: "NOT_FOUND",
  UNMATCH: "UNMATCH",
  INVALID: "INVALID",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
