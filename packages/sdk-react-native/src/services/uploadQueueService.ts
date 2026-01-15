/**
 * Upload Queue Service
 *
 * Singleton service that manages background attachment uploads.
 * Uses expo-file-system/legacy for background upload support.
 *
 * Key design decisions (from feature spec):
 * - D1: Uses expo-file-system/legacy with BACKGROUND session type
 * - D2: Initialized once at app startup in HarkenProvider
 * - D3: Persists queue to AsyncStorage
 * - D4: Exponential backoff (2s base, 60s max, 3 attempts, 1s jitter)
 * - D5: Auto-pause when offline via NetInfo
 * - D6: Real progress tracking from expo-file-system
 */

import * as FileSystem from 'expo-file-system/legacy';
import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from '@react-native-community/netinfo';
import { HarkenClient } from '../api/client';
import { UploadQueueStorage } from './uploadQueueStorage';
import {
  QueueItem,
  QueueStatus,
  UploadPhase,
  UploadProgress,
  UploadRetryConfig,
  DEFAULT_UPLOAD_RETRY_CONFIG,
} from '../domain';
import { generateUUID } from '../utils';

// Callback types for event subscriptions
type ProgressCallback = (progress: UploadProgress) => void;
type CompleteCallback = (attachmentId: string) => void;
type ErrorCallback = (attachmentId: string, error: string) => void;

/**
 * Configuration for initializing the upload queue service.
 */
export interface UploadQueueServiceConfig {
  /** Configured HarkenClient instance */
  client: HarkenClient;
  /** Override retry configuration */
  retryConfig?: Partial<UploadRetryConfig>;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Parameters for enqueuing a new upload.
 */
export interface EnqueueParams {
  /** Local file URI (file://) */
  localUri: string;
  /** MIME type (e.g., 'image/png') */
  mimeType: string;
  /** Original filename */
  fileName: string;
  /** File size in bytes */
  fileSize: number;
}

/**
 * Singleton service for managing background attachment uploads.
 */
export class UploadQueueService {
  private static instance: UploadQueueService | null = null;

  private client: HarkenClient | null = null;
  private retryConfig: UploadRetryConfig = DEFAULT_UPLOAD_RETRY_CONFIG;
  private storage = new UploadQueueStorage();
  private debug = false;

  // Queue state
  private items: Map<string, QueueItem> = new Map();
  private isProcessing = false;
  private isPaused = false;
  private isInitialized = false;

  // Active upload tasks (for cancellation)
  private activeTasks: Map<string, FileSystem.UploadTask> = new Map();

  // Event subscribers
  private progressListeners: Set<ProgressCallback> = new Set();
  private completeListeners: Set<CompleteCallback> = new Set();
  private errorListeners: Set<ErrorCallback> = new Set();

  // Network monitoring
  private networkUnsubscribe: NetInfoSubscription | null = null;

  // Retry timer - schedules wake-up when next retry is due
  private retryTimerId: ReturnType<typeof setTimeout> | null = null;

  private constructor() {}

  /**
   * Get the singleton instance.
   */
  static getInstance(): UploadQueueService {
    if (!UploadQueueService.instance) {
      UploadQueueService.instance = new UploadQueueService();
    }
    return UploadQueueService.instance;
  }

  /**
   * Initialize the queue service.
   *
   * Must be called once at app startup (in HarkenProvider).
   * This prevents the race condition where uploads complete
   * before callbacks are registered.
   */
  async initialize(config: UploadQueueServiceConfig): Promise<void> {
    if (this.isInitialized) {
      this.log('Already initialized, skipping');
      return;
    }

    this.client = config.client;
    this.retryConfig = { ...DEFAULT_UPLOAD_RETRY_CONFIG, ...config.retryConfig };
    this.debug = config.debug ?? false;

    // Load persisted queue
    const persistedItems = await this.storage.loadQueue();
    for (const item of persistedItems) {
      // Reset any "uploading" or "confirming" items to "queued"
      // (app was killed mid-upload)
      if (
        item.phase === UploadPhase.UPLOADING ||
        item.phase === UploadPhase.CONFIRMING
      ) {
        item.phase = UploadPhase.QUEUED;
        item.progress = 0;
      }
      this.items.set(item.id, item);
    }

    // Setup network monitoring
    this.setupNetworkMonitoring();

    this.isInitialized = true;
    this.log(`Initialized with ${this.items.size} queued items`);

    // Start processing if we have items
    if (this.items.size > 0) {
      void this.processQueue();
    }
  }

