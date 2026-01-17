import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import type { ViewStyle, StyleProp, ImageStyle } from 'react-native';
import { useHarkenTheme } from '../hooks';
import { ThemedText } from './ThemedText';
import { UploadStatusOverlay } from './UploadStatusOverlay';
import type { UploadStatusLabels } from './UploadStatusOverlay';
import { UploadPhase } from '../domain';

export interface AttachmentPreviewProps {
  /** Local file URI for preview */
  uri: string;
  /** MIME type of the file */
  mimeType?: string;
  /** File name (shown for non-image files) */
  fileName?: string;
  /** Current upload phase */
  phase: UploadPhase;
  /** Upload progress (0.0 - 1.0) */
  progress: number;
  /** Error message if failed */
  error?: string;
  /** Callback when retry is pressed */
  onRetry?: () => void;
  /** Callback when remove is pressed */
  onRemove?: () => void;
  /** Size of the preview */
  size?: number;
  /** Additional container style */
  style?: StyleProp<ViewStyle>;
  /** Additional image style */
  imageStyle?: StyleProp<ImageStyle>;
  /** Custom renderer for non-image file placeholders */
  renderPlaceholder?: (mimeType: string, fileName?: string) => React.ReactNode;
  /** Custom file icon function (returns string emoji or React node) */
  getFileIcon?: (mimeType: string) => React.ReactNode | string;
  /** Custom labels for upload status overlay */
  statusLabels?: UploadStatusLabels;
}

/**
 * Preview component for a single attachment with upload status.
 *
 * Shows image thumbnail for images, file icon for other types.
 * Includes upload status overlay with progress/retry/remove actions.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AttachmentPreview
 *   uri={attachment.localUri}
 *   mimeType={attachment.mimeType}
 *   phase={attachment.phase}
 *   progress={attachment.progress}
 *   onRetry={() => retryAttachment(attachment.attachmentId)}
 *   onRemove={() => removeAttachment(attachment.attachmentId)}
 * />
 *
 * // With custom file icon
 * <AttachmentPreview
 *   uri={attachment.localUri}
 *   mimeType={attachment.mimeType}
 *   phase={attachment.phase}
 *   progress={attachment.progress}
 *   getFileIcon={(mime) => {
 *     if (mime === 'application/pdf') return <PdfIcon />;
 *     return '📄';
 *   }}
 * />
 *
 * // With custom placeholder
 * <AttachmentPreview
 *   uri={attachment.localUri}
 *   mimeType={attachment.mimeType}
 *   phase={attachment.phase}
 *   progress={attachment.progress}
 *   renderPlaceholder={(mime, name) => (
 *     <MyCustomPlaceholder mimeType={mime} fileName={name} />
 *   )}
 * />
 * ```
 */
export function AttachmentPreview({
  uri,
  mimeType,
  fileName,
  phase,
  progress,
  error,
  onRetry,
  onRemove,
  size = 80,
  style,
  imageStyle,
  renderPlaceholder,
  getFileIcon: customGetFileIcon,
  statusLabels,
}: AttachmentPreviewProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const isImage = mimeType?.startsWith('image/') ?? true;

  const renderFileContent = () => {
    if (renderPlaceholder && mimeType) {
      return renderPlaceholder(mimeType, fileName);
    }

    const icon = customGetFileIcon
      ? customGetFileIcon(mimeType ?? '')
      : getDefaultFileIcon(mimeType);

    return (
      <View style={styles.filePreview}>
        {typeof icon === 'string' ? (
          <ThemedText style={styles.fileIcon}>{icon}</ThemedText>
        ) : (
          icon
        )}
        {fileName && (
          <ThemedText
            variant="caption"
            secondary
            numberOfLines={2}
            style={styles.fileName}
          >
            {fileName}
          </ThemedText>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {isImage ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size }, imageStyle]}
          resizeMode="cover"
        />
      ) : (
        renderFileContent()
      )}

      <UploadStatusOverlay
        phase={phase}
        progress={progress}
        error={error}
        onRetry={onRetry}
        onRemove={onRemove}
        labels={statusLabels}
      />
    </View>
  );
}

/**
 * Get default file icon emoji based on MIME type.
 */
function getDefaultFileIcon(mimeType?: string): string {
  if (!mimeType) return '📄';

  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return '📊';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';

  return '📄';
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#f0f0f0',
  },
  filePreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  fileIcon: {
    fontSize: 28,
  },
  fileName: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 10,
  },
});
