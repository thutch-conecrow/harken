/**
 * Hook for managing attachment uploads.
 *
 * Provides methods for picking images/documents and tracking upload progress.
 * Uploads happen in background via the singleton uploadQueueService.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { uploadQueueService } from '../services';
import { UploadPhase, UploadProgress } from '../domain';

/**
 * State for a single attachment.
 */
export interface AttachmentState {
  /** Server-assigned attachment ID */
  attachmentId: string;
  /** Local file URI for preview */
  localUri: string;
  /** Original filename */
  fileName: string;
  /** MIME type */
  mimeType: string;
  /** Current upload phase */
  phase: UploadPhase;
  /** Upload progress (0.0 - 1.0) */
  progress: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Return type for useAttachmentUpload hook.
 */
export interface UseAttachmentUploadResult {
  /** All current attachments */
  attachments: AttachmentState[];

  /** Pick image from camera or library */
  pickImage: (source: 'camera' | 'library') => Promise<AttachmentState | null>;

  /** Pick document (images or PDFs) */
  pickDocument: () => Promise<AttachmentState | null>;

  /** Add attachment from existing local URI */
  addAttachment: (params: {
    uri: string;
    mimeType: string;
    fileName: string;
    fileSize: number;
  }) => Promise<AttachmentState>;

  /** Retry a failed upload */
  retryAttachment: (attachmentId: string) => Promise<void>;

  /** Remove attachment (cancels if uploading) */
  removeAttachment: (attachmentId: string) => Promise<void>;

  /** Get all attachment IDs for feedback submission */
  getAttachmentIds: () => string[];

  /** True if any uploads are in progress */
  hasActiveUploads: boolean;

  /** Clear all completed attachments */
  clearCompleted: () => void;

