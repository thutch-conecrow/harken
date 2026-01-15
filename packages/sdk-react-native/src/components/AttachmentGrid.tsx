import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import { useHarkenTheme } from '../hooks';
import { ThemedText } from './ThemedText';
import { AttachmentPreview } from './AttachmentPreview';
import type { AttachmentState } from '../hooks/useAttachmentUpload';

export interface AttachmentGridProps {
  /** List of attachments to display */
  attachments: AttachmentState[];
  /** Callback to retry a failed attachment */
  onRetry?: (attachmentId: string) => void;
  /** Callback to remove an attachment */
  onRemove?: (attachmentId: string) => void;
  /** Callback when add button is pressed */
  onAdd?: () => void;
  /** Maximum number of attachments allowed (hides add button when reached) */
  maxAttachments?: number;
  /** Size of each preview tile */
  tileSize?: number;
  /** Gap between tiles */
  gap?: number;
  /** Whether to show the add button */
  showAddButton?: boolean;
  /** Disable interactions */
  disabled?: boolean;
  /** Additional container style */
  style?: StyleProp<ViewStyle>;
}

/**
 * Grid component for displaying multiple attachments.
 *
 * Shows attachment previews with upload status and an optional add button.
 *
 * @example
 * ```tsx
 * const { attachments, pickImage, retryAttachment, removeAttachment } = useAttachmentUpload();
 *
 * <AttachmentGrid
 *   attachments={attachments}
 *   onRetry={retryAttachment}
 *   onRemove={removeAttachment}
 *   onAdd={() => pickImage('library')}
 *   maxAttachments={5}
 * />
 * ```
 */
export function AttachmentGrid({
  attachments,
  onRetry,
  onRemove,
  onAdd,
  maxAttachments = 10,
  tileSize = 80,
  gap,
  showAddButton = true,
  disabled = false,
  style,
}: AttachmentGridProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const effectiveGap = gap ?? theme.spacing.sm;

  const canAddMore = attachments.length < maxAttachments;
  const shouldShowAddButton = showAddButton && canAddMore && onAdd;

  return (
    <View
      style={[
        styles.container,
        { gap: effectiveGap },
        style,
      ]}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.attachmentId}
          uri={attachment.localUri}
          mimeType={attachment.mimeType}
          fileName={attachment.fileName}
          phase={attachment.phase}
          progress={attachment.progress}
          error={attachment.error}
          onRetry={onRetry ? () => onRetry(attachment.attachmentId) : undefined}
          onRemove={onRemove ? () => onRemove(attachment.attachmentId) : undefined}
          size={tileSize}
        />
      ))}

      {shouldShowAddButton && (
        <Pressable
          onPress={onAdd}
          disabled={disabled}
          style={({ pressed }) => [
            styles.addButton,
            {
              width: tileSize,
              height: tileSize,
              borderRadius: theme.radii.md,
              backgroundColor: pressed
                ? theme.colors.border
                : theme.colors.backgroundSecondary,
              borderWidth: 2,
              borderColor: theme.colors.border,
              borderStyle: 'dashed',
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <ThemedText style={[styles.addIcon, { color: theme.colors.textSecondary }]}>
            +
          </ThemedText>
          <ThemedText variant="caption" secondary>
            Add
          </ThemedText>
        </Pressable>
      )}

      {attachments.length === 0 && !shouldShowAddButton && (
        <View
          style={[
            styles.emptyState,
            {
              padding: theme.spacing.md,
            },
          ]}
        >
          <ThemedText variant="caption" secondary>
            No attachments
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
});
