import { describe, it, expect } from "vitest";
import { HarkenError, HarkenApiError, HarkenNetworkError } from "./errors";

describe("HarkenError", () => {
  it("creates error with message", () => {
    const error = new HarkenError("Something went wrong");
    expect(error.message).toBe("Something went wrong");
  });
});

describe("HarkenApiError", () => {
  it("creates error with status, code, and message", () => {
    const error = new HarkenApiError(400, {
      error: {
        code: "validation_error",
        message: "Invalid input",
      },
    });

    expect(error.status).toBe(400);
    expect(error.code).toBe("validation_error");
    expect(error.message).toBe("Invalid input");
  });

  it("includes error details when provided", () => {
    const error = new HarkenApiError(400, {
      error: {
        code: "validation_error",
        message: "Invalid input",
        details: [
          { field: "message", message: "Required field" },
          { field: "category", message: "Invalid value" },
        ],
      },
    });

    expect(error.details).toHaveLength(2);
    expect(error.details?.[0]).toEqual({
      field: "message",
      message: "Required field",
    });
  });

  it("stores retryAfter when provided", () => {
    const error = new HarkenApiError(
      429,
      { error: { code: "rate_limited", message: "Too many requests" } },
      { retryAfter: 60 }
    );

    expect(error.retryAfter).toBe(60);
  });

  describe("isValidationError", () => {
    it("returns true for 400 status", () => {
      const error = new HarkenApiError(400, {
        error: { code: "validation_error", message: "Invalid" },
      });
      expect(error.isValidationError).toBe(true);
    });

    it("returns false for other statuses", () => {
      const error = new HarkenApiError(401, {
        error: { code: "unauthorized", message: "Unauthorized" },
      });
      expect(error.isValidationError).toBe(false);
    });
  });

  describe("isUnauthorized", () => {
    it("returns true for 401 status", () => {
      const error = new HarkenApiError(401, {
        error: { code: "unauthorized", message: "Unauthorized" },
      });
      expect(error.isUnauthorized).toBe(true);
    });

    it("returns false for other statuses", () => {
      const error = new HarkenApiError(403, {
        error: { code: "forbidden", message: "Forbidden" },
      });
      expect(error.isUnauthorized).toBe(false);
    });
  });

  describe("isPaymentRequired", () => {
    it("returns true for 402 status", () => {
      const error = new HarkenApiError(402, {
        error: { code: "FEEDBACK_LIMIT_EXCEEDED", message: "Feedback limit exceeded" },
      });
      expect(error.isPaymentRequired).toBe(true);
    });

    it("returns false for other statuses", () => {
      const error = new HarkenApiError(403, {
        error: { code: "forbidden", message: "Forbidden" },
      });
      expect(error.isPaymentRequired).toBe(false);
    });
  });

  describe("isFeedbackLimitExceeded", () => {
    it("returns true for FEEDBACK_LIMIT_EXCEEDED code", () => {
      const error = new HarkenApiError(402, {
        error: {
          code: "FEEDBACK_LIMIT_EXCEEDED",
          message: "Free tier is limited to 100 feedback items",
        },
      });
      expect(error.isFeedbackLimitExceeded).toBe(true);
    });

    it("returns false for other codes", () => {
      const error = new HarkenApiError(402, {
        error: { code: "payment_required", message: "Payment required" },
      });
      expect(error.isFeedbackLimitExceeded).toBe(false);
    });

    it("returns false for other limit exceeded codes", () => {
      const error = new HarkenApiError(403, {
        error: { code: "APP_LIMIT_EXCEEDED", message: "App limit exceeded" },
      });
      expect(error.isFeedbackLimitExceeded).toBe(false);
    });
  });

  describe("isRateLimited", () => {
    it("returns true for 429 status", () => {
      const error = new HarkenApiError(429, {
        error: { code: "rate_limited", message: "Too many requests" },
      });
      expect(error.isRateLimited).toBe(true);
    });

    it("returns false for other statuses", () => {
      const error = new HarkenApiError(400, {
        error: { code: "validation_error", message: "Invalid" },
      });
      expect(error.isRateLimited).toBe(false);
    });
  });

  describe("isServerError", () => {
    it("returns true for 5xx statuses", () => {
      expect(
        new HarkenApiError(500, {
          error: { code: "internal_error", message: "Server error" },
        }).isServerError
      ).toBe(true);

      expect(
        new HarkenApiError(502, {
          error: { code: "bad_gateway", message: "Bad gateway" },
        }).isServerError
      ).toBe(true);

      expect(
        new HarkenApiError(503, {
          error: { code: "service_unavailable", message: "Service unavailable" },
        }).isServerError
      ).toBe(true);
    });

    it("returns false for 4xx statuses", () => {
      expect(
        new HarkenApiError(400, {
          error: { code: "validation_error", message: "Invalid" },
        }).isServerError
      ).toBe(false);

      expect(
        new HarkenApiError(429, {
          error: { code: "rate_limited", message: "Rate limited" },
        }).isServerError
      ).toBe(false);
    });
  });

  describe("isRetryable", () => {
    it("returns true for 429 (rate limited)", () => {
      const error = new HarkenApiError(429, {
        error: { code: "rate_limited", message: "Too many requests" },
      });
      expect(error.isRetryable).toBe(true);
    });

    it("returns true for 5xx (server errors)", () => {
      const error500 = new HarkenApiError(500, {
        error: { code: "internal_error", message: "Server error" },
      });
      const error503 = new HarkenApiError(503, {
        error: { code: "service_unavailable", message: "Unavailable" },
      });

      expect(error500.isRetryable).toBe(true);
      expect(error503.isRetryable).toBe(true);
    });

    it("returns false for 4xx (client errors except 429)", () => {
      const error400 = new HarkenApiError(400, {
        error: { code: "validation_error", message: "Invalid" },
      });
      const error401 = new HarkenApiError(401, {
        error: { code: "unauthorized", message: "Unauthorized" },
      });
      const error404 = new HarkenApiError(404, {
        error: { code: "not_found", message: "Not found" },
      });

      expect(error400.isRetryable).toBe(false);
      expect(error401.isRetryable).toBe(false);
      expect(error404.isRetryable).toBe(false);
    });
  });
});

describe("HarkenNetworkError", () => {
  it("creates error with message", () => {
    const error = new HarkenNetworkError("Network request failed");
    expect(error.message).toBe("Network request failed");
  });

  it("stores cause when provided", () => {
    const cause = new TypeError("Failed to fetch");
    const error = new HarkenNetworkError("Network request failed", cause);

    expect(error.cause).toBe(cause);
  });

  it("isRetryable always returns true", () => {
    const error = new HarkenNetworkError("Network failed");
    expect(error.isRetryable).toBe(true);
  });
});
