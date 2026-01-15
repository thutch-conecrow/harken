import type { components } from '@harken/contracts';
import { HarkenApiError, HarkenNetworkError } from './errors';
import { withRetry } from './retry';
import type { RetryConfig } from './retry';

// Re-export types from contracts for convenience
type FeedbackSubmission = components['schemas']['FeedbackSubmission'];
type FeedbackSubmissionResponse = components['schemas']['FeedbackSubmissionResponse'];
type ErrorResponse = components['schemas']['ErrorResponse'];

const DEFAULT_API_BASE_URL = 'https://api.harken.app';

export interface HarkenClientConfig {
  /** Publishable API key */
  publishableKey: string;
  /** Optional user token for verified identity */
  userToken?: string;
  /** Base URL for API (defaults to production) */
  baseUrl?: string;
  /** Retry configuration */
  retry?: Partial<RetryConfig>;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
}

/**
 * Low-level API client for Harken.
 */
export class HarkenClient {
  private readonly config: Required<
    Pick<HarkenClientConfig, 'publishableKey' | 'baseUrl' | 'timeout'>
  > &
    Pick<HarkenClientConfig, 'userToken' | 'retry'>;

  constructor(config: HarkenClientConfig) {
    this.config = {
      publishableKey: config.publishableKey,
      userToken: config.userToken,
      baseUrl: config.baseUrl ?? DEFAULT_API_BASE_URL,
      retry: config.retry,
      timeout: config.timeout ?? 30000,
    };
  }

  /**
   * Submit feedback to the API.
   */
  async submitFeedback(
    submission: FeedbackSubmission
  ): Promise<FeedbackSubmissionResponse> {
    return withRetry(
      () => this.request<FeedbackSubmissionResponse>('/v1/feedback', {
        method: 'POST',
        body: JSON.stringify(submission),
      }),
      this.config.retry
    );
  }

  /**
   * Make an authenticated request to the API.
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Publishable-Key': this.config.publishableKey,
      ...(options.headers as Record<string, string>),
    };

    if (this.config.userToken) {
      headers['X-User-Token'] = this.config.userToken;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await this.parseErrorResponse(response);
        // Only parse Retry-After for 429 responses
        const retryAfter = response.status === 429
          ? this.parseRetryAfter(response)
          : undefined;
        throw new HarkenApiError(response.status, errorBody, { retryAfter });
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw HarkenApiError as-is
      if (error instanceof HarkenApiError) {
        throw error;
      }

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HarkenNetworkError('Request timed out', error);
      }

      // Handle other fetch errors (network issues)
      if (error instanceof TypeError) {
        throw new HarkenNetworkError('Network request failed', error);
      }

      // Unknown error
      throw new HarkenNetworkError(
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Parse error response body, with fallback for non-JSON responses.
   */
  private async parseErrorResponse(response: Response): Promise<ErrorResponse> {
    try {
      return (await response.json()) as ErrorResponse;
    } catch {
      // Fallback for non-JSON error responses
      return {
        error: {
          code: `http_${response.status}`,
          message: response.statusText || 'Request failed',
        },
      };
    }
  }

  /**
   * Parse Retry-After header value in seconds.
   * Supports both delta-seconds and HTTP-date formats.
   */
  private parseRetryAfter(response: Response): number | undefined {
    const retryAfter = response.headers.get('Retry-After');
    if (!retryAfter) {
      return undefined;
    }

    // Try parsing as integer (delta-seconds)
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds) && seconds >= 0) {
      return seconds;
    }

    // Try parsing as HTTP-date
    const date = Date.parse(retryAfter);
    if (!isNaN(date)) {
      const delayMs = date - Date.now();
      return delayMs > 0 ? Math.ceil(delayMs / 1000) : 0;
    }

    return undefined;
  }
}

/**
 * Create a configured Harken client.
 */
export function createHarkenClient(config: HarkenClientConfig): HarkenClient {
  return new HarkenClient(config);
}
