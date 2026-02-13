import type { PartialHarkenTheme, ThemeMode } from "../theme";
import type { SecureStorage } from "../storage";
import type { HarkenApiError, HarkenNetworkError } from "../api/errors";

/**
 * Configuration options for the Harken SDK.
 */
export interface HarkenConfig {
  /**
   * Publishable API key for your Harken app.
   * Safe to include in client-side code.
   */
  publishableKey: string;

  /**
   * Optional user token for verified pseudonymous identity.
   * Should be obtained from your backend which signs it with your secret key.
   */
  userToken?: string;

  /**
   * Base URL for the Harken API.
   * Defaults to production API if not specified.
   * @default 'https://api.harken.app'
   */
  apiBaseUrl?: string;

  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean;

  /**
   * Optional callback invoked when an API error occurs.
   * Useful for handling specific errors like payment required (402) for limit exceeded.
   *
   * @example
   * ```tsx
   * onError: (error) => {
   *   if (error.isPaymentRequired && error.isFeedbackLimitExceeded) {
   *     // Show upgrade prompt to user
   *   }
   * }
   * ```
   */
  onError?: (error: HarkenApiError | HarkenNetworkError) => void;

  /**
   * Optional callback invoked when a request fails due to rate limiting (429).
   * The retryAfter parameter indicates how many seconds until the rate limit resets.
   *
   * Note: The SDK automatically retries rate-limited requests with exponential backoff.
   * This callback only fires when all retries are exhausted and the request ultimately
   * fails due to rate limiting - not on every transient 429 response. This makes it
   * useful for alerting developers when rate limiting actually impacts their users.
   *
   * @example
   * ```tsx
   * onRateLimited: (retryAfter) => {
   *   console.warn(`Rate limited. Retry after ${retryAfter}s`);
   * }
   * ```
   */
  onRateLimited?: (retryAfter: number) => void;
}

/**
 * Props for the HarkenProvider component.
 */
export interface HarkenProviderProps {
  /**
   * Harken SDK configuration.
   */
  config: HarkenConfig;

  /**
   * Theme mode: 'light', 'dark', or 'system'.
   * When 'system', the SDK will follow the device's color scheme.
   * @default 'system'
   */
  themeMode?: ThemeMode;

  /**
   * Custom light theme overrides.
   * Merged with the default light theme.
   */
  lightTheme?: PartialHarkenTheme;

  /**
   * Custom dark theme overrides.
   * Merged with the default dark theme.
   */
  darkTheme?: PartialHarkenTheme;

  /**
   * Custom secure storage implementation.
   *
   * By default, uses expo-secure-store if available, falling back to
   * in-memory storage (with a console warning) if not installed.
   *
   * Only provide this if you need a custom storage implementation.
   *
   * @example
   * ```tsx
   * // Custom storage implementation
   * import { createSecureStoreAdapter } from '@harkenapp/sdk-react-native';
   * import * as SecureStore from 'expo-secure-store';
   *
   * const storage = createSecureStoreAdapter(SecureStore);
   * <HarkenProvider storage={storage} ... />
   * ```
   */
  storage?: SecureStorage;

  /**
   * React children to render within the provider.
   */
  children: React.ReactNode;
}

/**
 * Feedback category types supported by the API.
 */
export type FeedbackCategory = "bug" | "idea" | "ux" | "other";

/**
 * Platform type for device metadata.
 */
export type Platform = "ios" | "android" | "web";

/**
 * Device metadata collected with feedback submissions.
 */
export interface DeviceMetadata {
  /** App version string */
  appVersion?: string;
  /** Platform (ios, android, or web) */
  platform?: Platform;
  /** Device model/name */
  device?: string;
  /** OS version */
  osVersion?: string;
  /** Additional custom metadata */
  [key: string]: string | undefined;
}
