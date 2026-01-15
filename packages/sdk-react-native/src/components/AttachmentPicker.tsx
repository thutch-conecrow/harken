import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  SafeAreaView,
  Pressable,
  Dimensions,
  Platform,
  ActionSheetIOS,
  StyleSheet,
} from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import { useHarkenTheme } from '../hooks';
import { ThemedText } from './ThemedText';

export type AttachmentSource = 'camera' | 'library' | 'document';

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
  /** Custom render function for option icons (optional) */
  renderIcon?: (source: AttachmentSource) => React.ReactNode;
}

interface PickerOption {
  key: AttachmentSource;
  label: string;
  description: string;
  color: string;
  defaultIcon: string;
  action: () => void;
}

/**
 * Platform-appropriate attachment source picker.
 *
 * - **iOS**: Uses native `ActionSheetIOS` for platform-native experience
 * - **Android**: Uses a bottom sheet modal with styled options
 *
 * @example
 * ```tsx
 * const [showPicker, setShowPicker] = useState(false);
 * const { pickImage, pickDocument } = useAttachmentUpload();
 *
 * <AttachmentPicker
 *   visible={showPicker}
 *   onClose={() => setShowPicker(false)}
 *   onTakePhoto={() => pickImage('camera')}
 *   onPickFromLibrary={() => pickImage('library')}
 *   onPickDocument={() => pickDocument()}
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
}: AttachmentPickerProps): React.JSX.Element | null {
  const theme = useHarkenTheme();
  const screenHeight = Dimensions.get('window').height;

  // Prevent double-triggering ActionSheetIOS if callbacks change
  const isShowingRef = useRef(false);

  const options: PickerOption[] = [
    {
      key: 'camera',
      label: 'Camera',
      description: 'Take a new photo',
      color: theme.colors.primary,
      defaultIcon: '📷',
      action: onTakePhoto,
    },
    {
      key: 'library',
      label: 'Photo Library',
      description: 'Choose from existing photos',
      color: '#34C759', // Green
      defaultIcon: '🖼️',
      action: onPickFromLibrary,
    },
    {
      key: 'document',
      label: 'Files',
      description: 'Browse documents and files',
      color: '#FF9500', // Orange
      defaultIcon: '📄',
      action: onPickDocument,
    },
  ];

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
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Photo Library', 'Files'],
          cancelButtonIndex: 0,
          title,
        },
        (buttonIndex) => {
          isShowingRef.current = false;
          onClose();
          // Small delay to ensure any UI updates complete
          setTimeout(() => {
            switch (buttonIndex) {
              case 1:
                onTakePhoto();
                break;
              case 2:
                onPickFromLibrary();
                break;
              case 3:
                onPickDocument();
                break;
            }
          }, 100);
        }
      );
    }
  }, [visible, onClose, onTakePhoto, onPickFromLibrary, onPickDocument, title]);

  // iOS: Don't render modal - we use ActionSheetIOS instead
  if (Platform.OS === 'ios') {
    return null;
  }

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
        <Pressable style={styles.overlay} onPress={onClose}>
          {/* Bottom sheet */}
          <View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: theme.colors.background,
                maxHeight: screenHeight * 0.6,
              },
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
              {options.map((option) => (
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
                    {renderIcon ? (
                      renderIcon(option.key)
                    ) : (
                      <ThemedText style={styles.defaultIcon}>
                        {option.defaultIcon}
                      </ThemedText>
                    )}
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
                <ThemedText secondary>Cancel</ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
