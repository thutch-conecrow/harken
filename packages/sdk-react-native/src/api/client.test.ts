import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HarkenClient, createHarkenClient } from "./client";
import { HarkenApiError, HarkenNetworkError } from "./errors";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock retry module to avoid timing complexities in client tests
vi.mock("./retry", async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const original = await vi.importActual<typeof import("./retry")>("./retry");
  return {
    ...original,
    withRetry: vi.fn((fn: () => Promise<unknown>) => fn()), // Execute immediately without retries
  };
});

describe("HarkenClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("creates client with required config", () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });
      expect(client).toBeInstanceOf(HarkenClient);
    });

    it("uses default base URL when not provided", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "feedback_123" }),
      });

      await client.submitFeedback({
        message: "Test",
        category: "bug",
        anon_id: "anon_123",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.harken.app/v1/feedback",
        expect.any(Object)
      );
    });

    it("uses custom base URL when provided", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
        baseUrl: "https://custom.api.com",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "feedback_123" }),
      });

      await client.submitFeedback({
        message: "Test",
        category: "bug",
        anon_id: "anon_123",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://custom.api.com/v1/feedback",
        expect.any(Object)
      );
    });
  });

  describe("request headers", () => {
    it("includes Content-Type and X-Publishable-Key headers", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "feedback_123" }),
      });

      await client.submitFeedback({
        message: "Test",
        category: "bug",
        anon_id: "anon_123",
      });

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.headers).toMatchObject({
        "Content-Type": "application/json",
        "X-Publishable-Key": "pk_test_123",
      });
    });

    it("includes X-User-Token header when userToken is set", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
        userToken: "user_token_abc",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "feedback_123" }),
      });

      await client.submitFeedback({
        message: "Test",
        category: "bug",
        anon_id: "anon_123",
      });

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.headers).toMatchObject({
        "X-User-Token": "user_token_abc",
      });
    });

    it("does not include X-User-Token when not set", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "feedback_123" }),
      });

      await client.submitFeedback({
        message: "Test",
        category: "bug",
        anon_id: "anon_123",
      });

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect((options.headers as Record<string, string>)["X-User-Token"]).toBeUndefined();
    });
  });

  describe("submitFeedback", () => {
    it("sends correct payload", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "feedback_123" }),
      });

      await client.submitFeedback({
        message: "This is feedback",
        category: "idea",
        anon_id: "anon_456",
        metadata: { app_version: "1.0.0", platform: "ios" },
        attachments: ["att_1", "att_2"],
      });

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(options.body as string)).toEqual({
        message: "This is feedback",
        category: "idea",
        anon_id: "anon_456",
        metadata: { app_version: "1.0.0", platform: "ios" },
        attachments: ["att_1", "att_2"],
      });
    });

    it("returns response on success", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "feedback_123",
            created_at: "2024-01-01T00:00:00Z",
          }),
      });

      const result = await client.submitFeedback({
        message: "Test",
        category: "bug",
        anon_id: "anon_123",
      });

      expect(result).toEqual({
        id: "feedback_123",
        created_at: "2024-01-01T00:00:00Z",
      });
    });
  });

  describe("createAttachmentUpload", () => {
    it("sends correct payload and returns presigned URL", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            attachment_id: "att_123",
            upload_url: "https://storage.example.com/upload",
            expires_at: "2024-01-01T01:00:00Z",
          }),
      });

      const result = await client.createAttachmentUpload({
        filename: "screenshot.png",
        content_type: "image/png",
        size: 12345,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/feedback/attachments/presign"),
        expect.any(Object)
      );
      expect(result).toEqual({
        attachment_id: "att_123",
        upload_url: "https://storage.example.com/upload",
        expires_at: "2024-01-01T01:00:00Z",
      });
    });
  });

  describe("confirmAttachment", () => {
    it("confirms attachment upload", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "att_123",
            status: "confirmed",
          }),
      });

      const result = await client.confirmAttachment("att_123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/feedback/attachments/att_123/confirm"),
        expect.objectContaining({ method: "POST" })
      );
      expect(result).toEqual({
        id: "att_123",
        status: "confirmed",
      });
    });

    it("includes bytes_uploaded in confirm request when provided", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "att_123", status: "confirmed" }),
      });

      await client.confirmAttachment("att_123", { bytes_uploaded: 12345 });

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(JSON.parse(options.body as string)).toEqual({
        bytes_uploaded: 12345,
      });
    });
  });

  describe("reportAttachmentFailure", () => {
    it("reports attachment failure with error message", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "att_123", status: "failed" }),
      });

      const result = await client.reportAttachmentFailure("att_123", "Upload timed out");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/feedback/attachments/att_123/fail"),
        expect.objectContaining({ method: "POST" })
      );
      expect(result.status).toBe("failed");
    });
  });

  describe("getAttachmentStatus", () => {
    it("retrieves attachment status", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "att_123",
            status: "confirmed",
            download_url: "https://storage.example.com/download",
          }),
      });

      const result = await client.getAttachmentStatus("att_123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/feedback/attachments/att_123"),
        expect.any(Object)
      );
      expect(result).toEqual({
        id: "att_123",
        status: "confirmed",
        download_url: "https://storage.example.com/download",
      });
    });
  });

  describe("error handling", () => {
    it("throws HarkenApiError for non-OK responses", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Map(),
        json: () =>
          Promise.resolve({
            error: {
              code: "validation_error",
              message: "Message is required",
              details: [{ field: "message", message: "Required" }],
            },
          }),
      });

      await expect(
        client.submitFeedback({
          message: "",
          category: "bug",
          anon_id: "anon_123",
        })
      ).rejects.toThrow(HarkenApiError);
    });

    it("includes error code and details from API response", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Map(),
        json: () =>
          Promise.resolve({
            error: {
              code: "validation_error",
              message: "Invalid category",
              details: [{ field: "category", message: "Must be one of: bug, idea, ux, other" }],
            },
          }),
      });

      try {
        await client.submitFeedback({
          message: "Test",
          category: "invalid" as "bug",
          anon_id: "anon_123",
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(HarkenApiError);
        const apiError = error as HarkenApiError;
        expect(apiError.code).toBe("validation_error");
        expect(apiError.status).toBe(400);
        expect(apiError.details).toHaveLength(1);
      }
    });

    it("parses Retry-After header for 429 responses", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      const headers = new Headers();
      headers.set("Retry-After", "30");

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        headers,
        json: () =>
          Promise.resolve({
            error: {
              code: "rate_limited",
              message: "Too many requests",
            },
          }),
      });

      try {
        await client.submitFeedback({
          message: "Test",
          category: "bug",
          anon_id: "anon_123",
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(HarkenApiError);
        const apiError = error as HarkenApiError;
        expect(apiError.status).toBe(429);
        expect(apiError.retryAfter).toBe(30);
      }
    });

    it("handles non-JSON error responses gracefully", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        headers: new Map(),
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      try {
        await client.submitFeedback({
          message: "Test",
          category: "bug",
          anon_id: "anon_123",
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(HarkenApiError);
        const apiError = error as HarkenApiError;
        expect(apiError.status).toBe(502);
        expect(apiError.code).toBe("http_502");
      }
    });

    it("throws HarkenNetworkError for fetch TypeError", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
      });

      mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(
        client.submitFeedback({
          message: "Test",
          category: "bug",
          anon_id: "anon_123",
        })
      ).rejects.toThrow(HarkenNetworkError);
    });

    it("throws HarkenNetworkError for timeout (AbortError)", async () => {
      const client = new HarkenClient({
        publishableKey: "pk_test_123",
        timeout: 100,
      });

      vi.useFakeTimers();

      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      mockFetch.mockRejectedValueOnce(abortError);

      const promise = client.submitFeedback({
        message: "Test",
        category: "bug",
        anon_id: "anon_123",
      });

      await expect(promise).rejects.toThrow(HarkenNetworkError);
      await expect(promise).rejects.toThrow("Request timed out");
    });
  });
});

describe("createHarkenClient", () => {
  it("creates a HarkenClient instance", () => {
    const client = createHarkenClient({
      publishableKey: "pk_test_123",
    });
    expect(client).toBeInstanceOf(HarkenClient);
  });
});
