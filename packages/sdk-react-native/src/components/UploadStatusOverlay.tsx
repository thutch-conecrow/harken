import React from "react";
import { View, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import type { ViewStyle, StyleProp } from "react-native";
import { useHarkenTheme } from "../hooks";
import { ThemedText } from "./ThemedText";
import { UploadPhase } from "../domain";

/**
 * Customizable labels for upload status states.
 */
export interface UploadStatusLabels {
  /** Label for retry button (default: "Retry") */
  retry?: string;
  /** Label for remove/cancel button (default: "Remove") */
  remove?: string;
  /** Label for cancel during upload (default: "Cancel") */
  cancel?: string;
  /** Label while confirming (default: "Confirming...") */
  confirming?: string;
  /** Label while queued (default: "Waiting...") */
  waiting?: string;
  /** Default error message (default: "Upload failed") */
  uploadFailed?: string;
}

export interface UploadStatusOverlayProps {
  /** Current upload phase */
  phase: UploadPhase;
  /** Upload progress (0.0 - 1.0) */
  progress: number;
  /** Error message if failed */
  error?: string;
  /** Callback when retry is pressed */
  onRetry?: () => void;
  /** Callback when remove/cancel is pressed */
  onRemove?: () => void;
  /** Additional container style */
  style?: StyleProp<ViewStyle>;
  /** Custom labels for status text */
  labels?: UploadStatusLabels;
  /** Custom progress renderer */
  renderProgress?: (progress: number) => React.ReactNode;
  /** Custom error renderer */
  renderError?: (error: string, onRetry?: () => void, onRemove?: () => void) => React.ReactNode;
  /** Custom success/completed renderer */
  renderSuccess?: (onRemove?: () => void) => React.ReactNode;
}

/**
 * Overlay component showing upload status on attachments.
 *
 * Shows:
 * - Progress bar during upload
 * - Spinner during confirmation
 * - Checkmark when complete
 * - Error with retry button when failed
 *
 * Uses the following theme tokens:
 * - `colors.uploadOverlay` for overlay background
 * - `colors.uploadOverlayError` for error overlay background
 * - `colors.uploadProgressTrack` for progress bar track
 * - `colors.uploadProgressFill` for progress bar fill
 * - `colors.uploadBadgeSuccess` for success badge
 * - `colors.uploadText` for overlay text
 *
 * @example
 * ```tsx
 * // Basic usage
 * <UploadStatusOverlay
 *   phase={attachment.phase}
 *   progress={attachment.progress}
 *   onRetry={() => retryAttachment(attachment.attachmentId)}
 *   onRemove={() => removeAttachment(attachment.attachmentId)}
 * />
 *
 * // With custom labels
 * <UploadStatusOverlay
 *   phase={phase}
 *   progress={progress}
 *   labels={{
 *     retry: 'Try Again',
 *     remove: 'Delete',
 *     confirming: 'Processing...',
 *   }}
 * />
 *
 * // With custom progress renderer
 * <UploadStatusOverlay
 *   phase={phase}
 *   progress={progress}
 *   renderProgress={(p) => <CustomProgressBar value={p} />}
 * />
 * ```
 */
export function UploadStatusOverlay({
  phase,
  progress,
  error,
  onRetry,
  onRemove,
  style,
  labels,
  renderProgress,
  renderError,
  renderSuccess,
}: UploadStatusOverlayProps): React.JSX.Element | null {
  const theme = useHarkenTheme();
  const { upload } = theme.components;

  // Merge labels with defaults
  const resolvedLabels: Required<UploadStatusLabels> = {
    retry: labels?.retry ?? "Retry",
    remove: labels?.remove ?? "Remove",
    cancel: labels?.cancel ?? "Cancel",
    confirming: labels?.confirming ?? "Confirming...",
    waiting: labels?.waiting ?? "Waiting...",
    uploadFailed: labels?.uploadFailed ?? "Upload failed",
  };

  // Completed state - just show a subtle checkmark
  if (phase === UploadPhase.COMPLETED) {
    if (renderSuccess) {
      return <View style={[styles.overlay, style]}>{renderSuccess(onRemove)}</View>;
    }

    return (
      <View style={[styles.overlay, styles.completedOverlay, style]}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: upload.badgeSuccess,
              borderRadius: theme.radii.full,
            },
          ]}
        >
          <ThemedText style={[styles.badgeIcon, { color: upload.text }]}>✓</ThemedText>
        </View>
        {onRemove && (
          <Pressable
            onPress={onRemove}
            style={[
              styles.removeButton,
              {
                backgroundColor: theme.colors.background,
                borderRadius: theme.radii.full,
              },
            ]}
          >
            <ThemedText style={styles.removeIcon}>×</ThemedText>
          </Pressable>
        )}
      </View>
    );
  }

  // Failed state - show error and retry
  if (phase === UploadPhase.FAILED) {
    const errorMessage = error ?? resolvedLabels.uploadFailed;

    if (renderError) {
      return (
        <View style={[styles.overlay, style]}>{renderError(errorMessage, onRetry, onRemove)}</View>
      );
    }

    return (
      <View
        style={[
          styles.overlay,
          styles.fullOverlay,
          { backgroundColor: upload.overlayError },
          style,
        ]}
      >
        <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
        <ThemedText style={[styles.errorText, { color: upload.text }]} numberOfLines={2}>
          {errorMessage}
        </ThemedText>
        <View style={styles.buttonRow}>
          {onRetry && (
            <Pressable
              onPress={onRetry}
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radii.sm,
                },
              ]}
            >
              <ThemedText style={[styles.actionButtonText, { color: upload.text }]}>
                {resolvedLabels.retry}
              </ThemedText>
            </Pressable>
          )}
          {onRemove && (
            <Pressable
              onPress={onRemove}
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.error,
                  borderRadius: theme.radii.sm,
                },
              ]}
            >
              <ThemedText style={[styles.actionButtonText, { color: upload.text }]}>
                {resolvedLabels.remove}
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // Uploading state - show progress bar
  if (phase === UploadPhase.UPLOADING) {
    const progressPercent = Math.round(progress * 100);

    if (renderProgress) {
      return (
        <View
          style={[styles.overlay, styles.fullOverlay, { backgroundColor: upload.overlay }, style]}
        >
          {renderProgress(progress)}
        </View>
      );
    }

    return (
      <View
        style={[styles.overlay, styles.fullOverlay, { backgroundColor: upload.overlay }, style]}
      >
        <ThemedText style={[styles.progressText, { color: upload.text }]}>
          {progressPercent}%
        </ThemedText>
        <View
          style={[
            styles.progressBarContainer,
            {
              backgroundColor: upload.progressTrack,
              borderRadius: theme.radii.sm,
            },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: upload.progressFill,
                borderRadius: theme.radii.sm,
              },
            ]}
          />
        </View>
        {onRemove && (
          <Pressable
            onPress={onRemove}
            style={[
              styles.cancelButton,
              {
                backgroundColor: upload.progressTrack,
                borderRadius: theme.radii.sm,
              },
            ]}
          >
            <ThemedText style={[styles.cancelText, { color: upload.text }]}>
              {resolvedLabels.cancel}
            </ThemedText>
          </Pressable>
        )}
      </View>
    );
  }

  // Confirming state - show spinner
  if (phase === UploadPhase.CONFIRMING) {
    return (
      <View
        style={[styles.overlay, styles.fullOverlay, { backgroundColor: upload.overlay }, style]}
      >
        <ActivityIndicator color={upload.text} size="small" />
        <ThemedText style={[styles.confirmingText, { color: upload.text }]}>
          {resolvedLabels.confirming}
        </ThemedText>
      </View>
    );
  }

  // Queued state - show waiting indicator
  if (phase === UploadPhase.QUEUED) {
    return (
      <View
        style={[styles.overlay, styles.fullOverlay, { backgroundColor: upload.overlay }, style]}
      >
        <ActivityIndicator color={upload.text} size="small" />
        <ThemedText style={[styles.queuedText, { color: upload.text }]}>
          {resolvedLabels.waiting}
        </ThemedText>
        {onRemove && (
          <Pressable
            onPress={onRemove}
            style={[
              styles.cancelButton,
              {
                backgroundColor: upload.progressTrack,
                borderRadius: theme.radii.sm,
              },
            ]}
          >
            <ThemedText style={[styles.cancelText, { color: upload.text }]}>
              {resolvedLabels.cancel}
            </ThemedText>
          </Pressable>
        )}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fullOverlay: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  completedOverlay: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexDirection: "row",
    padding: 4,
  },
  badge: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIcon: {
    fontSize: 14,
    fontWeight: "700",
  },
  removeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  removeIcon: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBarContainer: {
    width: "80%",
    height: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
  },
  cancelButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 12,
  },
  confirmingText: {
    fontSize: 12,
    marginTop: 4,
  },
  queuedText: {
    fontSize: 12,
    marginTop: 4,
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
