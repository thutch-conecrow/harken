import React, { useState, useCallback } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import type { ViewStyle, StyleProp } from "react-native";
import type { components } from "../types/index.js";
import { useHarkenTheme, useFeedback } from "../hooks";
import { ThemedText } from "./ThemedText";
import { ThemedTextInput } from "./ThemedTextInput";
import { ThemedButton } from "./ThemedButton";
import { CategorySelector, DEFAULT_CATEGORIES } from "./CategorySelector";
import type { CategoryOption } from "./CategorySelector";
import type { FeedbackCategory } from "../types";

type FeedbackSubmissionResponse = components["schemas"]["FeedbackSubmissionResponse"];

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
  layout?: "flex" | "auto";

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
 * A batteries-included feedback form component.
 *
 * Unlike `FeedbackForm` which is a "dumb" UI component requiring manual
 * wiring, `FeedbackSheet` handles everything internally:
 * - API submission via `useFeedback` hook
 * - Success/error alerts
 * - Form state management
 * - Keyboard handling
 *
 * For attachment support, import from '@harkenapp/sdk-react-native/attachments'.
 *
 * Uses the following theme tokens:
 * - `colors.formBackground` for background
 * - `spacing.formPadding` for padding
 * - `spacing.sectionGap` for section gaps
 * - `radii.form` for border radius
 *
 * @example
 * ```tsx
 * // Minimal usage
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
 *   categories={[
 *     { value: 'crash', label: 'App Crash', icon: '💥' },
 *     { value: 'visual', label: 'Visual Bug', icon: '👁️' },
 *   ]}
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
  title = "Send Feedback",
  placeholder = "What would you like to share?",
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  categories = DEFAULT_CATEGORIES,
  requireCategory = false,
  minMessageLength = 1,
  maxMessageLength = 5000,
  successMessage = "Thank you for your feedback!",
  showSuccessAlert = true,
  clearOnSuccess = true,
  layout = "flex",
  containerStyle,
  contentStyle,
  formStyle,
}: FeedbackSheetProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const { form } = theme.components;
  const { submitFeedback, isSubmitting, error, clearError, isInitializing } = useFeedback();

  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<FeedbackCategory | null>(null);

  const trimmedMessage = message.trim();
  const isMessageValid =
    trimmedMessage.length >= minMessageLength && trimmedMessage.length <= maxMessageLength;
  const isCategoryValid = !requireCategory || category !== null;
  const canSubmit = isMessageValid && isCategoryValid && !isSubmitting && !isInitializing;

  const resetForm = useCallback(() => {
    setMessage("");
    setCategory(null);
    clearError();
  }, [clearError]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    clearError();

    try {
      const result = await submitFeedback({
        message: trimmedMessage,
        category: category ?? "other",
      });

      if (showSuccessAlert && successMessage) {
        Alert.alert("Success", successMessage, [
          {
            text: "OK",
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
        e instanceof Error ? e.message : "Failed to submit feedback. Please try again.";
      Alert.alert("Submission Failed", errorMessage);
      onError?.(e instanceof Error ? e : new Error(errorMessage));
    }
  }, [
    canSubmit,
    clearError,
    submitFeedback,
    trimmedMessage,
    category,
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
    ...(layout === "flex" ? { flex: 1 } : {}),
    backgroundColor: form.background,
    borderRadius: form.radius,
  };

  const scrollContentStyle: ViewStyle = {
    ...(layout === "flex" ? { flexGrow: 1 } : {}),
    padding: form.padding,
  };

  const sectionStyle: ViewStyle = {
    marginBottom: form.sectionGap,
  };

  const buttonRowStyle: ViewStyle = {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  };

  const characterCount = trimmedMessage.length;
  const showCharacterWarning = characterCount > maxMessageLength * 0.9;

  // Support deprecated formStyle prop
  const effectiveContentStyle = contentStyle ?? formStyle;

  if (isInitializing) {
    return (
      <View
        style={[
          baseContainerStyle,
          containerStyle,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ThemedText variant="body" secondary>
          Initializing...
        </ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
          <ThemedText variant="label" secondary style={{ marginBottom: theme.spacing.sm }}>
            Category{requireCategory ? "" : " (optional)"}
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
          <ThemedText variant="label" secondary style={{ marginBottom: theme.spacing.sm }}>
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
                characterCount > maxMessageLength ? theme.colors.error : theme.colors.textSecondary
              }
              style={{ marginTop: theme.spacing.xs, textAlign: "right" }}
            >
              {characterCount}/{maxMessageLength}
            </ThemedText>
          )}
        </View>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
