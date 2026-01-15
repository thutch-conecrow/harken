import React, { useState, useCallback } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useHarkenTheme } from '../hooks';
import { ThemedText } from './ThemedText';
import { ThemedTextInput } from './ThemedTextInput';
import { ThemedButton } from './ThemedButton';
import { CategorySelector } from './CategorySelector';
import type { CategoryOption } from './CategorySelector';
import type { FeedbackCategory } from '../types';

export interface FeedbackFormData {
  message: string;
  category: FeedbackCategory | null;
}

export interface FeedbackFormProps {
  /** Called when form is submitted */
  onSubmit: (data: FeedbackFormData) => void | Promise<void>;
  /** Called when form is cancelled/dismissed */
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
  /** Loading state (disables form) */
  loading?: boolean;
  /** Initial form values */
  initialValues?: Partial<FeedbackFormData>;
}

/**
 * Feedback composer form component.
 *
 * A minimal, themed form for collecting user feedback.
 *
 * @example
 * ```tsx
 * <FeedbackForm
 *   onSubmit={async (data) => {
 *     await submitFeedback(data);
 *   }}
 *   onCancel={() => setVisible(false)}
 * />
 * ```
 */
export function FeedbackForm({
  onSubmit,
  onCancel,
  title = 'Send Feedback',
  placeholder = 'What would you like to share?',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  categories,
  requireCategory = false,
  minMessageLength = 1,
  maxMessageLength = 5000,
  loading = false,
  initialValues,
}: FeedbackFormProps): React.JSX.Element {
  const theme = useHarkenTheme();

  const [message, setMessage] = useState(initialValues?.message ?? '');
  const [category, setCategory] = useState<FeedbackCategory | null>(
    initialValues?.category ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedMessage = message.trim();
  const isMessageValid =
    trimmedMessage.length >= minMessageLength &&
    trimmedMessage.length <= maxMessageLength;
  const isCategoryValid = !requireCategory || category !== null;
  const canSubmit = isMessageValid && isCategoryValid && !loading && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        message: trimmedMessage,
        category,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, onSubmit, trimmedMessage, category]);

  const containerStyle: ViewStyle = {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.radii.lg,
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={containerStyle}>
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
              disabled={loading || isSubmitting}
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
              editable={!loading && !isSubmitting}
              style={{ minHeight: 120 }}
              maxLength={maxMessageLength + 100} // Allow slight overflow to show warning
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

          {/* Buttons */}
          <View style={buttonRowStyle}>
            {onCancel && (
              <View style={{ flex: 1 }}>
                <ThemedButton
                  title={cancelLabel}
                  variant="secondary"
                  onPress={onCancel}
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
                loading={isSubmitting || loading}
                fullWidth={!!onCancel}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
