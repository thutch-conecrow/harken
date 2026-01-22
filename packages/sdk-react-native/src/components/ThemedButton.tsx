import React from "react";
import { Pressable, ActivityIndicator, StyleSheet } from "react-native";
import type { PressableProps, ViewStyle, TextStyle, StyleProp } from "react-native";
import { useHarkenTheme } from "../hooks";
import { ThemedText } from "./ThemedText";

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
  ...props
}: ThemedButtonProps): React.JSX.Element {
  const theme = useHarkenTheme();
  const { button } = theme.components;

  const getBackgroundColor = (pressed: boolean): string => {
    if (disabled) {
      return variant === "primary" ? theme.colors.border : "transparent";
    }

    switch (variant) {
      case "primary":
        return pressed ? button.primary.backgroundPressed : button.primary.background;
      case "secondary":
        return pressed ? theme.colors.border : button.secondary.background;
      case "ghost":
        return pressed ? theme.colors.surface : "transparent";
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

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => {
        const baseStyle: ViewStyle = {
          backgroundColor: getBackgroundColor(pressed),
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: getBorderColor(),
          borderRadius: button.radius,
          paddingVertical: button.paddingVertical + 4,
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

        return [baseStyle, flattenedStyle];
      }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <ThemedText variant="label" color={getTextColor()} style={textStyle}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}
