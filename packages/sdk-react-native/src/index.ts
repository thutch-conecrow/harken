/**
 * Harken React Native SDK
 *
 * A mobile-first feedback SDK for React Native and Expo applications.
 *
 * This is the main entry point which contains core functionality without
 * native module dependencies at import time. For attachment features
 * (which require expo-file-system, expo-image-picker, etc.), import from
 * '@harken/sdk-react-native/attachments'.
 *
 * @example
 * ```tsx
 * // Core SDK
 * import {
 *   HarkenProvider,
 *   useFeedback,
 *   ThemedText,
 *   ThemedButton,
 * } from '@harken/sdk-react-native';
 *
 * // Attachment features (separate import to avoid eager native module loading)
 * import {
 *   useAttachmentUpload,
 *   AttachmentGrid,
 * } from '@harken/sdk-react-native/attachments';
 * ```
 *
 * @packageDocumentation
 */

// Provider and context
export { HarkenProvider } from './context';
export type { HarkenContextValue } from './context';

// Hooks (core - no native module dependencies)
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

// Components (core - no native module dependencies)
export {
  ThemedText,
  ThemedTextInput,
  ThemedButton,
  CategorySelector,
  FeedbackForm,
  FeedbackSheet,
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
  FeedbackSheetProps,
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

// Domain types (upload queue types without the service)
export { UploadPhase, DEFAULT_UPLOAD_RETRY_CONFIG } from './domain';
export type {
  QueueItem,
  QueueStatus,
  UploadProgress,
  UploadRetryConfig,
} from './domain';
