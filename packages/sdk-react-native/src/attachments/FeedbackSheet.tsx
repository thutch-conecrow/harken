import React, { useState, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import type { components } from '@harken/contracts';
import { useHarkenTheme, useFeedback } from '../hooks';
import { ThemedText } from '../components/ThemedText';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { ThemedButton } from '../components/ThemedButton';
import { CategorySelector, DEFAULT_CATEGORIES } from '../components/CategorySelector';
import type { CategoryOption } from '../components/CategorySelector';
import type { FeedbackCategory } from '../types';
import { useAttachmentUpload } from '../hooks/useAttachmentUpload';
import { AttachmentGrid } from '../components/AttachmentGrid';
import { AttachmentPicker } from '../components/AttachmentPicker';

type FeedbackSubmissionResponse = components['schemas']['FeedbackSubmissionResponse'];

export interface FeedbackSheetProps {
  /** Called when feedback is successfully submitted */
  onSuccess?: (result: FeedbackSubmissionResponse) => void;
  /** Called when submission fails */
  onError?: (error: Error) => void;
  /** Called when user cancels/dismisses the form */
  onCancel?: () => void;

  /** Title text */
  title?: string;
  /** Placeholder text for message input */
  placeholder?: string;
  /** Submit button text */
  submitLabel?: string;
  /** Cancel button text */
  cancelLabel?: string;

  /** Custom categories */
  categories?: CategoryOption[];
  /** Whether category selection is required */
  requireCategory?: boolean;

  /** Minimum message length */
  minMessageLength?: number;
  /** Maximum message length */
  maxMessageLength?: number;

  /** Whether to enable attachment support. @default true */
  enableAttachments?: boolean;
  /** Maximum number of attachments. @default 5 */
  maxAttachments?: number;

  /** Message shown in success alert. Set to null to disable alert. */
  successMessage?: string | null;
  /** Whether to show success alert. @default true */
  showSuccessAlert?: boolean;
  /** Whether to clear form on success. @default true */
  clearOnSuccess?: boolean;

  /** Container style override */
  containerStyle?: ViewStyle;
  /** Form content style override */
  formStyle?: ViewStyle;
}

/**
 * A batteries-included feedback form component with full attachment support.
 *
 * This version is exported from '@harken/sdk-react-native/attachments' and
 * includes support for picking images, documents, and uploading them.
 *
 * For the version without attachment dependencies, import from the main entry point.
 *
 * @example
 * ```tsx
 * import { FeedbackSheet } from '@harken/sdk-react-native/attachments';
 *
 * // Minimal usage with attachments
 * <FeedbackSheet onSuccess={() => navigation.goBack()} />
 *
 * // With customization
 * <FeedbackSheet
 *   title="Report a Bug"
 *   requireCategory
 *   enableAttachments
 *   maxAttachments={3}
 *   onSuccess={(result) => {
 *     analytics.track('feedback_submitted');
 *     navigation.goBack();
 *   }}
 *   onCancel={() => navigation.goBack()}
 * />
 * ```
 */
export function FeedbackSheet({
  onSuccess,
  onError,
  onCancel,
  title = 'Send Feedback',
  placeholder = 'What would you like to share?',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  categories = DEFAULT_CATEGORIES,
  requireCategory = false,
  minMessageLength = 1,
  maxMessageLength = 5000,
  enableAttachments = true,
  maxAttachments = 5,
  successMessage = 'Thank you for your feedback!',
  showSuccessAlert = true,
  clearOnSuccess = true,
  containerStyle,
  formStyle,
}: FeedbackSheetProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const { submitFeedback, isSubmitting, error, clearError, isInitializing } =
    useFeedback();
  const {
    attachments,
    pickImage,
    pickDocument,
    removeAttachment,
    retryAttachment,
    getAttachmentIds,
    hasActiveUploads,
  } = useAttachmentUpload();

  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const trimmedMessage = message.trim();
  const isMessageValid =
    trimmedMessage.length >= minMessageLength &&
    trimmedMessage.length <= maxMessageLength;
  const isCategoryValid = !requireCategory || category !== null;
  const canSubmit = isMessageValid && isCategoryValid && !isSubmitting && !isInitializing;

  const resetForm = useCallback(() => {
    setMessage('');
    setCategory(null);
    clearError();
    // Note: We don't clear attachments since they may still be uploading
    // and can be reused. Users can manually remove them if needed.
  }, [clearError]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    clearError();

    try {
      const result = await submitFeedback({
        message: trimmedMessage,
        category: category ?? 'other',
        attachments: enableAttachments ? getAttachmentIds() : undefined,
      });

      const uploadNote = enableAttachments && hasActiveUploads
        ? '\n\nAttachments are still uploading in the background.'
        : '';

      if (showSuccessAlert && successMessage) {
        Alert.alert('Success', `${successMessage}${uploadNote}`, [
          {
            text: 'OK',
            onPress: () => {
              if (clearOnSuccess) {
                resetForm();
              }
              onSuccess?.(result);
            },
          },
        ]);
      } else {
        if (clearOnSuccess) {
          resetForm();
        }
        onSuccess?.(result);
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to submit feedback. Please try again.';
      Alert.alert('Submission Failed', errorMessage);
      onError?.(e instanceof Error ? e : new Error(errorMessage));
    }
  }, [
    canSubmit,
    clearError,
    submitFeedback,
    trimmedMessage,
    category,
    enableAttachments,
    getAttachmentIds,
    hasActiveUploads,
    showSuccessAlert,
    successMessage,
    clearOnSuccess,
    resetForm,
    onSuccess,
    onError,
  ]);

  const handleCancel = useCallback(() => {
    resetForm();
    onCancel?.();
  }, [resetForm, onCancel]);

  const handlePickerOption = useCallback(
    async (source: 'camera' | 'library' | 'document') => {
      setShowPicker(false);
      try {
        if (source === 'document') {
          await pickDocument();
        } else {
          await pickImage(source);
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to pick file. Please try again.');
      }
    },
    [pickImage, pickDocument]
  );

  const baseContainerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const contentStyle: ViewStyle = {
    flexGrow: 1,
    padding: theme.spacing.lg,
  };

  const sectionStyle: ViewStyle = {
    marginBottom: theme.spacing.lg,
  };

  const buttonRowStyle: ViewStyle = {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  };

  const characterCount = trimmedMessage.length;
  const showCharacterWarning = characterCount > maxMessageLength * 0.9;

  if (isInitializing) {
    return (
      <View style={[baseContainerStyle, containerStyle, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText variant="body" secondary>
          Initializing...
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[baseContainerStyle, containerStyle]}
      >
        <ScrollView
          contentContainerStyle={[contentStyle, formStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={sectionStyle}>
            <ThemedText variant="title">{title}</ThemedText>
          </View>

          {/* Category selector */}
          <View style={sectionStyle}>
            <ThemedText
              variant="label"
              secondary
              style={{ marginBottom: theme.spacing.sm }}
            >
              Category{requireCategory ? '' : ' (optional)'}
            </ThemedText>
            <CategorySelector
              value={category}
              onChange={setCategory}
              categories={categories}
              disabled={isSubmitting}
            />
          </View>

          {/* Message input */}
          <View style={sectionStyle}>
            <ThemedText
              variant="label"
              secondary
              style={{ marginBottom: theme.spacing.sm }}
            >
              Message
            </ThemedText>
            <ThemedTextInput
              value={message}
              onChangeText={setMessage}
              placeholder={placeholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isSubmitting}
              style={{ minHeight: 120 }}
              maxLength={maxMessageLength + 100}
            />
            {showCharacterWarning && (
              <ThemedText
                variant="caption"
                color={
                  characterCount > maxMessageLength
                    ? theme.colors.error
                    : theme.colors.textSecondary
                }
                style={{ marginTop: theme.spacing.xs, textAlign: 'right' }}
              >
                {characterCount}/{maxMessageLength}
              </ThemedText>
            )}
          </View>

          {/* Attachments */}
          {enableAttachments && (
            <View style={sectionStyle}>
              <ThemedText
                variant="label"
                secondary
                style={{ marginBottom: theme.spacing.sm }}
              >
                Attachments
              </ThemedText>
              <AttachmentGrid
                attachments={attachments}
                onRemove={removeAttachment}
                onRetry={retryAttachment}
                onAdd={() => setShowPicker(true)}
                maxAttachments={maxAttachments}
              />
            </View>
          )}

          {/* Error display */}
          {error && (
            <View style={{ marginBottom: theme.spacing.md }}>
              <ThemedText variant="caption" color={theme.colors.error}>
                {error.message}
              </ThemedText>
            </View>
          )}

          {/* Buttons */}
          <View style={buttonRowStyle}>
            {onCancel && (
              <View style={{ flex: 1 }}>
                <ThemedButton
                  title={cancelLabel}
                  variant="secondary"
                  onPress={handleCancel}
                  disabled={isSubmitting}
                  fullWidth
                />
              </View>
            )}
            <View style={{ flex: onCancel ? 1 : undefined }}>
              <ThemedButton
                title={submitLabel}
                variant="primary"
                onPress={handleSubmit}
                disabled={!canSubmit}
                loading={isSubmitting}
                fullWidth={!!onCancel}
              />
            </View>
          </View>

          {/* Upload status indicator */}
          {enableAttachments && hasActiveUploads && (
            <View style={{ marginTop: theme.spacing.sm }}>
              <ThemedText
                variant="caption"
                color={theme.colors.primary}
                style={{ textAlign: 'center' }}
              >
                Uploads in progress - you can still submit now
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Attachment picker modal */}
      {enableAttachments && (
        <AttachmentPicker
          visible={showPicker}
          onClose={() => setShowPicker(false)}
          onTakePhoto={() => handlePickerOption('camera')}
          onPickFromLibrary={() => handlePickerOption('library')}
          onPickDocument={() => handlePickerOption('document')}
        />
      )}
    </>
  );
}
