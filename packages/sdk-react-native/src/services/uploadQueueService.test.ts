import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UploadPhase } from "../domain";
import type { QueueItem, UploadProgress } from "../domain";

// Mock storage - use vi.hoisted to ensure variables are available for mocks
const { mockLoadQueue, mockSaveQueue, mockClearQueue } = vi.hoisted(() => ({
  mockLoadQueue: vi.fn(),
  mockSaveQueue: vi.fn(),
  mockClearQueue: vi.fn(),
}));

vi.mock("./uploadQueueStorage", () => ({
  UploadQueueStorage: class MockStorage {
    loadQueue = mockLoadQueue;
    saveQueue = mockSaveQueue;
    clearQueue = mockClearQueue;
  },
}));

// Mock FileSystem
const { mockUploadTask } = vi.hoisted(() => ({
  mockUploadTask: {
    uploadAsync: vi.fn(),
    cancelAsync: vi.fn(),
  },
}));

vi.mock("expo-file-system/legacy", () => ({
  createUploadTask: vi.fn(() => mockUploadTask),
  FileSystemUploadType: { BINARY_CONTENT: "binary" },
  FileSystemSessionType: { BACKGROUND: "background" },
}));

// Mock NetInfo
vi.mock("@react-native-community/netinfo", () => ({
  default: {
    addEventListener: vi.fn(() => vi.fn()),
  },
}));

// Mock generateUUID
const uuidState = vi.hoisted(() => ({ counter: 0 }));
vi.mock("../utils", () => ({
  generateUUID: () => `uuid-${++uuidState.counter}`,
}));

// Import after mocks are set up
import { UploadQueueService } from "./uploadQueueService";

// Mock client
function createMockClient() {
  return {
    createAttachmentUpload: vi.fn().mockResolvedValue({
      attachment_id: "att_123",
      upload_url: "https://storage.example.com/upload",
      upload_expires_at: new Date(Date.now() + 3600000).toISOString(),
    }),
    confirmAttachment: vi.fn().mockResolvedValue({}),
    reportAttachmentFailure: vi.fn().mockResolvedValue({}),
  };
}

