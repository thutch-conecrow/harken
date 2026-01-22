/**
 * Hook for managing the attachment picker with smart source selection.
 *
 * Provides configurable attachment sources and automatically handles:
 * - Skipping the picker modal when only one source is enabled
 * - Warning when no sources are enabled
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useAttachmentUpload } from "./useAttachmentUpload";
import type { UseAttachmentUploadResult } from "./useAttachmentUpload";
import type { AttachmentPickerProps } from "../components/AttachmentPicker";

/**
 * Configuration for which attachment sources are enabled.
 */
export interface AttachmentSourceConfig {
  /** Enable camera source. @default true */
  camera?: boolean;
  /** Enable photo library source. @default true */
  library?: boolean;
  /** Enable file/document picker source. @default true */
  files?: boolean;
}

/**
 * Return type for useAttachmentPicker hook.
 */
export interface UseAttachmentPickerResult extends UseAttachmentUploadResult {
  /** Open the attachment picker (or directly invoke source if only one enabled) */
  openPicker: () => void;

  /** Whether the picker modal is visible */
  isPickerVisible: boolean;

  /** Close the picker modal */
  closePicker: () => void;

  /** Props to spread onto AttachmentPicker component */
  pickerProps: Pick<
    AttachmentPickerProps,
    "visible" | "onClose" | "onTakePhoto" | "onPickFromLibrary" | "onPickDocument" | "options"
  >;

  /** Which sources are enabled */
  enabledSources: {
    camera: boolean;
    library: boolean;
    files: boolean;
  };

  /** Count of enabled sources */
  enabledSourceCount: number;
}

/**
 * Hook for managing the attachment picker with smart source selection.
 *
 * When only one source is enabled, calling `openPicker()` will skip the modal
 * and directly open that source. When no sources are enabled, a warning is logged.
 *
 * @example
 * ```tsx
 * // Allow only photo library
 * const { openPicker, pickerProps, attachments } = useAttachmentPicker({
 *   camera: false,
 *   library: true,
 *   files: false,
 * });
 *
 * // openPicker() will directly open photo library without showing modal
 *
 * return (
 *   <>
 *     <Button onPress={openPicker} title="Add Photo" />
 *     <AttachmentPicker {...pickerProps} />
 *   </>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // With FeedbackSheet integration
 * const {
 *   openPicker,
 *   pickerProps,
 *   attachments,
 *   removeAttachment,
 *   retryAttachment,
 * } = useAttachmentPicker({
 *   camera: true,
 *   library: true,
 *   files: false, // Disable document picker
 * });
 * ```
 */
export function useAttachmentPicker(
  sourceConfig: AttachmentSourceConfig = {}
): UseAttachmentPickerResult {
  const {
    camera: cameraEnabled = true,
    library: libraryEnabled = true,
    files: filesEnabled = true,
  } = sourceConfig;

  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const uploadResult = useAttachmentUpload();
  const { pickImage, pickDocument } = uploadResult;

  // Calculate enabled sources
  const enabledSources = useMemo(
    () => ({
      camera: cameraEnabled,
      library: libraryEnabled,
      files: filesEnabled,
    }),
    [cameraEnabled, libraryEnabled, filesEnabled]
  );

  const enabledSourceCount = useMemo(() => {
    let count = 0;
    if (cameraEnabled) count++;
    if (libraryEnabled) count++;
    if (filesEnabled) count++;
    return count;
  }, [cameraEnabled, libraryEnabled, filesEnabled]);

  // Auto-close picker if sources change to 0 or 1 while visible
  // This prevents the iOS ActionSheet from showing with no/single options
  useEffect(() => {
    if (isPickerVisible && enabledSourceCount < 2) {
      setIsPickerVisible(false);
    }
  }, [isPickerVisible, enabledSourceCount]);

  // Handlers for each source
  const handleTakePhoto = useCallback(async () => {
    setIsPickerVisible(false);
    try {
      await pickImage("camera");
    } catch (e) {
      console.error("[Harken] Failed to take photo:", e);
    }
  }, [pickImage]);

  const handlePickFromLibrary = useCallback(async () => {
    setIsPickerVisible(false);
    try {
      await pickImage("library");
    } catch (e) {
      console.error("[Harken] Failed to pick from library:", e);
    }
  }, [pickImage]);

  const handlePickDocument = useCallback(async () => {
    setIsPickerVisible(false);
    try {
      await pickDocument();
    } catch (e) {
      console.error("[Harken] Failed to pick document:", e);
    }
  }, [pickDocument]);

  const closePicker = useCallback(() => {
    setIsPickerVisible(false);
  }, []);

  /**
   * Smart picker opener:
   * - 0 sources enabled: log warning, do nothing
   * - 1 source enabled: directly invoke that source
   * - 2+ sources enabled: show picker modal
   */
  const openPicker = useCallback(() => {
    if (enabledSourceCount === 0) {
      console.warn(
        "[Harken] useAttachmentPicker: No attachment sources are enabled. " +
          "Enable at least one of: camera, library, or files."
      );
      return;
    }

    if (enabledSourceCount === 1) {
      // Directly invoke the single enabled source
      if (cameraEnabled) {
        void handleTakePhoto();
      } else if (libraryEnabled) {
        void handlePickFromLibrary();
      } else if (filesEnabled) {
        void handlePickDocument();
      }
      return;
    }

    // Multiple sources enabled - show the picker
    setIsPickerVisible(true);
  }, [
    enabledSourceCount,
    cameraEnabled,
    libraryEnabled,
    filesEnabled,
    handleTakePhoto,
    handlePickFromLibrary,
    handlePickDocument,
  ]);

  // Build picker props with hidden options for disabled sources
  const pickerProps = useMemo(
    () => ({
      visible: isPickerVisible,
      onClose: closePicker,
      onTakePhoto: handleTakePhoto,
      onPickFromLibrary: handlePickFromLibrary,
      onPickDocument: handlePickDocument,
      options: {
        camera: { hidden: !cameraEnabled },
        library: { hidden: !libraryEnabled },
        document: { hidden: !filesEnabled },
      },
    }),
    [
      isPickerVisible,
      closePicker,
      handleTakePhoto,
      handlePickFromLibrary,
      handlePickDocument,
      cameraEnabled,
      libraryEnabled,
      filesEnabled,
    ]
  );

  return {
    ...uploadResult,
    openPicker,
    isPickerVisible,
    closePicker,
    pickerProps,
    enabledSources,
    enabledSourceCount,
  };
}