  /**
   * Check if the service is initialized.
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Enqueue a new attachment for upload.
   *
   * This method:
   * 1. Requests a presigned URL from the server
   * 2. Creates a queue item
   * 3. Persists the queue
   * 4. Triggers queue processing
   *
   * Returns immediately with the attachment ID (upload happens in background).
   */
  async enqueue(params: EnqueueParams): Promise<{
    attachmentId: string;
    queueItemId: string;
  }> {
    if (!this.client) {
      throw new Error('UploadQueueService not initialized');
    }

    // 1. Get presigned URL from server
    const presignResponse = await this.client.createAttachmentUpload({
      filename: params.fileName,
      content_type: params.mimeType,
      size: params.fileSize,
    });

    // 2. Create queue item
    const queueItem: QueueItem = {
      id: generateUUID(),
      attachmentId: presignResponse.attachment_id,
      localUri: params.localUri,
      uploadUrl: presignResponse.upload_url,
      uploadExpiresAt: presignResponse.upload_expires_at,
      mimeType: params.mimeType,
      fileName: params.fileName,
      fileSize: params.fileSize,
      phase: UploadPhase.QUEUED,
      progress: 0,
      attemptNumber: 0,
      maxAttempts: this.retryConfig.maxAttempts,
      createdAt: new Date().toISOString(),
    };

    // 3. Add to queue and persist
    this.items.set(queueItem.id, queueItem);
    await this.persistQueue();

    // 4. Emit initial progress
    this.emitProgress(queueItem);

    // 5. Trigger queue processing
    void this.processQueue();

    this.log(`Enqueued ${presignResponse.attachment_id}`);

    return {
      attachmentId: presignResponse.attachment_id,
      queueItemId: queueItem.id,
    };
  }

