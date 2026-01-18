import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Pressable,
  Dimensions,
  Platform,
  ActionSheetIOS,
  StyleSheet,
} from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHarkenTheme } from '../hooks';
import { ThemedText } from './ThemedText';

export type AttachmentSource = 'camera' | 'library' | 'document';

/**
 * Configuration for a single picker option.
 */
export interface PickerOptionConfig {
  /** Custom label text */
  label?: string;
  /** Custom description text */
  description?: string;
  /** Icon background color (defaults to theme accent colors) */
  color?: string;
  /** Custom icon element (replaces default) */
  icon?: React.ReactNode;
  /** Hide this option entirely */
  hidden?: boolean;
}

export interface AttachmentPickerProps {
  /** Whether the picker is visible */
  visible: boolean;
  /** Callback when picker is closed */
  onClose: () => void;
  /** Callback when camera is selected */
  onTakePhoto: () => void;
  /** Callback when photo library is selected */
  onPickFromLibrary: () => void;
  /** Callback when document picker is selected */
  onPickDocument: () => void;
  /** Title shown in the picker */
  title?: string;
  /**
   * Custom render function for option icons.
   * @deprecated Use `options.camera.icon` etc. instead
   */
  renderIcon?: (source: AttachmentSource) => React.ReactNode;
  /** Customize individual picker options */
  options?: {
    camera?: PickerOptionConfig;
    library?: PickerOptionConfig;
    document?: PickerOptionConfig;
  };
  /** Cancel button label */
  cancelLabel?: string;
  /** Overlay background color */
  overlayColor?: string;
  /** Bottom sheet corner radius */
  sheetRadius?: number;
  /** Additional style for bottom sheet container */
  sheetStyle?: StyleProp<ViewStyle>;
  /** Additional style for option rows */
  optionStyle?: StyleProp<ViewStyle>;
}

interface PickerOption {
  key: AttachmentSource;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  action: () => void;
  hidden: boolean;
}

/**
 * Platform-appropriate attachment source picker.
 *
 * - **iOS**: Uses native `ActionSheetIOS` for platform-native experience
 * - **Android**: Uses a bottom sheet modal with styled options
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AttachmentPicker
 *   visible={showPicker}
 *   onClose={() => setShowPicker(false)}
 *   onTakePhoto={() => pickImage('camera')}
 *   onPickFromLibrary={() => pickImage('library')}
 *   onPickDocument={() => pickDocument()}
 * />
 *
 * // With customization
 * <AttachmentPicker
 *   visible={showPicker}
 *   onClose={() => setShowPicker(false)}
 *   onTakePhoto={() => pickImage('camera')}
 *   onPickFromLibrary={() => pickImage('library')}
 *   onPickDocument={() => pickDocument()}
 *   title="Attach File"
 *   cancelLabel="Dismiss"
 *   options={{
 *     camera: {
 *       label: 'Take Photo',
 *       icon: <CameraIcon />,
 *       color: '#007AFF',
 *     },
 *     library: {
 *       label: 'Choose Photo',
 *       icon: <PhotoIcon />,
 *     },
 *     document: {
 *       hidden: true, // Hide files option
 *     },
 *   }}
 * />
 * ```
 */
