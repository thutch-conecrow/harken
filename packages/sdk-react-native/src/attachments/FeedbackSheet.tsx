import React, { useState, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';
import type { components } from '../types/index.js';
import { useHarkenTheme, useFeedback } from '../hooks';
import { ThemedText } from '../components/ThemedText';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { ThemedButton } from '../components/ThemedButton';
import { CategorySelector, DEFAULT_CATEGORIES } from '../components/CategorySelector';
import type { CategoryOption } from '../components/CategorySelector';
import type { FeedbackCategory } from '../types';
import { useAttachmentPicker } from '../hooks/useAttachmentPicker';
import type { AttachmentSourceConfig } from '../hooks/useAttachmentPicker';
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

  /** Title text. Set to empty string to hide title section entirely. */
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
  /**
   * Configure which attachment sources are available.
   * If only one source is enabled, the picker modal is skipped.
   * @default { camera: true, library: true, files: true }
   */
  attachmentSources?: AttachmentSourceConfig;

  /** Message shown in success alert. Set to null to disable alert. */
  successMessage?: string | null;
  /** Whether to show success alert. @default true */
  showSuccessAlert?: boolean;
  /** Whether to clear form on success. @default true */
  clearOnSuccess?: boolean;

  /**
   * Layout mode for the container.
   * - 'flex': Uses flex: 1 (default, requires parent with explicit height)
   * - 'auto': Content determines height (for bottom sheet modal embedding)
   */
  layout?: 'flex' | 'auto';

  /** Container style override (outer KeyboardAvoidingView) */
  containerStyle?: StyleProp<ViewStyle>;
  /** Content style override (inner ScrollView content) */
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * @deprecated Use `contentStyle` instead
   */
  formStyle?: StyleProp<ViewStyle>;
}

/**
 * A batteries-included feedback form component with full attachment support.
 *
 * This version is exported from '@harkenapp/sdk-react-native/attachments' and
 * includes support for picking images, documents, and uploading them.
 *
 * For the version without attachment dependencies, import from the main entry point.
 *
 * Uses the following theme tokens:
 * - `colors.formBackground` for background
 * - `spacing.formPadding` for padding
 * - `spacing.sectionGap` for section gaps
 * - `radii.form` for border radius
 *
 * @example
 * ```tsx
 * import { FeedbackSheet } from '@harkenapp/sdk-react-native';
 *
 * // Minimal usage with attachments
 * <FeedbackSheet onSuccess={() => navigation.goBack()} />
 *
 * // For bottom sheet modal embedding
 * <FeedbackSheet
 *   layout="auto"
 *   title=""
 *   onSuccess={() => closeModal()}
 * />
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
 *
 * // With restricted attachment sources (photo library only)
 * <FeedbackSheet
 *   attachmentSources={{ camera: false, library: true, files: false }}
 *   onSuccess={() => navigation.goBack()}
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
  attachmentSources,
  successMessage = 'Thank you for your feedback!',
  showSuccessAlert = true,
  clearOnSuccess = true,
  layout = 'flex',
  containerStyle,
  contentStyle,
  formStyle,
}: FeedbackSheetProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const { form } = theme.components;
  const { submitFeedback, isSubmitting, error, clearError, isInitializing } =
    useFeedback();
  const {
    attachments,
    removeAttachment,
    retryAttachment,
    getAttachmentIds,
    hasActiveUploads,
    openPicker,
    pickerProps,
    enabledSourceCount,
  } = useAttachmentPicker(attachmentSources);

  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<FeedbackCategory | null>(null);

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

  const baseContainerStyle: ViewStyle = {
    ...(layout === 'flex' ? { flex: 1 } : {}),
    backgroundColor: form.background,
    borderRadius: form.radius,
  };

  const scrollContentStyle: ViewStyle = {
    ...(layout === 'flex' ? { flexGrow: 1 } : {}),
    padding: form.padding,
  };

  const sectionStyle: ViewStyle = {
    marginBottom: form.sectionGap,
  };

  // Support deprecated formStyle prop
  const effectiveContentStyle = contentStyle ?? formStyle;

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
          contentContainerStyle={[scrollContentStyle, effectiveContentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title - only render if provided */}
          {title ? (
            <View style={sectionStyle}>
              <ThemedText variant="title">{title}</ThemedText>
            </View>
          ) : null}

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
                onAdd={openPicker}
                maxAttachments={maxAttachments}
                showAddButton={enabledSourceCount > 0}
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
      {enableAttachments && <AttachmentPicker {...pickerProps} />}
    </>
  );
}