  /**
   * Process the upload queue.
   *
   * Processes items sequentially (one at a time) to avoid memory pressure
   * on low-end devices.
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.isPaused) {
      return;
    }

    // Clear any pending retry timer since we're processing now
    this.clearRetryTimer();

    this.isProcessing = true;
    this.log('Processing queue...');

    try {
      while (true) {
        // Find next item to process
        const item = this.getNextQueuedItem();
        if (!item) {
          this.log('No more items to process');
          break;
        }

        if (this.isPaused) {
          this.log('Queue paused, stopping processing');
          break;
        }

        await this.processItem(item);
      }
    } finally {
      this.isProcessing = false;
      // Schedule wake-up for any pending retries
      this.scheduleNextRetry();
    }
  }

  /**
   * Process a single queue item.
   */
  private async processItem(item: QueueItem): Promise<void> {
    this.log(`Processing item ${item.id} (attachment: ${item.attachmentId})`);

    // Check if URL has expired
    if (new Date(item.uploadExpiresAt) < new Date()) {
      this.log(`URL expired for ${item.attachmentId}`);
      await this.handleItemFailure(item, 'Upload URL expired');
      return;
    }

    // Check if we need to wait for retry delay
    if (item.scheduledRetryAt) {
      const waitUntil = new Date(item.scheduledRetryAt);
      if (waitUntil > new Date()) {
        const waitMs = waitUntil.getTime() - Date.now();
        this.log(`Waiting ${waitMs}ms before retry for ${item.attachmentId}`);
        await this.sleep(waitMs);
      }
    }

    // Update state to uploading
    item.phase = UploadPhase.UPLOADING;
    item.startedAt = new Date().toISOString();
    item.attemptNumber += 1;
    await this.persistQueue();
    this.emitProgress(item);

    try {
      // Perform the upload
      await this.uploadFile(item);

      // Confirm with server
      item.phase = UploadPhase.CONFIRMING;
      await this.persistQueue();
      this.emitProgress(item);

      await this.client!.confirmAttachment(item.attachmentId, {
        bytes_uploaded: item.fileSize,
      });

      // Success!
      item.phase = UploadPhase.COMPLETED;
      item.completedAt = new Date().toISOString();
      item.progress = 1;
      await this.persistQueue();
      this.emitProgress(item);
      this.emitComplete(item.attachmentId);

      this.log(`Completed upload for ${item.attachmentId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.log(`Upload failed for ${item.attachmentId}: ${errorMessage}`);

      if (item.attemptNumber < item.maxAttempts) {
        // Schedule retry with exponential backoff
        const delay = this.calculateRetryDelay(item.attemptNumber);
        item.phase = UploadPhase.QUEUED;
        item.progress = 0;
        item.lastError = errorMessage;
        item.scheduledRetryAt = new Date(Date.now() + delay).toISOString();
        await this.persistQueue();
        this.emitProgress(item);
        this.log(`Scheduled retry in ${delay}ms for ${item.attachmentId}`);
      } else {
        await this.handleItemFailure(item, errorMessage);
      }
    }
  }

  /**
   * Upload file using expo-file-system background upload.
   *
   * Uses FileSystemSessionType.BACKGROUND for true background uploads
   * that continue even when the app is backgrounded.
   */
  private async uploadFile(item: QueueItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const uploadTask = FileSystem.createUploadTask(
        item.uploadUrl,
        item.localUri,
        {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
          headers: {
            'Content-Type': item.mimeType,
          },
        },
        (progress) => {
          // Real progress from expo-file-system (D6)
          // Guard against NaN if totalBytesExpectedToSend is 0
          const percent =
            progress.totalBytesExpectedToSend > 0
              ? progress.totalBytesSent / progress.totalBytesExpectedToSend
              : 0;
          item.progress = Math.min(1, Math.max(0, percent)); // Clamp to 0-1
          this.emitProgress(item);
        }
      );

      this.activeTasks.set(item.id, uploadTask);

      uploadTask
        .uploadAsync()
        .then((result) => {
          this.activeTasks.delete(item.id);

          if (result && result.status >= 200 && result.status < 300) {
            resolve();
          } else {
            reject(
              new Error(`Upload failed with status ${result?.status ?? 'unknown'}`)
            );
          }
        })
        .catch((error) => {
          this.activeTasks.delete(item.id);
          reject(error);
        });
    });
  }

  /**
   * Handle permanent item failure (max retries exceeded).
   */
  private async handleItemFailure(item: QueueItem, error: string): Promise<void> {
    item.phase = UploadPhase.FAILED;
    item.lastError = error;
    item.completedAt = new Date().toISOString();
    await this.persistQueue();
    this.emitProgress(item);
    this.emitError(item.attachmentId, error);

    // Report to server (fire and forget)
    try {
      await this.client!.reportAttachmentFailure(item.attachmentId, error);
    } catch {
      this.log(`Failed to report failure for ${item.attachmentId}`);
    }

    this.log(`Item ${item.attachmentId} failed: ${error}`);
  }

  /**
   * Calculate retry delay with exponential backoff and jitter (D4).
   */
  private calculateRetryDelay(attemptNumber: number): number {
    const { baseDelayMs, maxDelayMs, jitterMs } = this.retryConfig;

    // Exponential: 2s, 4s, 8s, 16s, ...
    const exponential = baseDelayMs * Math.pow(2, attemptNumber - 1);
    const capped = Math.min(exponential, maxDelayMs);

    // Add random jitter (-jitterMs to +jitterMs)
    const jitter = (Math.random() - 0.5) * 2 * jitterMs;

    return Math.max(0, capped + jitter);
  }

  /**
   * Get next item that's ready to process.
   */
  private getNextQueuedItem(): QueueItem | undefined {
    const now = new Date();

    for (const item of this.items.values()) {
      if (item.phase !== UploadPhase.QUEUED) continue;

      // Check if past scheduled retry time
      if (item.scheduledRetryAt && new Date(item.scheduledRetryAt) > now) {
        continue;
      }

      return item;
    }

    return undefined;
  }

  // --- Retry Timer ---

  /**
   * Schedule a timer to wake up processQueue when the next retry is due.
   * This prevents retries from stalling indefinitely.
   */
  private scheduleNextRetry(): void {
    // Don't schedule if paused
    if (this.isPaused) return;

    // Find the earliest scheduledRetryAt among queued items
    let earliestRetry: Date | null = null;

    for (const item of this.items.values()) {
      if (item.phase !== UploadPhase.QUEUED) continue;
      if (!item.scheduledRetryAt) continue;

      const retryTime = new Date(item.scheduledRetryAt);
      if (!earliestRetry || retryTime < earliestRetry) {
        earliestRetry = retryTime;
      }
    }

    if (!earliestRetry) return;

    const now = Date.now();
    const delay = Math.max(0, earliestRetry.getTime() - now);

    this.log(`Scheduling retry timer for ${delay}ms`);

    this.retryTimerId = setTimeout(() => {
      this.retryTimerId = null;
      void this.processQueue();
    }, delay);
  }

  /**
   * Clear any pending retry timer.
   */
  private clearRetryTimer(): void {
    if (this.retryTimerId) {
      clearTimeout(this.retryTimerId);
      this.retryTimerId = null;
    }
  }

  // --- Network Monitoring (D5) ---

  private setupNetworkMonitoring(): void {
    this.networkUnsubscribe = NetInfo.addEventListener(
      (state: NetInfoState) => {
        if (state.isConnected && this.isPaused) {
          this.log('Network restored, resuming queue');
          this.isPaused = false;
          void this.processQueue();
        } else if (!state.isConnected && !this.isPaused) {
          this.log('Network lost, pausing queue');
          this.isPaused = true;
          // Cancel active uploads - they'll resume when back online
          for (const [id, task] of this.activeTasks) {
            void task.cancelAsync();
            const item = this.items.get(id);
            if (item) {
              item.phase = UploadPhase.QUEUED;
              item.progress = 0;
            }
          }
          this.activeTasks.clear();
          void this.persistQueue();
        }
      }
    );
  }

  // --- Event Emitters ---

  private emitProgress(item: QueueItem): void {
    const progress: UploadProgress = {
      attachmentId: item.attachmentId,
      phase: item.phase,
      progress: item.progress,
      error: item.lastError,
    };
    this.progressListeners.forEach((cb) => cb(progress));
  }

  private emitComplete(attachmentId: string): void {
    this.completeListeners.forEach((cb) => cb(attachmentId));
  }

  private emitError(attachmentId: string, error: string): void {
    this.errorListeners.forEach((cb) => cb(attachmentId, error));
  }

  // --- Public Event Subscriptions ---

  /**
   * Subscribe to progress updates.
   * @returns Unsubscribe function
   */
  onProgress(callback: ProgressCallback): () => void {
    this.progressListeners.add(callback);
    return () => this.progressListeners.delete(callback);
  }

  /**
   * Subscribe to upload completions.
   * @returns Unsubscribe function
   */
  onComplete(callback: CompleteCallback): () => void {
    this.completeListeners.add(callback);
    return () => this.completeListeners.delete(callback);
  }

  /**
   * Subscribe to upload errors.
   * @returns Unsubscribe function
   */
  onError(callback: ErrorCallback): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  // --- Public API ---

  /**
   * Get current queue status.
   */
  getQueueStatus(): QueueStatus {
    let queued = 0;
    let uploading = 0;
    let completed = 0;
    let failed = 0;

    for (const item of this.items.values()) {
      switch (item.phase) {
        case UploadPhase.QUEUED:
          queued++;
          break;
        case UploadPhase.UPLOADING:
        case UploadPhase.CONFIRMING:
          uploading++;
          break;
        case UploadPhase.COMPLETED:
          completed++;
          break;
        case UploadPhase.FAILED:
          failed++;
          break;
      }
    }

    return {
      total: this.items.size,
      queued,
      uploading,
      completed,
      failed,
      isPaused: this.isPaused,
    };
  }

  /**
   * Get a queue item by attachment ID.
   */
  getItemByAttachmentId(attachmentId: string): QueueItem | undefined {
    for (const item of this.items.values()) {
      if (item.attachmentId === attachmentId) return item;
    }
    return undefined;
  }

  /**
   * Retry a failed upload.
   */
  async retryItem(attachmentId: string): Promise<void> {
    const item = this.getItemByAttachmentId(attachmentId);
    if (!item || item.phase !== UploadPhase.FAILED) {
      throw new Error('Item not found or not in failed state');
    }

    item.phase = UploadPhase.QUEUED;
    item.progress = 0;
    item.attemptNumber = 0;
    item.lastError = undefined;
    item.scheduledRetryAt = undefined;

    await this.persistQueue();
    void this.processQueue();

    this.log(`Retrying ${attachmentId}`);
  }

  /**
   * Cancel and remove an item from the queue.
   */
  async cancelItem(attachmentId: string): Promise<void> {
    for (const [id, item] of this.items) {
      if (item.attachmentId === attachmentId) {
        // Cancel active upload if any
        const task = this.activeTasks.get(id);
        if (task) {
          await task.cancelAsync();
          this.activeTasks.delete(id);
        }

        this.items.delete(id);
        await this.persistQueue();

        this.log(`Cancelled ${attachmentId}`);
        return;
      }
    }
  }

  /**
   * Clear all completed items from the queue.
   */
  async clearCompleted(): Promise<void> {
    for (const [id, item] of this.items) {
      if (item.phase === UploadPhase.COMPLETED) {
        this.items.delete(id);
      }
    }
    await this.persistQueue();
    this.log('Cleared completed items');
  }

  /**
   * Clear all failed items from the queue.
   */
  async clearFailed(): Promise<void> {
    for (const [id, item] of this.items) {
      if (item.phase === UploadPhase.FAILED) {
        this.items.delete(id);
      }
    }
    await this.persistQueue();
    this.log('Cleared failed items');
  }

  // --- Internal Utilities ---

  private async persistQueue(): Promise<void> {
    await this.storage.saveQueue(Array.from(this.items.values()));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private log(message: string): void {
    if (this.debug) {
      console.log(`[UploadQueue] ${message}`);
    }
  }

  // --- Cleanup ---

  /**
   * Destroy the service instance.
   * Used primarily for testing.
   */
  destroy(): void {
    this.clearRetryTimer();
    this.networkUnsubscribe?.();
    this.activeTasks.forEach((task) => void task.cancelAsync());
    this.activeTasks.clear();
    this.progressListeners.clear();
    this.completeListeners.clear();
    this.errorListeners.clear();
    this.items.clear();
    this.isInitialized = false;
    UploadQueueService.instance = null;
  }
}

/**
 * Singleton instance getter.
 */
export const uploadQueueService = UploadQueueService.getInstance();
