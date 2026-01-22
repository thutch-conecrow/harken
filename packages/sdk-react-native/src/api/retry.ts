import { HarkenApiError, HarkenNetworkError } from "./errors";

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Base delay in ms for exponential backoff (default: 1000) */
  baseDelay: number;
  /** Maximum delay in ms (default: 30000) */
  maxDelay: number;
  /** Jitter factor 0-1 to randomize delays (default: 0.1) */
  jitter: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  jitter: 0.1,
};

/**
 * Calculate delay for a retry attempt with exponential backoff and jitter.
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig,
  retryAfter?: number
): number {
  // If server specified Retry-After, respect it
  if (retryAfter !== undefined && retryAfter > 0) {
    return Math.min(retryAfter * 1000, config.maxDelay);
  }

  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay);

  // Add jitter
  const jitterRange = cappedDelay * config.jitter;
  const jitter = (Math.random() - 0.5) * 2 * jitterRange;

  return Math.max(0, cappedDelay + jitter);
}

/**
 * Check if an error is retryable.
 */
export function isRetryableError(error: unknown): error is HarkenApiError | HarkenNetworkError {
  if (error instanceof HarkenApiError) {
    return error.isRetryable;
  }
  if (error instanceof HarkenNetworkError) {
    return error.isRetryable;
  }
  return false;
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if this is the last attempt or error isn't retryable
      if (attempt >= fullConfig.maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Calculate delay, respecting Retry-After header if present
      const retryAfter = error instanceof HarkenApiError ? error.retryAfter : undefined;

      const delay = calculateRetryDelay(attempt, fullConfig, retryAfter);
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs this
  throw lastError;
}
