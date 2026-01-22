import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateRetryDelay,
  isRetryableError,
  withRetry,
  DEFAULT_RETRY_CONFIG,
  sleep,
} from "./retry";
import { HarkenApiError, HarkenNetworkError } from "./errors";

describe("calculateRetryDelay", () => {
  beforeEach(() => {
    // Mock Math.random for predictable jitter
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calculates exponential backoff correctly", () => {
    const config = { ...DEFAULT_RETRY_CONFIG, jitter: 0 };

    expect(calculateRetryDelay(0, config)).toBe(1000); // 1000 * 2^0 = 1000
    expect(calculateRetryDelay(1, config)).toBe(2000); // 1000 * 2^1 = 2000
    expect(calculateRetryDelay(2, config)).toBe(4000); // 1000 * 2^2 = 4000
    expect(calculateRetryDelay(3, config)).toBe(8000); // 1000 * 2^3 = 8000
  });

  it("caps delay at maxDelay", () => {
    const config = { ...DEFAULT_RETRY_CONFIG, jitter: 0, maxDelay: 5000 };

    expect(calculateRetryDelay(0, config)).toBe(1000);
    expect(calculateRetryDelay(3, config)).toBe(5000); // capped
    expect(calculateRetryDelay(10, config)).toBe(5000); // capped
  });

  it("adds jitter within expected range", () => {
    const config = { ...DEFAULT_RETRY_CONFIG, jitter: 0.1 };

    // With random = 0.5, jitter should be 0 (centered)
    // For attempt 0: base = 1000, jitterRange = 100, jitter = 0
    const delay = calculateRetryDelay(0, config);
    expect(delay).toBe(1000);
  });

  it("respects Retry-After header when provided", () => {
    const config = DEFAULT_RETRY_CONFIG;

    // 5 seconds should be 5000ms
    expect(calculateRetryDelay(0, config, 5)).toBe(5000);
    expect(calculateRetryDelay(2, config, 10)).toBe(10000);
  });

  it("caps Retry-After at maxDelay", () => {
    const config = { ...DEFAULT_RETRY_CONFIG, maxDelay: 5000 };

    // 60 seconds should be capped to 5000ms
    expect(calculateRetryDelay(0, config, 60)).toBe(5000);
  });

  it("ignores zero or negative Retry-After", () => {
    const config = { ...DEFAULT_RETRY_CONFIG, jitter: 0 };

    // Should fall back to exponential backoff
    expect(calculateRetryDelay(0, config, 0)).toBe(1000);
    expect(calculateRetryDelay(0, config, -5)).toBe(1000);
  });
});

describe("isRetryableError", () => {
  it("returns true for HarkenNetworkError", () => {
    const error = new HarkenNetworkError("Network failed");
    expect(isRetryableError(error)).toBe(true);
  });

  it("returns true for HarkenApiError with 429 status", () => {
    const error = new HarkenApiError(429, {
      error: { code: "rate_limited", message: "Too many requests" },
    });
    expect(isRetryableError(error)).toBe(true);
  });

  it("returns true for HarkenApiError with 5xx status", () => {
    const error500 = new HarkenApiError(500, {
      error: { code: "internal_error", message: "Server error" },
    });
    const error503 = new HarkenApiError(503, {
      error: { code: "service_unavailable", message: "Service unavailable" },
    });
    expect(isRetryableError(error500)).toBe(true);
    expect(isRetryableError(error503)).toBe(true);
  });

  it("returns false for HarkenApiError with 4xx status (except 429)", () => {
    const error400 = new HarkenApiError(400, {
      error: { code: "validation_error", message: "Invalid input" },
    });
    const error401 = new HarkenApiError(401, {
      error: { code: "unauthorized", message: "Unauthorized" },
    });
    const error404 = new HarkenApiError(404, {
      error: { code: "not_found", message: "Not found" },
    });
    expect(isRetryableError(error400)).toBe(false);
    expect(isRetryableError(error401)).toBe(false);
    expect(isRetryableError(error404)).toBe(false);
  });

  it("returns false for generic Error", () => {
    expect(isRetryableError(new Error("Generic error"))).toBe(false);
  });

  it("returns false for non-Error values", () => {
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
    expect(isRetryableError("error string")).toBe(false);
    expect(isRetryableError({ code: "error" })).toBe(false);
  });
});

describe("sleep", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves after specified delay", async () => {
    const promise = sleep(1000);
    vi.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe("withRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns result on first successful attempt", async () => {
    const fn = vi.fn().mockResolvedValue("success");

    const result = await withRetry(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on retryable error and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new HarkenNetworkError("Network failed"))
      .mockResolvedValue("success");

    const promise = withRetry(fn, { maxRetries: 3 });

    // First call fails immediately
    await vi.advanceTimersByTimeAsync(0);

    // Wait for retry delay (1000ms for attempt 0)
    await vi.advanceTimersByTimeAsync(1000);

    const result = await promise;
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws after max retries exceeded", async () => {
    const networkError = new HarkenNetworkError("Network failed");
    const fn = vi.fn().mockRejectedValue(networkError);

    // Attach rejection handler immediately to avoid unhandled rejection warning
    let caughtError: unknown;
    const promise = withRetry(fn, { maxRetries: 2, jitter: 0 }).catch((e) => {
      caughtError = e;
    });

    // Initial attempt + retries with delays
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);
    await vi.advanceTimersByTimeAsync(2000);

    await promise;

    expect(caughtError).toBe(networkError);
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it("does not retry non-retryable errors", async () => {
    const validationError = new HarkenApiError(400, {
      error: { code: "validation_error", message: "Invalid input" },
    });
    const fn = vi.fn().mockRejectedValue(validationError);

    await expect(withRetry(fn, { maxRetries: 3 })).rejects.toThrow(validationError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("uses default config when none provided", async () => {
    const fn = vi.fn().mockResolvedValue("success");

    const result = await withRetry(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("merges partial config with defaults", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new HarkenNetworkError("Network failed"))
      .mockResolvedValue("success");

    const promise = withRetry(fn, { baseDelay: 500 });

    await vi.advanceTimersByTimeAsync(0);
    // Should use custom baseDelay of 500ms
    await vi.advanceTimersByTimeAsync(500);

    const result = await promise;
    expect(result).toBe("success");
  });

  it("respects Retry-After from HarkenApiError", async () => {
    const rateLimitError = new HarkenApiError(
      429,
      { error: { code: "rate_limited", message: "Too many requests" } },
      { retryAfter: 5 }
    );
    const fn = vi.fn().mockRejectedValueOnce(rateLimitError).mockResolvedValue("success");

    const promise = withRetry(fn, { maxRetries: 3, jitter: 0 });

    await vi.advanceTimersByTimeAsync(0);
    // Should wait 5000ms (Retry-After: 5 seconds)
    await vi.advanceTimersByTimeAsync(5000);

    const result = await promise;
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
