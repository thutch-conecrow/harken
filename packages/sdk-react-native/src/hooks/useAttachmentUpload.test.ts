/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAttachmentUpload } from "./useAttachmentUpload";
import { UploadPhase } from "../domain";
import type { UploadProgress } from "../domain";

// Mock uploadQueueService
const mockEnqueue = vi.fn();
const mockRetryItem = vi.fn();
const mockCancelItem = vi.fn();
const mockClearCompleted = vi.fn();
const mockClearFailed = vi.fn();
let mockProgressCallback: ((progress: UploadProgress) => void) | null = null;

vi.mock("../services", () => ({
  uploadQueueService: {
    initialized: true,
    initialize: vi.fn(),
    enqueue: (...args: unknown[]) => mockEnqueue(...args),
    retryItem: (...args: unknown[]) => mockRetryItem(...args),
    cancelItem: (...args: unknown[]) => mockCancelItem(...args),
    clearCompleted: (...args: unknown[]) => mockClearCompleted(...args),
    clearFailed: (...args: unknown[]) => mockClearFailed(...args),
    onProgress: (cb: (progress: UploadProgress) => void) => {
      mockProgressCallback = cb;
      return () => {
        mockProgressCallback = null;
      };
    },
  },
}));

// Mock ImagePicker
const mockLaunchCameraAsync = vi.fn();
const mockLaunchImageLibraryAsync = vi.fn();

vi.mock("expo-image-picker", () => ({
  launchCameraAsync: (...args: unknown[]) => mockLaunchCameraAsync(...args),
  launchImageLibraryAsync: (...args: unknown[]) => mockLaunchImageLibraryAsync(...args),
}));

// Mock DocumentPicker
const mockGetDocumentAsync = vi.fn();

vi.mock("expo-document-picker", () => ({
  getDocumentAsync: (...args: unknown[]) => mockGetDocumentAsync(...args),
}));

// Mock FileSystem
vi.mock("expo-file-system/legacy", () => ({
  getInfoAsync: vi.fn().mockResolvedValue({ exists: true, size: 1000 }),
}));

// Mock useHarkenContext
vi.mock("./useHarkenContext", () => ({
  useHarkenContext: vi.fn(() => ({
    client: {},
    config: { debug: false },
  })),
}));

