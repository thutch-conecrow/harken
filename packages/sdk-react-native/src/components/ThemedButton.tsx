import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type { PressableProps, ViewStyle, StyleProp } from 'react-native';
import { useHarkenTheme } from '../hooks';
import { ThemedText } from './ThemedText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ThemedButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Button text */
  title: string;
  /** Button variant */
  variant?: ButtonVariant;
  /** Loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /**
   * Additional styles for the button container.
   * Note: Function styles are not supported; use static StyleProp<ViewStyle>.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * Themed button component with Harken styling.
 */
export function ThemedButton({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ThemedButtonProps): React.JSX.Element {
  const theme = useHarkenTheme();

  const getBackgroundColor = (pressed: boolean): string => {
    if (disabled) {
      return variant === 'primary'
        ? theme.colors.border
        : 'transparent';
    }

    switch (variant) {
      case 'primary':
        return pressed ? theme.colors.primaryPressed : theme.colors.primary;
      case 'secondary':
        return pressed ? theme.colors.border : theme.colors.backgroundSecondary;
      case 'ghost':
        return pressed ? theme.colors.backgroundSecondary : 'transparent';
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return theme.colors.textPlaceholder;
    }

    switch (variant) {
      case 'primary':
        return theme.colors.textOnPrimary;
      case 'secondary':
      case 'ghost':
        return theme.colors.text;
    }
  };

  const getBorderColor = (): string => {
    switch (variant) {
      case 'secondary':
        return theme.colors.border;
      default:
        return 'transparent';
    }
  };

  // Flatten the style prop to handle arrays and registered styles
  const flattenedStyle = style ? StyleSheet.flatten(style) : undefined;

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => {
        const baseStyle: ViewStyle = {
          backgroundColor: getBackgroundColor(pressed),
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: getBorderColor(),
          borderRadius: theme.radii.md,
          paddingVertical: theme.spacing.sm + 4,
          paddingHorizontal: theme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          minHeight: 48,
          opacity: disabled ? 0.6 : 1,
        };

        if (fullWidth) {
          baseStyle.width = '100%';
        }

        return [baseStyle, flattenedStyle];
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
          size="small"
        />
      ) : (
        <ThemedText
          variant="label"
          color={getTextColor()}
        >
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}
