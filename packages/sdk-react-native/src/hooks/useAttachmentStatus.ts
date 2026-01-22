/**
 * Hook for subscribing to a single attachment's upload status.
 *
 * Useful for components that display a single attachment with progress indicator.
 */

import { useState, useEffect } from "react";
import { uploadQueueService } from "../services";
import type { UploadPhase, UploadProgress } from "../domain";

/**
 * Status information for a single attachment.
 */
export interface AttachmentStatus {
  /** Current upload phase */
  phase: UploadPhase;
  /** Upload progress (0.0 - 1.0) */
  progress: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Hook to subscribe to a single attachment's upload status.
 *
 * Returns null if the attachment is not found in the queue.
 *
 * @param attachmentId - Server-assigned attachment ID
 * @returns Current status or null if not found
 *
 * @example
 * ```tsx
 * function AttachmentThumbnail({ attachmentId, uri }: Props) {
 *   const status = useAttachmentStatus(attachmentId);
 *
 *   if (!status) return null;
 *
 *   return (
 *     <View>
 *       <Image source={{ uri }} />
 *       {status.phase === 'uploading' && (
 *         <ProgressBar progress={status.progress} />
 *       )}
 *       {status.phase === 'failed' && (
 *         <Text>Error: {status.error}</Text>
 *       )}
 *       {status.phase === 'completed' && (
 *         <Icon name="checkmark" />
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */
export function useAttachmentStatus(attachmentId: string): AttachmentStatus | null {
  const [status, setStatus] = useState<AttachmentStatus | null>(() => {
    // Initialize with current state from queue
    const item = uploadQueueService.getItemByAttachmentId(attachmentId);
    if (!item) return null;
    return {
      phase: item.phase,
      progress: item.progress,
      error: item.lastError,
    };
  });

  useEffect(() => {
    const unsubscribe = uploadQueueService.onProgress((progress: UploadProgress) => {
      if (progress.attachmentId !== attachmentId) return;

      setStatus({
        phase: progress.phase,
        progress: progress.progress,
        error: progress.error,
      });
    });

    return unsubscribe;
  }, [attachmentId]);

  return status;
}
