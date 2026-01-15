/**
 * Upload queue domain types.
 *
 * These types define the state machine for background attachment uploads.
 */

/**
 * Phases of the upload lifecycle.
 */
export enum UploadPhase {
  /** Waiting in queue to be processed */
  QUEUED = 'queued',
  /** Currently uploading to storage */
  UPLOADING = 'uploading',
  /** Upload complete, confirming with server */
  CONFIRMING = 'confirming',
  /** Successfully uploaded and confirmed */
  COMPLETED = 'completed',
  /** Failed after max retries */
  FAILED = 'failed',
}

/**
 * A single item in the upload queue.
 */
export interface QueueItem {
  /** Internal queue item ID */
  id: string;
  /** Server-assigned attachment ID */
  attachmentId: string;
  /** Local file URI (file://) */
  localUri: string;
  /** Presigned upload URL */
  uploadUrl: string;
  /** ISO timestamp when upload URL expires */
  uploadExpiresAt: string;
  /** MIME type (e.g., 'image/png') */
  mimeType: string;
  /** Original filename */
  fileName: string;
  /** File size in bytes */
  fileSize: number;

  // State
  /** Current phase in upload lifecycle */
  phase: UploadPhase;
  /** Upload progress (0.0 - 1.0) */
  progress: number;
  /** Current attempt number (1-based) */
  attemptNumber: number;
  /** Maximum retry attempts */
  maxAttempts: number;
  /** Last error message if failed */
  lastError?: string;

  // Timestamps
  /** ISO timestamp when item was queued */
  createdAt: string;
  /** ISO timestamp when upload started */
  startedAt?: string;
  /** ISO timestamp when completed or failed */
  completedAt?: string;
  /** ISO timestamp for scheduled retry (backoff) */
  scheduledRetryAt?: string;
}

/**
 * Summary of queue state.
 */
export interface QueueStatus {
  /** Total items in queue */
  total: number;
  /** Items waiting to be processed */
  queued: number;
  /** Items currently uploading or confirming */
  uploading: number;
  /** Successfully completed items */
  completed: number;
  /** Failed items (max retries exceeded) */
  failed: number;
  /** Whether queue is paused (e.g., offline) */
  isPaused: boolean;
}

/**
 * Progress update for a single attachment.
 */
export interface UploadProgress {
  /** Server-assigned attachment ID */
  attachmentId: string;
  /** Current phase */
  phase: UploadPhase;
  /** Upload progress (0.0 - 1.0) */
  progress: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Persisted queue schema for AsyncStorage.
 */
export interface PersistedQueue {
  /** Schema version for migrations */
  version: number;
  /** Queue items */
  items: QueueItem[];
}

/**
 * Configuration for upload retry behavior.
 */
export interface UploadRetryConfig {
  /** Base delay in milliseconds (default: 2000) */
  baseDelayMs: number;
  /** Maximum delay in milliseconds (default: 60000) */
  maxDelayMs: number;
  /** Maximum number of attempts (default: 3) */
  maxAttempts: number;
  /** Random jitter in milliseconds (default: 1000) */
  jitterMs: number;
}

/**
 * Default retry configuration per feature spec D4.
 */
export const DEFAULT_UPLOAD_RETRY_CONFIG: UploadRetryConfig = {
  baseDelayMs: 2000,
  maxDelayMs: 60000,
  maxAttempts: 3,
  jitterMs: 1000,
};
