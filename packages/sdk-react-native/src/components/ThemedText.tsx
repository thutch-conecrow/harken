import React from 'react';
import { Text } from 'react-native';
import type { TextProps, TextStyle } from 'react-native';
import { useHarkenTheme } from '../hooks';

export type TextVariant = 'title' | 'body' | 'label' | 'caption';

export interface ThemedTextProps extends TextProps {
  /** Text variant determining size and weight */
  variant?: TextVariant;
  /** Text color override (defaults to theme text color) */
  color?: string;
  /** Whether to use secondary text color */
  secondary?: boolean;
}

/**
 * Themed text component that uses Harken theme typography.
 */
export function ThemedText({
  variant = 'body',
  color,
  secondary = false,
  style,
  children,
  ...props
}: ThemedTextProps): React.JSX.Element {
  const theme = useHarkenTheme();

  const variantStyles: Record<TextVariant, TextStyle> = {
    title: {
      fontSize: theme.typography.titleSize,
      lineHeight: theme.typography.titleSize * theme.typography.titleLineHeight,
      fontWeight: theme.typography.titleWeight,
      fontFamily: theme.typography.fontFamilyHeading ?? theme.typography.fontFamily,
    },
    body: {
      fontSize: theme.typography.bodySize,
      lineHeight: theme.typography.bodySize * theme.typography.bodyLineHeight,
      fontWeight: theme.typography.bodyWeight,
      fontFamily: theme.typography.fontFamily,
    },
    label: {
      fontSize: theme.typography.labelSize,
      fontWeight: theme.typography.labelWeight,
      fontFamily: theme.typography.fontFamily,
    },
    caption: {
      fontSize: theme.typography.captionSize,
      fontWeight: theme.typography.captionWeight,
      fontFamily: theme.typography.fontFamily,
    },
  };

  const textColor = color ?? (secondary ? theme.colors.textSecondary : theme.colors.text);

  return (
    <Text
      style={[variantStyles[variant], { color: textColor }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
