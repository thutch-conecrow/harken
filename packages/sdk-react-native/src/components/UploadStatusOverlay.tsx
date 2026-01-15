import React from 'react';
import { View, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import { useHarkenTheme } from '../hooks';
import { ThemedText } from './ThemedText';
import { UploadPhase } from '../domain';

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
 * @example
 * ```tsx
 * <View style={styles.thumbnailContainer}>
 *   <Image source={{ uri }} style={styles.thumbnail} />
 *   <UploadStatusOverlay
 *     phase={attachment.phase}
 *     progress={attachment.progress}
 *     onRetry={() => retryAttachment(attachment.attachmentId)}
 *     onRemove={() => removeAttachment(attachment.attachmentId)}
 *   />
 * </View>
 * ```
 */
export function UploadStatusOverlay({
  phase,
  progress,
  error,
  onRetry,
  onRemove,
  style,
}: UploadStatusOverlayProps): React.JSX.Element | null {
  const theme = useHarkenTheme();

  // Completed state - just show a subtle checkmark
  if (phase === UploadPhase.COMPLETED) {
    return (
      <View style={[styles.overlay, styles.completedOverlay, style]}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.success,
              borderRadius: theme.radii.full,
            },
          ]}
        >
          <ThemedText style={styles.badgeIcon}>✓</ThemedText>
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
    return (
      <View
        style={[
          styles.overlay,
          styles.fullOverlay,
          { backgroundColor: 'rgba(0,0,0,0.7)' },
          style,
        ]}
      >
        <ThemedText style={styles.errorIcon}>⚠️</ThemedText>
        <ThemedText style={styles.errorText} numberOfLines={2}>
          {error ?? 'Upload failed'}
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
              <ThemedText style={styles.actionButtonText}>Retry</ThemedText>
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
              <ThemedText style={styles.actionButtonText}>Remove</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // Uploading state - show progress bar
  if (phase === UploadPhase.UPLOADING) {
    const progressPercent = Math.round(progress * 100);
    return (
      <View
        style={[
          styles.overlay,
          styles.fullOverlay,
          { backgroundColor: 'rgba(0,0,0,0.5)' },
          style,
        ]}
      >
        <ThemedText style={styles.progressText}>{progressPercent}%</ThemedText>
        <View
          style={[
            styles.progressBarContainer,
            {
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: theme.radii.sm,
            },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercent}%`,
                backgroundColor: theme.colors.primary,
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
                borderRadius: theme.radii.sm,
              },
            ]}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
        )}
      </View>
    );
  }

  // Confirming state - show spinner
  if (phase === UploadPhase.CONFIRMING) {
    return (
      <View
        style={[
          styles.overlay,
          styles.fullOverlay,
          { backgroundColor: 'rgba(0,0,0,0.5)' },
          style,
        ]}
      >
        <ActivityIndicator color="#fff" size="small" />
        <ThemedText style={styles.confirmingText}>Confirming...</ThemedText>
      </View>
    );
  }

  // Queued state - show waiting indicator
  if (phase === UploadPhase.QUEUED) {
    return (
      <View
        style={[
          styles.overlay,
          styles.fullOverlay,
          { backgroundColor: 'rgba(0,0,0,0.4)' },
          style,
        ]}
      >
        <ActivityIndicator color="#fff" size="small" />
        <ThemedText style={styles.queuedText}>Waiting...</ThemedText>
        {onRemove && (
          <Pressable
            onPress={onRemove}
            style={[
              styles.cancelButton,
              {
                borderRadius: theme.radii.sm,
              },
            ]}
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  completedOverlay: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 4,
  },
  badge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  removeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  removeIcon: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '80%',
    height: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  cancelButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cancelText: {
    color: '#fff',
    fontSize: 12,
  },
  confirmingText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  queuedText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  errorText: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
