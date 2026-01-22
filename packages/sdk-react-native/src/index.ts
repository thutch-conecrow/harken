/**
 * Harken React Native SDK
 *
 * A mobile-first feedback SDK for React Native and Expo applications.
 *
 * @example
 * ```tsx
 * import { HarkenProvider, FeedbackSheet } from '@harkenapp/sdk-react-native';
 *
 * function App() {
 *   return (
 *     <HarkenProvider config={{ publishableKey: 'pk_live_xxxx' }}>
 *       <FeedbackSheet onSuccess={() => console.log('Submitted!')} />
 *     </HarkenProvider>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

// Provider and context
export { HarkenProvider } from "./context";
export type { HarkenContextValue } from "./context";

// Hooks (core)
export { useHarkenTheme, useHarkenContext, useAnonymousId, useFeedback } from "./hooks";
export type { SubmitFeedbackParams, UseFeedbackResult } from "./hooks";

// Hooks (attachments)
export { useAttachmentUpload } from "./hooks/useAttachmentUpload";
export type { AttachmentState, UseAttachmentUploadResult } from "./hooks/useAttachmentUpload";

export { useAttachmentPicker } from "./hooks/useAttachmentPicker";
export type {
  AttachmentSourceConfig,
  UseAttachmentPickerResult,
} from "./hooks/useAttachmentPicker";

export { useAttachmentStatus } from "./hooks/useAttachmentStatus";
export type { AttachmentStatus } from "./hooks/useAttachmentStatus";

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
} from "./theme";

export {
  lightColors,
  darkColors,
  defaultTypography,
  defaultSpacing,
  defaultRadii,
  lightTheme,
  darkTheme,
  createTheme,
} from "./theme";

// Storage and identity
export type { SecureStorage } from "./storage";
export { createSecureStoreAdapter, createMemoryStorage, IdentityStore } from "./storage";

// Utilities
export { generateUUID } from "./utils";

// Components (core)
export {
  ThemedText,
  ThemedTextInput,
  ThemedButton,
  CategorySelector,
  FeedbackForm,
  DEFAULT_CATEGORIES,
} from "./components";

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
} from "./components";

// Components (attachments)
export {
  AttachmentPicker,
  UploadStatusOverlay,
  AttachmentPreview,
  AttachmentGrid,
} from "./components";

export type {
  AttachmentPickerProps,
  AttachmentSource,
  PickerOptionConfig,
  UploadStatusOverlayProps,
  UploadStatusLabels,
  AttachmentPreviewProps,
  AttachmentGridProps,
} from "./components";

// FeedbackSheet (with full attachment support)
export { FeedbackSheet } from "./attachments/FeedbackSheet";
export type { FeedbackSheetProps } from "./attachments/FeedbackSheet";

// API client
export {
  HarkenClient,
  createHarkenClient,
  HarkenError,
  HarkenApiError,
  HarkenNetworkError,
  withRetry,
  DEFAULT_RETRY_CONFIG,
} from "./api";
export type { HarkenClientConfig, RetryConfig } from "./api";

// Configuration types
export type {
  HarkenConfig,
  HarkenProviderProps,
  FeedbackCategory,
  Platform,
  DeviceMetadata,
} from "./types";

// Domain types
export { UploadPhase, DEFAULT_UPLOAD_RETRY_CONFIG } from "./domain";
export type { QueueItem, QueueStatus, UploadProgress, UploadRetryConfig } from "./domain";

// Services (for advanced usage)
export { UploadQueueService, uploadQueueService, UploadQueueStorage } from "./services";
export type { UploadQueueServiceConfig, EnqueueParams } from "./services";