  /** Clear all failed attachments */
  clearFailed: () => void;
}

/**
 * Hook for managing attachment uploads with background support.
 *
 * @example
 * ```tsx
 * function FeedbackForm() {
 *   const {
 *     attachments,
 *     pickImage,
 *     removeAttachment,
 *     getAttachmentIds,
 *     hasActiveUploads,
 *   } = useAttachmentUpload();
 *
 *   const handleAddPhoto = async () => {
 *     await pickImage('library');
 *   };
 *
 *   const handleSubmit = async () => {
 *     // Can submit even if uploads are still in progress!
 *     await submitFeedback({
 *       message: 'Bug report',
 *       attachmentIds: getAttachmentIds(),
 *     });
 *   };
 *
 *   return (
 *     <View>
 *       {attachments.map(att => (
 *         <AttachmentPreview
 *           key={att.attachmentId}
 *           uri={att.localUri}
 *           progress={att.progress}
 *           phase={att.phase}
 *         />
 *       ))}
 *       <Button onPress={handleAddPhoto} title="Add Photo" />
 *       <Button onPress={handleSubmit} title="Submit" />
 *     </View>
 *   );
 * }
 * ```
 */
export function useAttachmentUpload(): UseAttachmentUploadResult {
  const [attachments, setAttachments] = useState<Map<string, AttachmentState>>(
    new Map()
  );

  // Track which attachment IDs this hook instance is managing
  const attachmentIdsRef = useRef<Set<string>>(new Set());

  // Subscribe to progress updates from the queue service
  useEffect(() => {
    const unsubProgress = uploadQueueService.onProgress(
      (progress: UploadProgress) => {
        // Only track attachments we added
        if (!attachmentIdsRef.current.has(progress.attachmentId)) return;

        setAttachments((prev) => {
          const existing = prev.get(progress.attachmentId);
          if (!existing) return prev;

          const next = new Map(prev);
          next.set(progress.attachmentId, {
            ...existing,
            phase: progress.phase,
            progress: progress.progress,
            error: progress.error,
          });
          return next;
        });
      }
    );

    return () => {
      unsubProgress();
    };
  }, []);

  /**
   * Add an attachment from a local URI.
   */
  const addAttachment = useCallback(
    async (params: {
      uri: string;
      mimeType: string;
      fileName: string;
      fileSize: number;
    }): Promise<AttachmentState> => {
      const { attachmentId } = await uploadQueueService.enqueue({
        localUri: params.uri,
        mimeType: params.mimeType,
        fileName: params.fileName,
        fileSize: params.fileSize,
      });

      const state: AttachmentState = {
        attachmentId,
        localUri: params.uri,
        fileName: params.fileName,
        mimeType: params.mimeType,
        phase: UploadPhase.QUEUED,
        progress: 0,
      };

      attachmentIdsRef.current.add(attachmentId);
      setAttachments((prev) => new Map(prev).set(attachmentId, state));

      return state;
    },
    []
  );

  /**
   * Pick an image from camera or photo library.
   */
  const pickImage = useCallback(
    async (source: 'camera' | 'library'): Promise<AttachmentState | null> => {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const asset = result.assets[0];
      const fileName = asset.fileName ?? `image_${Date.now()}.jpg`;
      const mimeType = asset.mimeType ?? 'image/jpeg';

      // Get file size - use asset.fileSize if available, otherwise query filesystem
      let fileSize = asset.fileSize;
      if (fileSize === undefined || fileSize === null) {
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        fileSize = fileInfo.exists && fileInfo.size ? fileInfo.size : 0;
      }

      return addAttachment({
        uri: asset.uri,
        mimeType,
        fileName,
        fileSize,
      });
    },
    [addAttachment]
  );

  /**
   * Pick a document (images or PDFs).
   */
  const pickDocument = useCallback(async (): Promise<AttachmentState | null> => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];

    // Get file size - use asset.size if available, otherwise query filesystem
    let fileSize = asset.size;
    if (fileSize === undefined || fileSize === null) {
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      fileSize = fileInfo.exists && fileInfo.size ? fileInfo.size : 0;
    }

    return addAttachment({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'application/octet-stream',
      fileName: asset.name,
      fileSize,
    });
  }, [addAttachment]);

  /**
   * Retry a failed attachment upload.
   */
  const retryAttachment = useCallback(
    async (attachmentId: string): Promise<void> => {
      await uploadQueueService.retryItem(attachmentId);
    },
    []
  );

  /**
   * Remove an attachment (cancels upload if in progress).
   */
  const removeAttachment = useCallback(
    async (attachmentId: string): Promise<void> => {
      await uploadQueueService.cancelItem(attachmentId);
      attachmentIdsRef.current.delete(attachmentId);
      setAttachments((prev) => {
        const next = new Map(prev);
        next.delete(attachmentId);
        return next;
      });
    },
    []
  );

  /**
   * Get all attachment IDs for feedback submission.
   */
  const getAttachmentIds = useCallback((): string[] => {
    return Array.from(attachments.values()).map((a) => a.attachmentId);
  }, [attachments]);

  /**
   * Clear all completed attachments from both local state and queue service.
   */
  const clearCompleted = useCallback((): void => {
    // Clear from queue service (persisted storage)
    void uploadQueueService.clearCompleted();

    // Clear from local state
    setAttachments((prev) => {
      const next = new Map<string, AttachmentState>();
      for (const [id, att] of prev) {
        if (att.phase !== UploadPhase.COMPLETED) {
          next.set(id, att);
        } else {
          attachmentIdsRef.current.delete(id);
        }
      }
      return next;
    });
  }, []);

  /**
   * Clear all failed attachments from both local state and queue service.
   */
  const clearFailed = useCallback((): void => {
    // Clear from queue service (persisted storage)
    void uploadQueueService.clearFailed();

    // Clear from local state
    setAttachments((prev) => {
      const next = new Map<string, AttachmentState>();
      for (const [id, att] of prev) {
        if (att.phase !== UploadPhase.FAILED) {
          next.set(id, att);
        } else {
          attachmentIdsRef.current.delete(id);
        }
      }
      return next;
    });
  }, []);

  // Compute whether any uploads are in progress
  const hasActiveUploads = Array.from(attachments.values()).some(
    (a) =>
      a.phase === UploadPhase.QUEUED ||
      a.phase === UploadPhase.UPLOADING ||
      a.phase === UploadPhase.CONFIRMING
  );

  return {
    attachments: Array.from(attachments.values()),
    pickImage,
    pickDocument,
    addAttachment,
    retryAttachment,
    removeAttachment,
    getAttachmentIds,
    hasActiveUploads,
    clearCompleted,
    clearFailed,
  };
}