export function AttachmentPicker({
  visible,
  onClose,
  onTakePhoto,
  onPickFromLibrary,
  onPickDocument,
  title = 'Add Attachment',
  renderIcon,
  options: optionOverrides,
  cancelLabel = 'Cancel',
  overlayColor,
  sheetRadius,
  sheetStyle,
  optionStyle,
}: AttachmentPickerProps): React.JSX.Element | null {
  const theme = useHarkenTheme();
  const screenHeight = Dimensions.get('window').height;

  // Prevent double-triggering ActionSheetIOS if callbacks change
  const isShowingRef = useRef(false);

  // Build options with defaults and overrides
  const options: PickerOption[] = [
    {
      key: 'camera',
      label: optionOverrides?.camera?.label ?? 'Camera',
      description: optionOverrides?.camera?.description ?? 'Take a new photo',
      color: optionOverrides?.camera?.color ?? theme.colors.accent1,
      icon:
        optionOverrides?.camera?.icon ??
        (renderIcon ? renderIcon('camera') : <DefaultIcon emoji="📷" />),
      action: onTakePhoto,
      hidden: optionOverrides?.camera?.hidden ?? false,
    },
    {
      key: 'library',
      label: optionOverrides?.library?.label ?? 'Photo Library',
      description:
        optionOverrides?.library?.description ?? 'Choose from existing photos',
      color: optionOverrides?.library?.color ?? theme.colors.accent2,
      icon:
        optionOverrides?.library?.icon ??
        (renderIcon ? renderIcon('library') : <DefaultIcon emoji="🖼️" />),
      action: onPickFromLibrary,
      hidden: optionOverrides?.library?.hidden ?? false,
    },
    {
      key: 'document',
      label: optionOverrides?.document?.label ?? 'Files',
      description:
        optionOverrides?.document?.description ?? 'Browse documents and files',
      color: optionOverrides?.document?.color ?? theme.colors.accent3,
      icon:
        optionOverrides?.document?.icon ??
        (renderIcon ? renderIcon('document') : <DefaultIcon emoji="📄" />),
      action: onPickDocument,
      hidden: optionOverrides?.document?.hidden ?? false,
    },
  ];

  const visibleOptions = options.filter((o) => !o.hidden);

  const handleOptionPress = (action: () => void) => {
    onClose();
    // Small delay to let modal close animation finish
    setTimeout(action, 100);
  };

  // iOS: Use native ActionSheetIOS
  useEffect(() => {
    if (!visible) {
      isShowingRef.current = false;
      return;
    }

    if (visible && Platform.OS === 'ios' && !isShowingRef.current) {
      isShowingRef.current = true;

      // Build iOS action sheet options from visible options
      const iosOptions = [cancelLabel, ...visibleOptions.map((o) => o.label)];

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: iosOptions,
          cancelButtonIndex: 0,
          title,
        },
        (buttonIndex) => {
          isShowingRef.current = false;
          onClose();
          if (buttonIndex > 0) {
            const selectedOption = visibleOptions[buttonIndex - 1];
            if (selectedOption) {
              setTimeout(() => selectedOption.action(), 100);
            }
          }
        }
      );
    }
  }, [visible, onClose, visibleOptions, title, cancelLabel]);

  // iOS: Don't render modal - we use ActionSheetIOS instead
  if (Platform.OS === 'ios') {
    return null;
  }

  const resolvedOverlayColor = overlayColor ?? theme.colors.overlay;
  const resolvedSheetRadius = sheetRadius ?? theme.radii.xl;

  // Android: Use bottom sheet modal
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Background overlay */}
        <Pressable
          style={[styles.overlay, { backgroundColor: resolvedOverlayColor }]}
          onPress={onClose}
        >
          {/* Bottom sheet */}
          <View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: theme.colors.background,
                maxHeight: screenHeight * 0.6,
                borderTopLeftRadius: resolvedSheetRadius,
                borderTopRightRadius: resolvedSheetRadius,
              },
              sheetStyle,
            ]}
            // Prevent touches from passing through to background
            onStartShouldSetResponder={() => true}
          >
            {/* Handle bar */}
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.colors.textSecondary },
                ]}
              />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <ThemedText variant="title" style={styles.title}>
                {title}
              </ThemedText>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {visibleOptions.map((option) => (
                <Pressable
                  key={option.key}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: pressed
                        ? theme.colors.border
                        : theme.colors.backgroundSecondary,
                      borderRadius: theme.radii.md,
                    },
                    optionStyle,
                  ]}
                  onPress={() => handleOptionPress(option.action)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: option.color,
                        borderRadius: theme.radii.full,
                      },
                    ]}
                  >
                    {option.icon}
                  </View>
                  <View style={styles.optionText}>
                    <ThemedText variant="label">{option.label}</ThemedText>
                    <ThemedText variant="caption" secondary>
                      {option.description}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}

              {/* Cancel Button */}
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <ThemedText secondary>{cancelLabel}</ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

/**
 * Default emoji icon component.
 */
function DefaultIcon({ emoji }: { emoji: string }): React.JSX.Element {
  return <ThemedText style={styles.defaultIcon}>{emoji}</ThemedText>;
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    paddingBottom: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    textAlign: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  defaultIcon: {
    fontSize: 22,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
});
