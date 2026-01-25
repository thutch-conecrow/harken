/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFeedback } from "./useFeedback";
import { HarkenApiError, HarkenNetworkError } from "../api/errors";
import type { FeedbackCategory } from "../types";

// Mock dependencies
vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

const mockSubmitFeedback = vi.fn();

vi.mock("../api/client", () => ({
  HarkenClient: class MockHarkenClient {
    submitFeedback = mockSubmitFeedback;
  },
}));

const mockOnError = vi.fn();
const mockOnRateLimited = vi.fn();

vi.mock("./useHarkenContext", () => ({
  useHarkenContext: vi.fn(() => ({
    config: {
      publishableKey: "pk_test_123",
      userToken: undefined,
      apiBaseUrl: "https://api.harken.app",
      onError: mockOnError,
      onRateLimited: mockOnRateLimited,
    },
  })),
}));

import { useAnonymousId } from "./useAnonymousId";

vi.mock("./useAnonymousId", () => ({
  useAnonymousId: vi.fn(() => ({
    anonymousId: "test-anon-id-123",
    isLoading: false,
  })),
}));

describe("useFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnError.mockClear();
    mockOnRateLimited.mockClear();
  });

  describe("payload construction", () => {
    it("sends correct payload to client", async () => {
      mockSubmitFeedback.mockResolvedValue({ id: "feedback_123" });

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.submitFeedback({
          message: "Great app!",
          category: "idea" as FeedbackCategory,
        });
      });

      expect(mockSubmitFeedback).toHaveBeenCalledWith({
        message: "Great app!",
        category: "idea",
        title: undefined,
        anon_id: "test-anon-id-123",
        metadata: { platform: "ios" },
        attachments: undefined,
      });
    });

    it("includes title when provided", async () => {
      mockSubmitFeedback.mockResolvedValue({ id: "feedback_123" });

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.submitFeedback({
          message: "Bug description",
          category: "bug" as FeedbackCategory,
          title: "Login issue",
        });
      });

      expect(mockSubmitFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Login issue",
        })
      );
    });

    it("includes attachments when provided", async () => {
      mockSubmitFeedback.mockResolvedValue({ id: "feedback_123" });

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.submitFeedback({
          message: "See attached screenshot",
          category: "bug" as FeedbackCategory,
          attachments: ["att_123", "att_456"],
        });
      });

      expect(mockSubmitFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: ["att_123", "att_456"],
        })
      );
    });

    it("merges custom metadata with platform", async () => {
      mockSubmitFeedback.mockResolvedValue({ id: "feedback_123" });

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.submitFeedback({
          message: "Test",
          category: "other" as FeedbackCategory,
          metadata: { app_version: "1.2.3", screen: "settings" },
        });
      });

      expect(mockSubmitFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            platform: "ios",
            app_version: "1.2.3",
            screen: "settings",
          },
        })
      );
    });
  });

  describe("loading state", () => {
    it("sets isSubmitting true during submission", async () => {
      let resolveSubmit: (value: unknown) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });
      mockSubmitFeedback.mockReturnValue(submitPromise);

      const { result } = renderHook(() => useFeedback());

      expect(result.current.isSubmitting).toBe(false);

      let submitPromiseResult: Promise<unknown>;
      act(() => {
        submitPromiseResult = result.current.submitFeedback({
          message: "Test",
          category: "idea" as FeedbackCategory,
        });
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true);
      });

      await act(async () => {
        resolveSubmit!({ id: "feedback_123" });
        await submitPromiseResult;
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it("sets isSubmitting false after error", async () => {
      mockSubmitFeedback.mockRejectedValue(
        new HarkenApiError(400, { error: { code: "validation_error", message: "Invalid" } })
      );

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("error handling", () => {
    it("sets error state on API failure", async () => {
      const apiError = new HarkenApiError(400, {
        error: { code: "validation_error", message: "Message is required" },
      });
      mockSubmitFeedback.mockRejectedValue(apiError);

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe(apiError);
    });

    it("sets error state on network failure", async () => {
      const networkError = new HarkenNetworkError("Network request failed");
      mockSubmitFeedback.mockRejectedValue(networkError);

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe(networkError);
    });

    it("wraps unknown errors in HarkenNetworkError", async () => {
      mockSubmitFeedback.mockRejectedValue(new Error("Something went wrong"));

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBeInstanceOf(HarkenNetworkError);
      expect(result.current.error?.message).toBe("Something went wrong");
    });

    it("clears error on successful submission", async () => {
      // First, cause an error
      mockSubmitFeedback.mockRejectedValueOnce(
        new HarkenApiError(500, { error: { code: "server_error", message: "Error" } })
      );

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(result.current.error).not.toBeNull();

      // Now succeed
      mockSubmitFeedback.mockResolvedValueOnce({ id: "feedback_123" });

      await act(async () => {
        await result.current.submitFeedback({
          message: "Test",
          category: "idea" as FeedbackCategory,
        });
      });

      expect(result.current.error).toBeNull();
    });

    it("clearError clears the error state", async () => {
      mockSubmitFeedback.mockRejectedValue(
        new HarkenApiError(400, { error: { code: "error", message: "Error" } })
      );

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it("calls onError callback on any error", async () => {
      const apiError = new HarkenApiError(400, {
        error: { code: "validation_error", message: "Invalid" },
      });
      mockSubmitFeedback.mockRejectedValue(apiError);

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(mockOnError).toHaveBeenCalledWith(apiError);
    });

    it("calls onRateLimited callback on 429 response", async () => {
      const rateLimitError = new HarkenApiError(
        429,
        { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" } },
        { retryAfter: 45 }
      );
      mockSubmitFeedback.mockRejectedValue(rateLimitError);

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(mockOnRateLimited).toHaveBeenCalledWith(45);
    });

    it("uses default retryAfter of 60 if not provided in 429 response", async () => {
      const rateLimitError = new HarkenApiError(429, {
        error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" },
      });
      mockSubmitFeedback.mockRejectedValue(rateLimitError);

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(mockOnRateLimited).toHaveBeenCalledWith(60);
    });

    it("does not call onRateLimited for non-429 errors", async () => {
      const apiError = new HarkenApiError(500, {
        error: { code: "server_error", message: "Internal error" },
      });
      mockSubmitFeedback.mockRejectedValue(apiError);

      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        } catch {
          // Expected
        }
      });

      expect(mockOnRateLimited).not.toHaveBeenCalled();
    });
  });

  describe("successful submission", () => {
    it("returns response from client", async () => {
      const expectedResponse = { id: "feedback_123", status: "received" };
      mockSubmitFeedback.mockResolvedValue(expectedResponse);

      const { result } = renderHook(() => useFeedback());

      let response: unknown;
      await act(async () => {
        response = await result.current.submitFeedback({
          message: "Great app!",
          category: "praise" as FeedbackCategory,
        });
      });

      expect(response).toEqual(expectedResponse);
    });
  });

  describe("anonymousId requirement", () => {
    it("throws when anonymousId is not available", async () => {
      // Override mock to return null anonymousId
      vi.mocked(useAnonymousId).mockReturnValue({
        anonymousId: null,
        isLoading: false,
      });

      const { result } = renderHook(() => useFeedback());

      await expect(
        act(async () => {
          await result.current.submitFeedback({
            message: "Test",
            category: "idea" as FeedbackCategory,
          });
        })
      ).rejects.toThrow("Anonymous ID not yet initialized");

      // Restore default mock
      vi.mocked(useAnonymousId).mockReturnValue({
        anonymousId: "test-anon-id-123",
        isLoading: false,
      });
    });

    it("exposes isInitializing from useAnonymousId", () => {
      vi.mocked(useAnonymousId).mockReturnValue({
        anonymousId: null,
        isLoading: true,
      });

      const { result } = renderHook(() => useFeedback());

      expect(result.current.isInitializing).toBe(true);

      // Restore default mock
      vi.mocked(useAnonymousId).mockReturnValue({
        anonymousId: "test-anon-id-123",
        isLoading: false,
      });
    });
  });
});
