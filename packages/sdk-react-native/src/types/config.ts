import type { PartialHarkenTheme, ThemeMode } from '../theme';

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
   * React children to render within the provider.
   */
  children: React.ReactNode;
}

/**
 * Feedback category types supported by the API.
 */
export type FeedbackCategory = 'bug' | 'idea' | 'ux' | 'other';

/**
 * Platform type for device metadata.
 */
export type Platform = 'ios' | 'android';

/**
 * Device metadata collected with feedback submissions.
 */
export interface DeviceMetadata {
  /** App version string */
  appVersion?: string;
  /** Platform (ios or android) */
  platform?: Platform;
  /** Device model/name */
  device?: string;
  /** OS version */
  osVersion?: string;
  /** Additional custom metadata */
  [key: string]: string | undefined;
}
