/**
 * Harken SDK - Attachment Features
 *
 * @deprecated Import from '@harkenapp/sdk-react-native' instead.
 * This entry point is maintained for backwards compatibility.
 *
 * @example
 * ```tsx
 * // Preferred (single entry point)
 * import { HarkenProvider, FeedbackSheet, useAttachmentUpload } from '@harkenapp/sdk-react-native';
 *
 * // Legacy (still works)
 * import { FeedbackSheet } from '@harkenapp/sdk-react-native/attachments';
 * ```
 *
 * @packageDocumentation
 */

// Re-export everything from the main entry point for backwards compatibility
export {
  // Attachment hooks
  useAttachmentUpload,
  useAttachmentPicker,
  useAttachmentStatus,

  // Attachment components
  AttachmentPicker,
  UploadStatusOverlay,
  AttachmentPreview,
  AttachmentGrid,
  FeedbackSheet,

  // Services
  UploadQueueService,
  uploadQueueService,
  UploadQueueStorage,

  // Domain types
  UploadPhase,
  DEFAULT_UPLOAD_RETRY_CONFIG,
} from "../index";

export type {
  // Attachment hook types
  AttachmentState,
  UseAttachmentUploadResult,
  AttachmentSourceConfig,
  UseAttachmentPickerResult,
  AttachmentStatus,

  // Attachment component types
  AttachmentPickerProps,
  AttachmentSource,
  PickerOptionConfig,
  UploadStatusOverlayProps,
  UploadStatusLabels,
  AttachmentPreviewProps,
  AttachmentGridProps,
  FeedbackSheetProps,

  // Service types
  UploadQueueServiceConfig,
  EnqueueParams,

  // Domain types
  QueueItem,
  QueueStatus,
  UploadProgress,
  UploadRetryConfig,
} from "../index";
