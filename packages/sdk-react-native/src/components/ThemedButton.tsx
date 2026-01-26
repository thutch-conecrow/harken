import React, { useCallback } from "react";
import { Pressable, ActivityIndicator, StyleSheet, Text } from "react-native";
import type {
  PressableProps,
  ViewStyle,
  TextStyle,
  StyleProp,
  GestureResponderEvent,
} from "react-native";
import { useHarkenTheme } from "../hooks";
import { usePressedState } from "../hooks/usePressedState";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ThemedButtonProps extends Omit<PressableProps, "children" | "style"> {
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
  /** Additional styles for the button text */
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Themed button component with Harken styling.
 *
 * Uses the following theme tokens:
 * - `colors.buttonPrimary*` for primary variant
 * - `colors.buttonSecondary*` for secondary variant
 * - `colors.buttonGhostText` for ghost variant
 * - `spacing.buttonPadding*` for padding
 * - `radii.button` for border radius
 * - `sizing.buttonMinHeight` for minimum height
 * - `opacity.disabled` for disabled state
 */
export function ThemedButton({
  title,
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  onPressIn: onPressInProp,
  onPressOut: onPressOutProp,
  ...props
}: ThemedButtonProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const { button } = theme.components;
  const {
    isPressed,
    onPressIn: onPressInHook,
    onPressOut: onPressOutHook,
  } = usePressedState(disabled || loading);

  // Compose press handlers to support both internal state and consumer callbacks
  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      onPressInHook();
      onPressInProp?.(e);
    },
    [onPressInHook, onPressInProp]
  );

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      onPressOutHook();
      onPressOutProp?.(e);
    },
    [onPressOutHook, onPressOutProp]
  );

  const getBackgroundColor = (): string => {
    if (disabled) {
      return variant === "primary" ? theme.colors.border : "transparent";
    }

    switch (variant) {
      case "primary":
        return isPressed ? button.primary.backgroundPressed : button.primary.background;
      case "secondary":
        return isPressed ? theme.colors.border : button.secondary.background;
      case "ghost":
        return isPressed ? theme.colors.surface : "transparent";
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return theme.colors.textPlaceholder;
    }

    switch (variant) {
      case "primary":
        return button.primary.text;
      case "secondary":
        return button.secondary.text;
      case "ghost":
        return button.ghost.text;
    }
  };

  const getBorderColor = (): string => {
    switch (variant) {
      case "secondary":
        return button.secondary.border;
      default:
        return "transparent";
    }
  };

  // Flatten the style prop to handle arrays and registered styles
  const flattenedStyle = style ? StyleSheet.flatten(style) : undefined;

  const baseStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderWidth: variant === "secondary" ? 1 : 0,
    borderColor: getBorderColor(),
    borderRadius: button.radius,
    paddingVertical: button.paddingVertical,
    paddingHorizontal: button.paddingHorizontal,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minHeight: button.minHeight,
    opacity: disabled ? theme.opacity.disabled : 1,
  };

  if (fullWidth) {
    baseStyle.width = "100%";
  }

  const buttonTextStyle: TextStyle = {
    fontSize: button.textSize,
    fontWeight: button.textWeight,
    fontFamily: theme.typography.fontFamily,
    color: getTextColor(),
  };

  return (
    <Pressable
      disabled={disabled || loading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[baseStyle, flattenedStyle]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[buttonTextStyle, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}
