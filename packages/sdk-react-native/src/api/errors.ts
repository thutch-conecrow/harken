import type { components } from "../types/index.js";

type ErrorResponse = components["schemas"]["ErrorResponse"];
type ErrorDetail = components["schemas"]["ErrorDetail"];

/**
 * Base error class for Harken API errors.
 */
export class HarkenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HarkenError";
  }
}

/**
 * Error thrown when the API returns an error response.
 */
export class HarkenApiError extends HarkenError {
  /** HTTP status code */
  readonly status: number;
  /** Machine-readable error code */
  readonly code: string;
  /** Validation error details (if present) */
  readonly details?: ErrorDetail[];
  /** Retry-After value in seconds (from 429 responses) */
  readonly retryAfter?: number;

  constructor(status: number, response: ErrorResponse, options?: { retryAfter?: number }) {
    super(response.error.message);
    this.name = "HarkenApiError";
    this.status = status;
    this.code = response.error.code;
    this.details = response.error.details;
    this.retryAfter = options?.retryAfter;
  }

  /** True if this is a validation error (400) */
  get isValidationError(): boolean {
    return this.status === 400;
  }

  /** True if this is an auth error (401) */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True if this is a rate limit error (429) */
  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /** True if this is a server error (5xx) */
  get isServerError(): boolean {
    return this.status >= 500;
  }

  /** True if this error is retryable */
  get isRetryable(): boolean {
    return this.isRateLimited || this.isServerError;
  }
}

/**
 * Error thrown when a network request fails.
 */
export class HarkenNetworkError extends HarkenError {
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "HarkenNetworkError";
    this.cause = cause;
  }

  /** Network errors are always retryable */
  get isRetryable(): boolean {
    return true;
  }
}