describe("useAttachmentUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProgressCallback = null;
  });

  describe("pickImage", () => {
    it("adds attachment with correct metadata from camera", async () => {
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: "file:///path/to/photo.jpg",
            fileName: "photo.jpg",
            mimeType: "image/jpeg",
            fileSize: 12345,
          },
        ],
      });
      mockEnqueue.mockResolvedValue({
        attachmentId: "att_123",
        queueItemId: "queue_1",
      });

      const { result } = renderHook(() => useAttachmentUpload());

      let attachment: unknown;
      await act(async () => {
        attachment = await result.current.pickImage("camera");
      });

      expect(mockLaunchCameraAsync).toHaveBeenCalled();
      expect(mockEnqueue).toHaveBeenCalledWith({
        localUri: "file:///path/to/photo.jpg",
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        fileSize: 12345,
      });
      expect(attachment).toMatchObject({
        attachmentId: "att_123",
        localUri: "file:///path/to/photo.jpg",
        phase: UploadPhase.QUEUED,
      });
    });

    it("adds attachment from library", async () => {
      mockLaunchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: "file:///path/to/image.png",
            fileName: "screenshot.png",
            mimeType: "image/png",
            fileSize: 54321,
          },
        ],
      });
      mockEnqueue.mockResolvedValue({
        attachmentId: "att_456",
        queueItemId: "queue_2",
      });

      const { result } = renderHook(() => useAttachmentUpload());

      await act(async () => {
        await result.current.pickImage("library");
      });

      expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          localUri: "file:///path/to/image.png",
          mimeType: "image/png",
        })
      );
    });

    it("returns null when user cancels", async () => {
      mockLaunchCameraAsync.mockResolvedValue({ canceled: true, assets: [] });

      const { result } = renderHook(() => useAttachmentUpload());

      let attachment: unknown;
      await act(async () => {
        attachment = await result.current.pickImage("camera");
      });

      expect(attachment).toBeNull();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  describe("pickDocument", () => {
    it("adds document with correct metadata", async () => {
      mockGetDocumentAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: "file:///path/to/document.pdf",
            name: "report.pdf",
            mimeType: "application/pdf",
            size: 98765,
          },
        ],
      });
      mockEnqueue.mockResolvedValue({
        attachmentId: "att_789",
        queueItemId: "queue_3",
      });

      const { result } = renderHook(() => useAttachmentUpload());

      let attachment: unknown;
      await act(async () => {
        attachment = await result.current.pickDocument();
      });

      expect(mockGetDocumentAsync).toHaveBeenCalledWith({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      expect(mockEnqueue).toHaveBeenCalledWith({
        localUri: "file:///path/to/document.pdf",
        mimeType: "application/pdf",
        fileName: "report.pdf",
        fileSize: 98765,
      });
      expect(attachment).toMatchObject({
        attachmentId: "att_789",
        fileName: "report.pdf",
      });
    });

    it("returns null when user cancels", async () => {
      mockGetDocumentAsync.mockResolvedValue({ canceled: true, assets: [] });

      const { result } = renderHook(() => useAttachmentUpload());

      let attachment: unknown;
      await act(async () => {
        attachment = await result.current.pickDocument();
      });

      expect(attachment).toBeNull();
      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  describe("progress events", () => {
    it("updates state only for tracked attachment IDs", async () => {
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", fileSize: 1000 }],
      });
      mockEnqueue.mockResolvedValue({ attachmentId: "att_tracked", queueItemId: "queue_1" });

      const { result } = renderHook(() => useAttachmentUpload());

      // Add an attachment
      await act(async () => {
        await result.current.pickImage("camera");
      });

      expect(result.current.attachments).toHaveLength(1);
      expect(result.current.attachments[0]?.progress).toBe(0);

      // Simulate progress event for tracked ID
      act(() => {
        mockProgressCallback?.({
          attachmentId: "att_tracked",
          phase: UploadPhase.UPLOADING,
          progress: 0.5,
        });
      });

      await waitFor(() => {
        expect(result.current.attachments[0]?.progress).toBe(0.5);
        expect(result.current.attachments[0]?.phase).toBe(UploadPhase.UPLOADING);
      });

      // Simulate progress event for untracked ID - should not affect state
      act(() => {
        mockProgressCallback?.({
          attachmentId: "att_untracked",
          phase: UploadPhase.UPLOADING,
          progress: 0.9,
        });
      });

      // Should still have only one attachment with original progress
      expect(result.current.attachments).toHaveLength(1);
      expect(result.current.attachments[0]?.attachmentId).toBe("att_tracked");
    });

    it("updates error state on failed upload", async () => {
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", fileSize: 1000 }],
      });
      mockEnqueue.mockResolvedValue({ attachmentId: "att_fail", queueItemId: "queue_1" });

      const { result } = renderHook(() => useAttachmentUpload());

      await act(async () => {
        await result.current.pickImage("camera");
      });

      // Simulate failure
      act(() => {
        mockProgressCallback?.({
          attachmentId: "att_fail",
          phase: UploadPhase.FAILED,
          progress: 0.3,
          error: "Upload failed: network error",
        });
      });

      await waitFor(() => {
        expect(result.current.attachments[0]?.phase).toBe(UploadPhase.FAILED);
        expect(result.current.attachments[0]?.error).toBe("Upload failed: network error");
      });
    });
  });

  describe("retryAttachment", () => {
    it("calls service with correct attachment ID", async () => {
      mockRetryItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAttachmentUpload());

      await act(async () => {
        await result.current.retryAttachment("att_retry_123");
      });

      expect(mockRetryItem).toHaveBeenCalledWith("att_retry_123");
    });
  });

  describe("removeAttachment", () => {
    it("cancels service item and removes from local state", async () => {
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", fileSize: 1000 }],
      });
      mockEnqueue.mockResolvedValue({ attachmentId: "att_remove", queueItemId: "queue_1" });
      mockCancelItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAttachmentUpload());

      // Add attachment
      await act(async () => {
        await result.current.pickImage("camera");
      });

      expect(result.current.attachments).toHaveLength(1);

      // Remove it
      await act(async () => {
        await result.current.removeAttachment("att_remove");
      });

      expect(mockCancelItem).toHaveBeenCalledWith("att_remove");
      expect(result.current.attachments).toHaveLength(0);
    });
  });

  describe("hasActiveUploads", () => {
    it("returns true when uploads are in progress", async () => {
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", fileSize: 1000 }],
      });
      mockEnqueue.mockResolvedValue({ attachmentId: "att_active", queueItemId: "queue_1" });

      const { result } = renderHook(() => useAttachmentUpload());

      await act(async () => {
        await result.current.pickImage("camera");
      });

      // Initial state is QUEUED, which counts as active
      expect(result.current.hasActiveUploads).toBe(true);

      // Simulate completion
      act(() => {
        mockProgressCallback?.({
          attachmentId: "att_active",
          phase: UploadPhase.COMPLETED,
          progress: 1,
        });
      });

      await waitFor(() => {
        expect(result.current.hasActiveUploads).toBe(false);
      });
    });
  });

  describe("getAttachmentIds", () => {
    it("returns all attachment IDs", async () => {
      mockLaunchCameraAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: "file:///photo1.jpg", fileName: "photo1.jpg", mimeType: "image/jpeg", fileSize: 1000 }],
      });
      mockLaunchCameraAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: "file:///photo2.jpg", fileName: "photo2.jpg", mimeType: "image/jpeg", fileSize: 2000 }],
      });
      mockEnqueue.mockResolvedValueOnce({ attachmentId: "att_1", queueItemId: "queue_1" });
      mockEnqueue.mockResolvedValueOnce({ attachmentId: "att_2", queueItemId: "queue_2" });

      const { result } = renderHook(() => useAttachmentUpload());

      await act(async () => {
        await result.current.pickImage("camera");
        await result.current.pickImage("camera");
      });

      expect(result.current.getAttachmentIds()).toEqual(["att_1", "att_2"]);
    });
  });

  describe("clearCompleted", () => {
    it("removes completed attachments from local state", async () => {
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", fileSize: 1000 }],
      });
      mockEnqueue.mockResolvedValue({ attachmentId: "att_completed", queueItemId: "queue_1" });

      const { result } = renderHook(() => useAttachmentUpload());

      await act(async () => {
        await result.current.pickImage("camera");
      });

      // Simulate completion
      act(() => {
        mockProgressCallback?.({
          attachmentId: "att_completed",
          phase: UploadPhase.COMPLETED,
          progress: 1,
        });
      });

      await waitFor(() => {
        expect(result.current.attachments[0]?.phase).toBe(UploadPhase.COMPLETED);
      });

      // Clear completed
      act(() => {
        result.current.clearCompleted();
      });

      expect(mockClearCompleted).toHaveBeenCalled();
      expect(result.current.attachments).toHaveLength(0);
    });

    it("keeps non-completed attachments when clearing completed", async () => {
      mockLaunchCameraAsync
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: "file:///photo1.jpg", fileName: "photo1.jpg", mimeType: "image/jpeg", fileSize: 1000 }],
        })
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: "file:///photo2.jpg", fileName: "photo2.jpg", mimeType: "image/jpeg", fileSize: 2000 }],
        });
      mockEnqueue
        .mockResolvedValueOnce({ attachmentId: "att_completed", queueItemId: "queue_1" })
        .mockResolvedValueOnce({ attachmentId: "att_pending", queueItemId: "queue_2" });

      const { result } = renderHook(() => useAttachmentUpload());

      await act(async () => {
        await result.current.pickImage("camera");
        await result.current.pickImage("camera");
      });

      // Mark first as completed
      act(() => {
        mockProgressCallback?.({
          attachmentId: "att_completed",
          phase: UploadPhase.COMPLETED,
          progress: 1,
        });
      });

      await waitFor(() => {
        expect(result.current.attachments).toHaveLength(2);
      });

      // Clear completed
      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.attachments).toHaveLength(1);
      expect(result.current.attachments[0]?.attachmentId).toBe("att_pending");
    });
  });

  describe("clearFailed", () => {
    it("removes failed attachments from local state", async () => {
      mockLaunchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{ uri: "file:///photo.jpg", fileName: "photo.jpg", mimeType: "image/jpeg", fileSize: 1000 }],
      });
      mockEnqueue.mockResolvedValue({ attachmentId: "att_failed", queueItemId: "queue_1" });

      const { result } = renderHook(() => useAttachmentUpload());

      await act(async () => {
        await result.current.pickImage("camera");
      });

      // Simulate failure
      act(() => {
        mockProgressCallback?.({
          attachmentId: "att_failed",
          phase: UploadPhase.FAILED,
          progress: 0,
          error: "Upload failed",
        });
      });

      await waitFor(() => {
        expect(result.current.attachments[0]?.phase).toBe(UploadPhase.FAILED);
      });

      // Clear failed
      act(() => {
        result.current.clearFailed();
      });

      expect(mockClearFailed).toHaveBeenCalled();
      expect(result.current.attachments).toHaveLength(0);
    });

    it("keeps non-failed attachments when clearing failed", async () => {
      mockLaunchCameraAsync
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: "file:///photo1.jpg", fileName: "photo1.jpg", mimeType: "image/jpeg", fileSize: 1000 }],
        })
        .mockResolvedValueOnce({
          canceled: false,
          assets: [{ uri: "file:///photo2.jpg", fileName: "photo2.jpg", mimeType: "image/jpeg", fileSize: 2000 }],
        });
      mockEnqueue
        .mockResolvedValueOnce({ attachmentId: "att_failed", queueItemId: "queue_1" })
        .mockResolvedValueOnce({ attachmentId: "att_pending", queueItemId: "queue_2" });

      const { result } = renderHook(() => useAttachmentUpload());

      await act(async () => {
        await result.current.pickImage("camera");
        await result.current.pickImage("camera");
      });

      // Mark first as failed
      act(() => {
        mockProgressCallback?.({
          attachmentId: "att_failed",
          phase: UploadPhase.FAILED,
          progress: 0,
          error: "Upload failed",
        });
      });

      await waitFor(() => {
        expect(result.current.attachments).toHaveLength(2);
      });

      // Clear failed
      act(() => {
        result.current.clearFailed();
      });

      expect(result.current.attachments).toHaveLength(1);
      expect(result.current.attachments[0]?.attachmentId).toBe("att_pending");
    });
  });
});
