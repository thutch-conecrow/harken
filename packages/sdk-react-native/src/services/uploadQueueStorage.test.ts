import { describe, it, expect, vi, beforeEach } from "vitest";
import { UploadQueueStorage } from "./uploadQueueStorage";
import { UploadPhase } from "../domain";
import type { QueueItem, PersistedQueue } from "../domain";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

const STORAGE_KEY = "@harkenapp/upload-queue";

function createMockQueueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: "queue_1",
    attachmentId: "att_1",
    localUri: "file:///path/to/file.png",
    uploadUrl: "https://storage.example.com/upload",
    uploadExpiresAt: "2024-01-01T01:00:00Z",
    mimeType: "image/png",
    fileName: "screenshot.png",
    fileSize: 12345,
    phase: UploadPhase.QUEUED,
    progress: 0,
    attemptNumber: 1,
    maxAttempts: 3,
    createdAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("UploadQueueStorage", () => {
  let storage: UploadQueueStorage;
  const mockAsyncStorage = AsyncStorage as unknown as {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new UploadQueueStorage();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  describe("loadQueue", () => {
    it("returns empty array when no queue exists", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const items = await storage.loadQueue();

      expect(items).toEqual([]);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("returns items from valid persisted queue", async () => {
      const persistedQueue: PersistedQueue = {
        version: 1,
        items: [
          createMockQueueItem({ id: "queue_1", attachmentId: "att_1" }),
          createMockQueueItem({ id: "queue_2", attachmentId: "att_2" }),
        ],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(persistedQueue));

      const items = await storage.loadQueue();

      expect(items).toHaveLength(2);
      expect(items[0]!.attachmentId).toBe("att_1");
      expect(items[1]!.attachmentId).toBe("att_2");
    });

    it("returns empty array for invalid JSON", async () => {
      mockAsyncStorage.getItem.mockResolvedValue("not valid json {{{");

      const items = await storage.loadQueue();

      expect(items).toEqual([]);
    });

    it("returns empty array when storage throws", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));

      const items = await storage.loadQueue();

      expect(items).toEqual([]);
    });

    it("migrates and returns empty for unknown version", async () => {
      const persistedQueue = {
        version: 999,
        items: [createMockQueueItem()],
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(persistedQueue));

      const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

      const items = await storage.loadQueue();

      expect(items).toEqual([]);
      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining("Unknown queue version 999")
      );

      consoleWarn.mockRestore();
    });
  });

  describe("saveQueue", () => {
    it("saves queue items with version", async () => {
      const items = [
        createMockQueueItem({ id: "queue_1" }),
        createMockQueueItem({ id: "queue_2" }),
      ];

      await storage.saveQueue(items);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));

      const call = mockAsyncStorage.setItem.mock.calls[0];
      expect(call).toBeDefined();
      const savedData = JSON.parse(call![1]) as PersistedQueue;
      expect(savedData.version).toBe(1);
      expect(savedData.items).toHaveLength(2);
    });

    it("saves empty array correctly", async () => {
      await storage.saveQueue([]);

      const call = mockAsyncStorage.setItem.mock.calls[0];
      expect(call).toBeDefined();
      const savedData = JSON.parse(call![1]) as PersistedQueue;
      expect(savedData.items).toEqual([]);
    });

    it("handles storage error gracefully", async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error("Storage error"));
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      // Should not throw
      await expect(storage.saveQueue([createMockQueueItem()])).resolves.not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it("preserves all queue item fields", async () => {
      const item = createMockQueueItem({
        id: "queue_123",
        attachmentId: "att_456",
        localUri: "file:///custom/path.png",
        phase: UploadPhase.UPLOADING,
        progress: 0.5,
        attemptNumber: 2,
        lastError: "Previous attempt failed",
        startedAt: "2024-01-01T00:00:05Z",
        scheduledRetryAt: "2024-01-01T00:01:00Z",
      });

      await storage.saveQueue([item]);

      const call = mockAsyncStorage.setItem.mock.calls[0];
      expect(call).toBeDefined();
      const savedData = JSON.parse(call![1]) as PersistedQueue;
      const savedItem = savedData.items[0]!;

      expect(savedItem.id).toBe("queue_123");
      expect(savedItem.attachmentId).toBe("att_456");
      expect(savedItem.phase).toBe(UploadPhase.UPLOADING);
      expect(savedItem.progress).toBe(0.5);
      expect(savedItem.lastError).toBe("Previous attempt failed");
      expect(savedItem.startedAt).toBe("2024-01-01T00:00:05Z");
    });
  });

  describe("clearQueue", () => {
    it("removes queue from storage", async () => {
      await storage.clearQueue();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("handles storage error gracefully", async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error("Storage error"));
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      // Should not throw
      await expect(storage.clearQueue()).resolves.not.toThrow();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe("round-trip persistence", () => {
    it("can save and reload queue items", async () => {
      // Set up mock to return saved data on next load
      let savedData: string | null = null;
      mockAsyncStorage.setItem.mockImplementation(async (key: string, value: string) => {
        if (key === STORAGE_KEY) savedData = value;
      });
      mockAsyncStorage.getItem.mockImplementation(async (key: string) => {
        if (key === STORAGE_KEY) return savedData;
        return null;
      });

      const originalItems = [
        createMockQueueItem({
          id: "queue_1",
          phase: UploadPhase.QUEUED,
          progress: 0,
        }),
        createMockQueueItem({
          id: "queue_2",
          phase: UploadPhase.UPLOADING,
          progress: 0.75,
        }),
        createMockQueueItem({
          id: "queue_3",
          phase: UploadPhase.FAILED,
          progress: 0.3,
          lastError: "Connection timeout",
        }),
      ];

      await storage.saveQueue(originalItems);
      const loadedItems = await storage.loadQueue();

      expect(loadedItems).toHaveLength(3);
      expect(loadedItems[0]!.id).toBe("queue_1");
      expect(loadedItems[0]!.phase).toBe(UploadPhase.QUEUED);
      expect(loadedItems[1]!.progress).toBe(0.75);
      expect(loadedItems[2]!.lastError).toBe("Connection timeout");
    });
  });
});
