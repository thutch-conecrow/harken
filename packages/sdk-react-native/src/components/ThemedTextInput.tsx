import React, { useState } from "react";
import { TextInput, View } from "react-native";
import type { TextInputProps, ViewStyle, TextStyle, StyleProp } from "react-native";
import { useHarkenTheme } from "../hooks";

export interface ThemedTextInputProps extends TextInputProps {
  /** Error state */
  error?: boolean;
  /** Container style override */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Themed text input component with Harken styling.
 *
 * Uses the following theme tokens:
 * - `colors.inputBackground` for background
 * - `colors.inputBorder`, `inputBorderFocused`, `inputBorderError` for border states
 * - `colors.inputText` for text color
 * - `colors.inputPlaceholder` for placeholder
 * - `spacing.inputPadding` for padding
 * - `radii.input` for border radius
 * - `sizing.inputMinHeight` for minimum height
 */
export function ThemedTextInput({
  error = false,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: ThemedTextInputProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const { input } = theme.components;
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return input.borderError;
    if (isFocused) return input.borderFocused;
    return input.border;
  };

  const inputStyle: TextStyle = {
    fontSize: theme.typography.bodySize,
    fontFamily: theme.typography.fontFamily,
    color: input.text,
    padding: input.padding,
    minHeight: input.minHeight,
  };

  const containerStyles: ViewStyle = {
    backgroundColor: input.background,
    borderWidth: 1,
    borderColor: getBorderColor(),
    borderRadius: input.radius,
  };

  return (
    <View style={[containerStyles, containerStyle]}>
      <TextInput
        style={[inputStyle, style]}
        placeholderTextColor={input.placeholder}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}
