import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import type { TextInputProps, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useHarkenTheme } from '../hooks';

export interface ThemedTextInputProps extends TextInputProps {
  /** Error state */
  error?: boolean;
  /** Container style override */
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Themed text input component with Harken styling.
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
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.borderFocused;
    return theme.colors.border;
  };

  const inputStyle: TextStyle = {
    fontSize: theme.typography.bodySize,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.text,
    padding: theme.spacing.md,
    minHeight: 44,
  };

  const containerStyles: ViewStyle = {
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: getBorderColor(),
    borderRadius: theme.radii.md,
  };

  return (
    <View style={[containerStyles, containerStyle]}>
      <TextInput
        style={[inputStyle, style]}
        placeholderTextColor={theme.colors.textPlaceholder}
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
