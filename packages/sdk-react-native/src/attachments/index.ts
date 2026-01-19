/**
 * Harken SDK - Attachment Features
 *
 * This module contains attachment upload functionality which requires
 * native module dependencies (expo-file-system, expo-image-picker, etc.).
 *
 * Import from this module only when you need attachment features:
 *
 * @example
 * ```tsx
 * // Core SDK (no native dependencies at import time)
 * import { HarkenProvider, useFeedback } from '@harken/sdk-react-native';
 *
 * // Attachment features (requires native modules)
 * import { useAttachmentUpload, AttachmentGrid } from '@harken/sdk-react-native/attachments';
 *
 * // Or use the batteries-included FeedbackSheet with attachments
 * import { FeedbackSheet } from '@harken/sdk-react-native/attachments';
 * ```
 *
 * @packageDocumentation
 */

// Attachment hooks
export { useAttachmentUpload } from '../hooks/useAttachmentUpload';
export type {
  AttachmentState,
  UseAttachmentUploadResult,
} from '../hooks/useAttachmentUpload';

export { useAttachmentPicker } from '../hooks/useAttachmentPicker';
export type {
  AttachmentSourceConfig,
  UseAttachmentPickerResult,
} from '../hooks/useAttachmentPicker';

export { useAttachmentStatus } from '../hooks/useAttachmentStatus';
export type { AttachmentStatus } from '../hooks/useAttachmentStatus';

// Attachment components
export { AttachmentPicker } from '../components/AttachmentPicker';
export type {
  AttachmentPickerProps,
  AttachmentSource,
  PickerOptionConfig,
} from '../components/AttachmentPicker';

export { UploadStatusOverlay } from '../components/UploadStatusOverlay';
export type {
  UploadStatusOverlayProps,
  UploadStatusLabels,
} from '../components/UploadStatusOverlay';

export { AttachmentPreview } from '../components/AttachmentPreview';
export type { AttachmentPreviewProps } from '../components/AttachmentPreview';

export { AttachmentGrid } from '../components/AttachmentGrid';
export type { AttachmentGridProps } from '../components/AttachmentGrid';

// Services (for advanced usage)
export {
  UploadQueueService,
  uploadQueueService,
  UploadQueueStorage,
} from '../services';
export type {
  UploadQueueServiceConfig,
  EnqueueParams,
} from '../services';

// Re-export domain types needed for attachments
export { UploadPhase, DEFAULT_UPLOAD_RETRY_CONFIG } from '../domain';
export type {
  QueueItem,
  QueueStatus,
  UploadProgress,
  UploadRetryConfig,
} from '../domain';

// FeedbackSheet with attachment support
export { FeedbackSheet } from './FeedbackSheet';
export type { FeedbackSheetProps } from './FeedbackSheet';
