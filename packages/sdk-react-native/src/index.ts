/**
 * Harken React Native SDK
 *
 * A mobile-first feedback SDK for React Native and Expo applications.
 *
 * @packageDocumentation
 */

// Provider and context
export { HarkenProvider } from './context';
export type { HarkenContextValue } from './context';

// Hooks
export {
  useHarkenTheme,
  useHarkenContext,
  useAnonymousId,
  useFeedback,
} from './hooks';
export type { SubmitFeedbackParams, UseFeedbackResult } from './hooks';

// Theme system
export type {
  HarkenColors,
  HarkenTypography,
  HarkenSpacing,
  HarkenRadii,
  HarkenTheme,
  PartialHarkenTheme,
  TextWeight,
  ThemeMode,
} from './theme';

export {
  lightColors,
  darkColors,
  defaultTypography,
  defaultSpacing,
  defaultRadii,
  lightTheme,
  darkTheme,
  createTheme,
} from './theme';

// Storage and identity
export type { SecureStorage } from './storage';
export {
  createSecureStoreAdapter,
  createMemoryStorage,
  IdentityStore,
} from './storage';

// Utilities
export { generateUUID } from './utils';

// Components
export {
  ThemedText,
  ThemedTextInput,
  ThemedButton,
  CategorySelector,
  FeedbackForm,
  DEFAULT_CATEGORIES,
} from './components';

export type {
  ThemedTextProps,
  TextVariant,
  ThemedTextInputProps,
  ThemedButtonProps,
  ButtonVariant,
  CategorySelectorProps,
  CategoryOption,
  FeedbackFormProps,
  FeedbackFormData,
} from './components';

// API client
export {
  HarkenClient,
  createHarkenClient,
  HarkenError,
  HarkenApiError,
  HarkenNetworkError,
  withRetry,
  DEFAULT_RETRY_CONFIG,
} from './api';
export type { HarkenClientConfig, RetryConfig } from './api';

// Configuration types
export type {
  HarkenConfig,
  HarkenProviderProps,
  FeedbackCategory,
  Platform,
  DeviceMetadata,
} from './types';
