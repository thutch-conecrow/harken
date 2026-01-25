import { useState, useCallback, useMemo } from "react";
import { Platform } from "react-native";
import type { components } from "../types/index.js";
import { useHarkenContext } from "./useHarkenContext";
import { useAnonymousId } from "./useAnonymousId";
import { HarkenClient } from "../api/client";
import { HarkenApiError, HarkenNetworkError } from "../api/errors";
import type { FeedbackCategory, DeviceMetadata } from "../types";

type FeedbackSubmissionResponse = components["schemas"]["FeedbackSubmissionResponse"];

export interface SubmitFeedbackParams {
  /** Feedback message content */
  message: string;
  /** Feedback category */
  category: FeedbackCategory;
  /** Optional title/subject */
  title?: string;
  /** Additional device metadata (merged with auto-collected metadata) */
  metadata?: Partial<DeviceMetadata>;
  /** Attachment IDs from presigned uploads */
  attachments?: string[];
}

export interface UseFeedbackResult {
  /** Submit feedback to Harken */
  submitFeedback: (params: SubmitFeedbackParams) => Promise<FeedbackSubmissionResponse>;
  /** True while a submission is in progress */
  isSubmitting: boolean;
  /** Last error from submission attempt */
  error: HarkenApiError | HarkenNetworkError | null;
  /** Clear the error state */
  clearError: () => void;
  /** True if anonymous ID is still loading */
  isInitializing: boolean;
}

/**
 * Hook for submitting feedback through the Harken API.
 *
 * Automatically includes the anonymous ID and device metadata.
 *
 * @example
 * ```tsx
 * function FeedbackScreen() {
 *   const { submitFeedback, isSubmitting, error } = useFeedback();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       await submitFeedback({
 *         message: 'Great app!',
 *         category: 'idea',
 *       });
 *       // Success!
 *     } catch (e) {
 *       // Error is also available in `error` state
 *     }
 *   };
 * }
 * ```
 */
export function useFeedback(): UseFeedbackResult {
  const { config } = useHarkenContext();
  const { anonymousId, isLoading: isInitializing } = useAnonymousId();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<HarkenApiError | HarkenNetworkError | null>(null);

  // Create client instance (memoized)
  const client = useMemo(() => {
    return new HarkenClient({
      publishableKey: config.publishableKey,
      userToken: config.userToken,
      baseUrl: config.apiBaseUrl,
    });
  }, [config.publishableKey, config.userToken, config.apiBaseUrl]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const submitFeedback = useCallback(
    async (params: SubmitFeedbackParams): Promise<FeedbackSubmissionResponse> => {
      if (!anonymousId) {
        throw new Error("Anonymous ID not yet initialized. Wait for isInitializing to be false.");
      }

      setIsSubmitting(true);
      setError(null);

      try {
        // Collect device metadata
        // Only set platform if it's a known value (ios, android)
        // Other platforms (web, windows, macos) should be passed via metadata
        const detectedPlatform =
          Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : undefined;

        const deviceMetadata: DeviceMetadata = {
          ...(detectedPlatform && { platform: detectedPlatform }),
          ...params.metadata,
        };

        const response = await client.submitFeedback({
          message: params.message,
          category: params.category,
          title: params.title,
          anon_id: anonymousId,
          metadata: deviceMetadata,
          attachments: params.attachments,
        });

        return response;
      } catch (e) {
        const harkenError =
          e instanceof HarkenApiError || e instanceof HarkenNetworkError
            ? e
            : new HarkenNetworkError(
                e instanceof Error ? e.message : "Unknown error",
                e instanceof Error ? e : undefined
              );
        setError(harkenError);

        // Call the onError callback if configured
        config.onError?.(harkenError);

        // Call the onRateLimited callback for 429 responses
        if (harkenError instanceof HarkenApiError && harkenError.isRateLimited) {
          config.onRateLimited?.(harkenError.retryAfter ?? 60);
        }

        throw harkenError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [anonymousId, client, config]
  );

  return {
    submitFeedback,
    isSubmitting,
    error,
    clearError,
    isInitializing,
  };
}
