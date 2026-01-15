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
  useAttachmentUpload,
  useAttachmentStatus,
} from './hooks';
export type {
  SubmitFeedbackParams,
  UseFeedbackResult,
  AttachmentState,
  UseAttachmentUploadResult,
  AttachmentStatus,
} from './hooks';

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
  // Attachment components
  AttachmentPicker,
  UploadStatusOverlay,
  AttachmentPreview,
  AttachmentGrid,
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
  // Attachment component types
  AttachmentPickerProps,
  AttachmentSource,
  UploadStatusOverlayProps,
  AttachmentPreviewProps,
  AttachmentGridProps,
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

// Domain types (upload queue)
export {
  UploadPhase,
  DEFAULT_UPLOAD_RETRY_CONFIG,
} from './domain';
export type {
  QueueItem,
  QueueStatus,
  UploadProgress,
  UploadRetryConfig,
} from './domain';

// Services
export {
  UploadQueueService,
  uploadQueueService,
  UploadQueueStorage,
} from './services';
export type {
  UploadQueueServiceConfig,
  EnqueueParams,
} from './services';
