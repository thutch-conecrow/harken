import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import type { ViewStyle, StyleProp, ImageStyle } from 'react-native';
import { useHarkenTheme } from '../hooks';
import { ThemedText } from './ThemedText';
import { AttachmentPreview } from './AttachmentPreview';
import type { AttachmentState } from '../hooks/useAttachmentUpload';
import type { UploadStatusLabels } from './UploadStatusOverlay';

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
  /** Label for the add button (default: "Add") */
  addButtonLabel?: string;
  /** Icon for the add button (default: "+") */
  addButtonIcon?: React.ReactNode | string;
  /** Style for the add button */
  addButtonStyle?: StyleProp<ViewStyle>;
  /** Text to show when empty and no add button (default: "No attachments") */
  emptyText?: string;
  /** Custom renderer for the add button */
  renderAddButton?: (onPress: () => void, disabled: boolean) => React.ReactNode;
  /** Custom renderer for each attachment tile */
  renderTile?: (
    attachment: AttachmentState,
    onRetry?: () => void,
    onRemove?: () => void
  ) => React.ReactNode;
  /** Style for each tile container */
  tileStyle?: StyleProp<ViewStyle>;
  /** Style for tile images */
  tileImageStyle?: StyleProp<ImageStyle>;
  /** Custom labels for upload status overlay */
  statusLabels?: UploadStatusLabels;
  /** Custom file icon function (passed to AttachmentPreview) */
  getFileIcon?: (mimeType: string) => React.ReactNode | string;
  /** Custom placeholder renderer (passed to AttachmentPreview) */
  renderPlaceholder?: (mimeType: string, fileName?: string) => React.ReactNode;
}

/**
 * Grid component for displaying multiple attachments.
 *
 * Shows attachment previews with upload status and an optional add button.
 *
 * Uses the following theme tokens:
 * - `colors.addButton*` for add button colors
 * - `spacing.tileGap` for gap between tiles
 * - `radii.tile` for tile border radius
 * - `sizing.tileSize` for default tile size
 * - `sizing.addButtonIconSize` for add icon size
 * - `opacity.disabled` for disabled state
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { attachments, pickImage, retryAttachment, removeAttachment } = useAttachmentUpload();
 *
 * <AttachmentGrid
 *   attachments={attachments}
 *   onRetry={retryAttachment}
 *   onRemove={removeAttachment}
 *   onAdd={() => pickImage('library')}
 *   maxAttachments={5}
 * />
 *
 * // With custom add button
 * <AttachmentGrid
 *   attachments={attachments}
 *   onAdd={showPicker}
 *   addButtonIcon={<PlusIcon />}
 *   addButtonLabel="Upload"
 *   addButtonStyle={{ borderColor: 'blue' }}
 * />
 *
 * // With fully custom renderers
 * <AttachmentGrid
 *   attachments={attachments}
 *   renderAddButton={(onPress, disabled) => (
 *     <MyButton onPress={onPress} disabled={disabled}>Add File</MyButton>
 *   )}
 *   renderTile={(attachment, onRetry, onRemove) => (
 *     <MyTile
 *       key={attachment.attachmentId}
 *       {...attachment}
 *       onRetry={onRetry}
 *       onRemove={onRemove}
 *     />
 *   )}
 * />
 * ```
 */
export function AttachmentGrid({
  attachments,
  onRetry,
  onRemove,
  onAdd,
  maxAttachments = 10,
  tileSize,
  gap,
  showAddButton = true,
  disabled = false,
  style,
  addButtonLabel = 'Add',
  addButtonIcon = '+',
  addButtonStyle,
  emptyText = 'No attachments',
  renderAddButton,
  renderTile,
  tileStyle,
  tileImageStyle,
  statusLabels,
  getFileIcon,
  renderPlaceholder,
}: AttachmentGridProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const { tile, addButton } = theme.components;

  const effectiveTileSize = tileSize ?? tile.size;
  const effectiveGap = gap ?? tile.gap;

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
      {attachments.map((attachment) => {
        const handleRetry = onRetry ? () => onRetry(attachment.attachmentId) : undefined;
        const handleRemove = onRemove ? () => onRemove(attachment.attachmentId) : undefined;

        // Use custom renderer if provided
        if (renderTile) {
          return (
            <React.Fragment key={attachment.attachmentId}>
              {renderTile(attachment, handleRetry, handleRemove)}
            </React.Fragment>
          );
        }

        return (
          <AttachmentPreview
            key={attachment.attachmentId}
            uri={attachment.localUri}
            mimeType={attachment.mimeType}
            fileName={attachment.fileName}
            phase={attachment.phase}
            progress={attachment.progress}
            error={attachment.error}
            onRetry={handleRetry}
            onRemove={handleRemove}
            size={effectiveTileSize}
            style={tileStyle}
            imageStyle={tileImageStyle}
            statusLabels={statusLabels}
            getFileIcon={getFileIcon}
            renderPlaceholder={renderPlaceholder}
          />
        );
      })}

      {shouldShowAddButton && (
        renderAddButton ? (
          renderAddButton(onAdd, disabled)
        ) : (
          <Pressable
            onPress={onAdd}
            disabled={disabled}
            style={({ pressed }) => [
              styles.addButton,
              {
                width: effectiveTileSize,
                height: effectiveTileSize,
                borderRadius: tile.radius,
                backgroundColor: pressed
                  ? addButton.backgroundPressed
                  : addButton.background,
                borderWidth: 2,
                borderColor: addButton.border,
                borderStyle: 'dashed',
                opacity: disabled ? theme.opacity.disabled : 1,
              },
              addButtonStyle,
            ]}
          >
            {typeof addButtonIcon === 'string' ? (
              <ThemedText
                style={[
                  styles.addIcon,
                  {
                    color: addButton.icon,
                    fontSize: addButton.iconSize,
                    lineHeight: addButton.iconSize * 1.15, // Scale lineHeight with iconSize
                  },
                ]}
              >
                {addButtonIcon}
              </ThemedText>
            ) : (
              addButtonIcon
            )}
            <ThemedText
              variant="caption"
              color={addButton.text}
            >
              {addButtonLabel}
            </ThemedText>
          </Pressable>
        )
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
            {emptyText}
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
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
  },
});