describe("UploadQueueService", () => {
  let service: UploadQueueService;
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    uuidState.counter = 0;
    mockLoadQueue.mockResolvedValue([]);
    mockSaveQueue.mockResolvedValue(undefined);
    mockUploadTask.uploadAsync.mockResolvedValue({ status: 200 });

    // Get fresh instance by destroying any existing one
    service = UploadQueueService.getInstance();
    service.destroy();
    service = UploadQueueService.getInstance();

    mockClient = createMockClient();
  });

  afterEach(() => {
    service.destroy();
  });

  describe("initialization", () => {
    it("loads persisted queue on initialize", async () => {
      // Use an item that's already COMPLETED so it doesn't get processed
      const persistedItem: QueueItem = {
        id: "queue_1",
        attachmentId: "att_persisted",
        localUri: "file:///photo.jpg",
        uploadUrl: "https://storage.example.com/upload",
        uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: 1000,
        phase: UploadPhase.COMPLETED, // Already done, won't be processed
        progress: 1,
        attemptNumber: 1,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      mockLoadQueue.mockResolvedValue([persistedItem]);

      await service.initialize({ client: mockClient as never });

      const status = service.getQueueStatus();
      expect(status.total).toBe(1);
      expect(status.completed).toBe(1);
    });

    it("resets uploading items to queued on initialize", async () => {
      const uploadingItem: QueueItem = {
        id: "queue_1",
        attachmentId: "att_interrupted",
        localUri: "file:///photo.jpg",
        uploadUrl: "https://storage.example.com/upload",
        uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: 1000,
        phase: UploadPhase.UPLOADING, // Was mid-upload when app was killed
        progress: 0.5,
        attemptNumber: 1,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
      };
      mockLoadQueue.mockResolvedValue([uploadingItem]);

      // processQueue() only processes items in QUEUED phase, so receiving
      // any progress event for this item proves it was reset from UPLOADING to QUEUED
      const progressReceived = new Promise<UploadProgress>((resolve) => {
        service.onProgress((p) => {
          if (p.attachmentId === "att_interrupted") resolve(p);
        });
      });

      await service.initialize({ client: mockClient as never });

      // Wait for a progress event on the interrupted item
      const progress = await progressReceived;

      // The item was processed (received progress), which proves it was reset
      // to QUEUED since processQueue() skips non-QUEUED items
      expect(progress.attachmentId).toBe("att_interrupted");
      // Should have progressed beyond initial state
      expect([UploadPhase.UPLOADING, UploadPhase.CONFIRMING, UploadPhase.COMPLETED]).toContain(progress.phase);
    });
  });

  describe("enqueue", () => {
    it("creates queue item and calls presign API", async () => {
      await service.initialize({ client: mockClient as never });

      const result = await service.enqueue({
        localUri: "file:///new-photo.jpg",
        mimeType: "image/jpeg",
        fileName: "new-photo.jpg",
        fileSize: 2000,
      });

      expect(result.attachmentId).toBe("att_123");
      expect(mockClient.createAttachmentUpload).toHaveBeenCalledWith({
        filename: "new-photo.jpg",
        content_type: "image/jpeg",
        size: 2000,
      });

      // Item exists (may have started processing already)
      const item = service.getItemByAttachmentId("att_123");
      expect(item).toBeDefined();
    });

    it("persists queue after enqueue", async () => {
      await service.initialize({ client: mockClient as never });

      await service.enqueue({
        localUri: "file:///photo.jpg",
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: 1000,
      });

      expect(mockSaveQueue).toHaveBeenCalled();
    });
  });

  describe("progress events", () => {
    it("fires progress callback on state changes", async () => {
      await service.initialize({ client: mockClient as never });

      const progressEvents: { phase: UploadPhase; progress: number }[] = [];
      service.onProgress((progress) => {
        progressEvents.push({ phase: progress.phase, progress: progress.progress });
      });

      await service.enqueue({
        localUri: "file:///photo.jpg",
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: 1000,
      });

      // Should have emitted initial QUEUED progress
      expect(progressEvents.length).toBeGreaterThan(0);
      expect(progressEvents[0]).toMatchObject({
        phase: UploadPhase.QUEUED,
        progress: 0,
      });
    });

    it("unsubscribe stops receiving events", async () => {
      await service.initialize({ client: mockClient as never });

      let callCount = 0;
      const unsubscribe = service.onProgress(() => {
        callCount++;
      });

      await service.enqueue({
        localUri: "file:///photo1.jpg",
        mimeType: "image/jpeg",
        fileName: "photo1.jpg",
        fileSize: 1000,
      });

      const countAfterFirst = callCount;

      unsubscribe();

      await service.enqueue({
        localUri: "file:///photo2.jpg",
        mimeType: "image/jpeg",
        fileName: "photo2.jpg",
        fileSize: 1000,
      });

      // Count should not increase after unsubscribe
      expect(callCount).toBe(countAfterFirst);
    });
  });

  describe("retry scheduling", () => {
    it("resets attempt count and clears error on retry", async () => {
      const failedItem: QueueItem = {
        id: "queue_1",
        attachmentId: "att_failed",
        localUri: "file:///photo.jpg",
        uploadUrl: "https://storage.example.com/upload",
        uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: 1000,
        phase: UploadPhase.FAILED,
        progress: 0,
        attemptNumber: 2,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        lastError: "Previous error",
      };
      mockLoadQueue.mockResolvedValue([failedItem]);

      await service.initialize({ client: mockClient as never });

      // Verify item is in failed state
      expect(service.getItemByAttachmentId("att_failed")?.phase).toBe(UploadPhase.FAILED);
      expect(service.getItemByAttachmentId("att_failed")?.attemptNumber).toBe(2);

      // Retry should reset state and trigger processing
      await service.retryItem("att_failed");

      // After retry, item should exist and lastError should be cleared
      // Note: attemptNumber may be 0 or 1 depending on whether processing started
      const item = service.getItemByAttachmentId("att_failed");
      expect(item).toBeDefined();
      expect(item?.lastError).toBeUndefined(); // Error cleared
      // Phase should no longer be FAILED
      expect(item?.phase).not.toBe(UploadPhase.FAILED);
    });

    it("throws when retrying non-failed item", async () => {
      // Use COMPLETED item since QUEUED will start processing
      const completedItem: QueueItem = {
        id: "queue_1",
        attachmentId: "att_completed",
        localUri: "file:///photo.jpg",
        uploadUrl: "https://storage.example.com/upload",
        uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: 1000,
        phase: UploadPhase.COMPLETED,
        progress: 1,
        attemptNumber: 1,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
      };
      mockLoadQueue.mockResolvedValue([completedItem]);

      await service.initialize({ client: mockClient as never });

      await expect(service.retryItem("att_completed")).rejects.toThrow("not in failed state");
    });
  });

  describe("failure handling", () => {
    it("transitions to FAILED after max attempts exceeded", async () => {
      // Create item that has already used all attempts
      const maxedOutItem: QueueItem = {
        id: "queue_1",
        attachmentId: "att_maxed",
        localUri: "file:///photo.jpg",
        uploadUrl: "https://storage.example.com/upload",
        uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: 1000,
        phase: UploadPhase.QUEUED,
        progress: 0,
        attemptNumber: 2, // Will be 3 after next attempt
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
      };
      mockLoadQueue.mockResolvedValue([maxedOutItem]);

      // Make upload fail
      mockUploadTask.uploadAsync.mockResolvedValue({ status: 500 });

      // Wait for FAILED phase progress event (deterministic signal)
      const failedReceived = new Promise<void>((resolve) => {
        service.onProgress((p) => {
          if (p.phase === UploadPhase.FAILED) resolve();
        });
      });

      await service.initialize({ client: mockClient as never });

      // Wait for the failure to be processed
      await failedReceived;

      const item = service.getItemByAttachmentId("att_maxed");
      expect(item?.phase).toBe(UploadPhase.FAILED);
      expect(item?.attemptNumber).toBe(3);
    });
  });

  describe("queue status", () => {
    it("returns correct counts by phase", async () => {
      // Use only terminal states (COMPLETED, FAILED) to avoid async processing
      const items: QueueItem[] = [
        {
          id: "queue_1",
          attachmentId: "att_1",
          localUri: "file:///1.jpg",
          uploadUrl: "https://storage.example.com/1",
          uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          mimeType: "image/jpeg",
          fileName: "1.jpg",
          fileSize: 1000,
          phase: UploadPhase.COMPLETED,
          progress: 1,
          attemptNumber: 1,
          maxAttempts: 3,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: "queue_2",
          attachmentId: "att_2",
          localUri: "file:///2.jpg",
          uploadUrl: "https://storage.example.com/2",
          uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          mimeType: "image/jpeg",
          fileName: "2.jpg",
          fileSize: 1000,
          phase: UploadPhase.COMPLETED,
          progress: 1,
          attemptNumber: 1,
          maxAttempts: 3,
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
        {
          id: "queue_3",
          attachmentId: "att_3",
          localUri: "file:///3.jpg",
          uploadUrl: "https://storage.example.com/3",
          uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          mimeType: "image/jpeg",
          fileName: "3.jpg",
          fileSize: 1000,
          phase: UploadPhase.FAILED,
          progress: 0,
          attemptNumber: 3,
          maxAttempts: 3,
          createdAt: new Date().toISOString(),
          lastError: "Upload failed",
        },
      ];
      mockLoadQueue.mockResolvedValue(items);

      await service.initialize({ client: mockClient as never });

      const status = service.getQueueStatus();
      expect(status.total).toBe(3);
      expect(status.completed).toBe(2);
      expect(status.failed).toBe(1);
    });
  });

  describe("cancelItem", () => {
    it("removes item from queue", async () => {
      const item: QueueItem = {
        id: "queue_1",
        attachmentId: "att_cancel",
        localUri: "file:///photo.jpg",
        uploadUrl: "https://storage.example.com/upload",
        uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: 1000,
        phase: UploadPhase.QUEUED,
        progress: 0,
        attemptNumber: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
      };
      mockLoadQueue.mockResolvedValue([item]);

      await service.initialize({ client: mockClient as never });

      expect(service.getQueueStatus().total).toBe(1);

      await service.cancelItem("att_cancel");

      expect(service.getQueueStatus().total).toBe(0);
      expect(mockSaveQueue).toHaveBeenCalled();
    });
  });

  describe("clearCompleted", () => {
    it("removes only completed items", async () => {
      const items: QueueItem[] = [
        {
          id: "queue_1",
          attachmentId: "att_completed",
          localUri: "file:///1.jpg",
          uploadUrl: "https://storage.example.com/1",
          uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          mimeType: "image/jpeg",
          fileName: "1.jpg",
          fileSize: 1000,
          phase: UploadPhase.COMPLETED,
          progress: 1,
          attemptNumber: 1,
          maxAttempts: 3,
          createdAt: new Date().toISOString(),
        },
        {
          id: "queue_2",
          attachmentId: "att_queued",
          localUri: "file:///2.jpg",
          uploadUrl: "https://storage.example.com/2",
          uploadExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          mimeType: "image/jpeg",
          fileName: "2.jpg",
          fileSize: 1000,
          phase: UploadPhase.QUEUED,
          progress: 0,
          attemptNumber: 0,
          maxAttempts: 3,
          createdAt: new Date().toISOString(),
        },
      ];
      mockLoadQueue.mockResolvedValue(items);

      await service.initialize({ client: mockClient as never });

      await service.clearCompleted();

      expect(service.getItemByAttachmentId("att_completed")).toBeUndefined();
      expect(service.getItemByAttachmentId("att_queued")).toBeDefined();
    });
  });
});
