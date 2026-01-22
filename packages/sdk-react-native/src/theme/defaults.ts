import type {
  HarkenColors,
  HarkenTypography,
  HarkenSpacing,
  HarkenRadii,
  HarkenSizing,
  HarkenOpacity,
  HarkenTheme,
} from "./types";

/**
 * Default light mode colors.
 * Neutral, accessible palette with no hard-coded branding.
 */
export const lightColors: HarkenColors = {
  primary: "#2563EB", // Blue 600
  primaryPressed: "#1D4ED8", // Blue 700
  background: "#FFFFFF",
  surface: "#F9FAFB", // Gray 50 - container/modal surface
  backgroundSecondary: "#F9FAFB", // Gray 50 - alias for surface (backwards compat)
  text: "#111827", // Gray 900
  textSecondary: "#6B7280", // Gray 500
  textPlaceholder: "#9CA3AF", // Gray 400
  textOnPrimary: "#FFFFFF",
  border: "#E5E7EB", // Gray 200
  borderFocused: "#2563EB", // Blue 600
  error: "#DC2626", // Red 600
  success: "#16A34A", // Green 600
  warning: "#D97706", // Amber 600
  info: "#2563EB", // Blue 600
  overlay: "rgba(0, 0, 0, 0.3)",
  overlayDark: "rgba(0, 0, 0, 0.6)",
  accent1: "#2563EB", // Blue 600 (camera)
  accent2: "#16A34A", // Green 600 (library)
  accent3: "#D97706", // Amber 600 (files)
};

/**
 * Default dark mode colors.
 * Inverted palette optimized for dark backgrounds.
 */
export const darkColors: HarkenColors = {
  primary: "#3B82F6", // Blue 500
  primaryPressed: "#2563EB", // Blue 600
  background: "#111827", // Gray 900
  surface: "#1F2937", // Gray 800 - container/modal surface
  backgroundSecondary: "#1F2937", // Gray 800 - alias for surface (backwards compat)
  text: "#F9FAFB", // Gray 50
  textSecondary: "#9CA3AF", // Gray 400
  textPlaceholder: "#6B7280", // Gray 500
  textOnPrimary: "#FFFFFF",
  border: "#374151", // Gray 700
  borderFocused: "#3B82F6", // Blue 500
  error: "#EF4444", // Red 500
  success: "#22C55E", // Green 500
  warning: "#F59E0B", // Amber 500
  info: "#3B82F6", // Blue 500
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayDark: "rgba(0, 0, 0, 0.8)",
  accent1: "#3B82F6", // Blue 500 (camera)
  accent2: "#22C55E", // Green 500 (library)
  accent3: "#F59E0B", // Amber 500 (files)
};

/**
 * Default typography settings.
 * Uses system font for maximum compatibility.
 */
export const defaultTypography: HarkenTypography = {
  fontFamily: "System",
  fontFamilyHeading: undefined, // Falls back to fontFamily

  titleSize: 20,
  titleLineHeight: 1.3,
  titleWeight: "600",

  bodySize: 16,
  bodyLineHeight: 1.5,
  bodyWeight: "normal",

  labelSize: 14,
  labelWeight: "500",

  captionSize: 12,
  captionWeight: "normal",
};

/**
 * Default spacing scale.
 * Based on a 4px grid system.
 */
export const defaultSpacing: HarkenSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Default border radius values.
 */
export const defaultRadii: HarkenRadii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 20,
  full: 9999,
};

/**
 * Complete default light theme.
 */
export const lightTheme: HarkenTheme = {
  colors: lightColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
  radii: defaultRadii,
};

/**
 * Complete default dark theme.
 */
export const darkTheme: HarkenTheme = {
  colors: darkColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
  radii: defaultRadii,
};

/** Extended theme type that includes optional sizing and opacity */
type ExtendedHarkenTheme = HarkenTheme & {
  sizing?: Partial<HarkenSizing>;
  opacity?: Partial<HarkenOpacity>;
};

/**
 * Creates a theme by merging overrides with a base theme.
 *
 * Note: For full resolved theme with component aliases, use `resolveTheme` instead.
 * This function creates a raw HarkenTheme suitable for passing to resolveTheme.
 */
export function createTheme(
  baseTheme: ExtendedHarkenTheme,
  overrides?: {
    colors?: Partial<HarkenColors>;
    typography?: Partial<HarkenTypography>;
    spacing?: Partial<HarkenSpacing>;
    radii?: Partial<HarkenRadii>;
    sizing?: Partial<HarkenSizing>;
    opacity?: Partial<HarkenOpacity>;
  }
): ExtendedHarkenTheme {
  if (!overrides) {
    return baseTheme;
  }

  // Merge sizing if either base or overrides has it
  const baseSizing = baseTheme.sizing;
  const overrideSizing = overrides.sizing;
  const mergedSizing =
    baseSizing || overrideSizing ? { ...baseSizing, ...overrideSizing } : undefined;

  // Merge opacity if either base or overrides has it
  const baseOpacity = baseTheme.opacity;
  const overrideOpacity = overrides.opacity;
  const mergedOpacity =
    baseOpacity || overrideOpacity ? { ...baseOpacity, ...overrideOpacity } : undefined;

  return {
    colors: { ...baseTheme.colors, ...overrides.colors },
    typography: { ...baseTheme.typography, ...overrides.typography },
    spacing: { ...baseTheme.spacing, ...overrides.spacing },
    radii: { ...baseTheme.radii, ...overrides.radii },
    ...(mergedSizing && { sizing: mergedSizing }),
    ...(mergedOpacity && { opacity: mergedOpacity }),
  };
}
