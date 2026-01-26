/**
 * Color tokens for Harken SDK theming.
 * All colors support full override by host apps.
 *
 * Base tokens are required. Component tokens are optional and fall back to base tokens.
 */
export interface HarkenColors {
  // === BASE TOKENS (required) ===

  /** Primary brand color for buttons and accents */
  primary: string;
  /** Darker variant of primary for pressed states */
  primaryPressed: string;
  /** App-level background color */
  background: string;
  /** Container/modal surface color (distinct from background) */
  surface: string;
  /** @deprecated Use `surface` instead. Kept for backwards compatibility. */
  backgroundSecondary: string;
  /** Primary text color */
  text: string;
  /** Secondary/muted text color */
  textSecondary: string;
  /** Placeholder text color */
  textPlaceholder: string;
  /** Text color on primary-colored backgrounds */
  textOnPrimary: string;
  /** Border color for inputs and dividers */
  border: string;
  /** Focused border color */
  borderFocused: string;
  /** Error state color */
  error: string;
  /** Success state color */
  success: string;
  /** Warning state color */
  warning: string;
  /** Informational state color */
  info: string;
  /** Light overlay background (for modals, sheets) */
  overlay: string;
  /** Dark overlay background (for error states, loading) */
  overlayDark: string;
  /** Accent color 1 (e.g., camera option) */
  accent1: string;
  /** Accent color 2 (e.g., photo library option) */
  accent2: string;
  /** Accent color 3 (e.g., files option) */
  accent3: string;

  // === COMPONENT TOKENS (optional, fall back to base tokens) ===

  // Category Chips
  /** Chip background color (falls back to surface) */
  chipBackground?: string;
  /** Selected chip background color (falls back to primary) */
  chipBackgroundSelected?: string;
  /** Chip border color (falls back to border) */
  chipBorder?: string;
  /** Selected chip border color (falls back to primary) */
  chipBorderSelected?: string;
  /** Chip text color (falls back to text) */
  chipText?: string;
  /** Selected chip text color (falls back to textOnPrimary) */
  chipTextSelected?: string;

  // Text Input
  /** Input background color (falls back to surface) */
  inputBackground?: string;
  /** Input border color (falls back to border) */
  inputBorder?: string;
  /** Input focused border color (falls back to borderFocused) */
  inputBorderFocused?: string;
  /** Input error border color (falls back to error) */
  inputBorderError?: string;
  /** Input text color (falls back to text) */
  inputText?: string;
  /** Input placeholder color (falls back to textPlaceholder) */
  inputPlaceholder?: string;

  // Buttons - Primary variant
  /** Primary button background (falls back to primary) */
  buttonPrimaryBackground?: string;
  /** Primary button pressed background (falls back to primaryPressed) */
  buttonPrimaryBackgroundPressed?: string;
  /** Primary button text color (falls back to textOnPrimary) */
  buttonPrimaryText?: string;

  // Buttons - Secondary variant
  /** Secondary button background (falls back to surface) */
  buttonSecondaryBackground?: string;
  /** Secondary button border color (falls back to border) */
  buttonSecondaryBorder?: string;
  /** Secondary button text color (falls back to text) */
  buttonSecondaryText?: string;

  // Buttons - Ghost variant
  /** Ghost button text color (falls back to text) */
  buttonGhostText?: string;

  // Attachment Add Button
  /** Add button background (falls back to surface) */
  addButtonBackground?: string;
  /** Add button pressed background (falls back to border) */
  addButtonBackgroundPressed?: string;
  /** Add button border color (falls back to border) */
  addButtonBorder?: string;
  /** Add button icon color (falls back to textSecondary) */
  addButtonIcon?: string;
  /** Add button text color (falls back to textSecondary) */
  addButtonText?: string;

  // Attachment Tile
  /** Tile background color (falls back to surface) */
  tileBackground?: string;
  /** Tile border color (falls back to border) */
  tileBorder?: string;

  // Upload Status Overlay
  /** Upload overlay background (falls back to overlay) */
  uploadOverlay?: string;
  /** Upload error overlay background (falls back to overlayDark) */
  uploadOverlayError?: string;
  /** Upload progress track color */
  uploadProgressTrack?: string;
  /** Upload progress fill color (falls back to primary) */
  uploadProgressFill?: string;
  /** Upload success badge color (falls back to success) */
  uploadBadgeSuccess?: string;
  /** Upload overlay text color (falls back to textOnPrimary) */
  uploadText?: string;

  // Attachment Picker
  /** Picker overlay background (falls back to overlay) */
  pickerOverlay?: string;
  /** Picker sheet background (falls back to background) */
  pickerBackground?: string;
  /** Picker handle color (falls back to textSecondary) */
  pickerHandle?: string;
  /** Picker option background (falls back to surface) */
  pickerOptionBackground?: string;
  /** Picker option pressed background (falls back to border) */
  pickerOptionBackgroundPressed?: string;
  /** Picker cancel text color (falls back to error) */
  pickerCancelText?: string;

  // Form Container
  /** Form background color (falls back to transparent for modal embedding) */
  formBackground?: string;
}

/**
 * Typography tokens for Harken SDK theming.
 * Allows complete font customization.
 */
export interface HarkenTypography {
  /** Font family for body text */
  fontFamily: string;
  /** Font family for headings (defaults to fontFamily if not set) */
  fontFamilyHeading?: string;

  /** Title text size */
  titleSize: number;
  /** Title line height multiplier */
  titleLineHeight: number;
  /** Title font weight */
  titleWeight: TextWeight;

  /** Body text size */
  bodySize: number;
  /** Body line height multiplier */
  bodyLineHeight: number;
  /** Body font weight */
  bodyWeight: TextWeight;

  /** Label text size (for form labels, chips) */
  labelSize: number;
  /** Label font weight */
  labelWeight: TextWeight;

  /** Caption/small text size */
  captionSize: number;
  /** Caption font weight */
  captionWeight: TextWeight;

  // === COMPONENT TOKENS (optional, fall back to base tokens) ===

  /** Button text size (falls back to labelSize) */
  buttonTextSize?: number;
  /** Button text weight (falls back to labelWeight) */
  buttonTextWeight?: TextWeight;
}

/** Font weight values supported across platforms */
export type TextWeight =
  | "normal"
  | "bold"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

/**
 * Spacing tokens for consistent layout.
 * All values are in logical pixels.
 *
 * Base tokens are required. Component tokens are optional and fall back to base tokens.
 */
export interface HarkenSpacing {
  // === BASE TOKENS (required) ===

  /** Extra small spacing (4px default) */
  xs: number;
  /** Small spacing (8px default) */
  sm: number;
  /** Medium spacing (16px default) */
  md: number;
  /** Large spacing (24px default) */
  lg: number;
  /** Extra large spacing (32px default) */
  xl: number;
  /** 2x extra large spacing (48px default) */
  xxl: number;

  // === COMPONENT TOKENS (optional, fall back to base tokens) ===

  /** Chip vertical padding (falls back to sm) */
  chipPaddingVertical?: number;
  /** Chip horizontal padding (falls back to md) */
  chipPaddingHorizontal?: number;
  /** Gap between chips (falls back to sm) */
  chipGap?: number;
  /** Input padding (falls back to md) */
  inputPadding?: number;
  /** Button vertical padding (falls back to sm) */
  buttonPaddingVertical?: number;
  /** Button horizontal padding (falls back to md) */
  buttonPaddingHorizontal?: number;
  /** Form container padding (falls back to lg) */
  formPadding?: number;
  /** Gap between form sections (falls back to lg) */
  sectionGap?: number;
  /** Gap between attachment tiles (falls back to sm) */
  tileGap?: number;
}

/**
 * Border radius tokens for rounded corners.
 * All values are in logical pixels.
 *
 * Base tokens are required. Component tokens are optional and fall back to base tokens.
 */
export interface HarkenRadii {
  // === BASE TOKENS (required) ===

  /** No radius */
  none: number;
  /** Small radius for subtle rounding (4px default) */
  sm: number;
  /** Medium radius for inputs and cards (8px default) */
  md: number;
  /** Large radius for modals and sheets (16px default) */
  lg: number;
  /** Extra large radius for bottom sheets (20px default) */
  xl: number;
  /** Full/pill radius */
  full: number;

  // === COMPONENT TOKENS (optional, fall back to base tokens) ===

  /** Chip border radius (falls back to full) */
  chip?: number;
  /** Input border radius (falls back to md) */
  input?: number;
  /** Button border radius (falls back to md) */
  button?: number;
  /** Attachment tile border radius (falls back to md) */
  tile?: number;
  /** Form container border radius (falls back to lg) */
  form?: number;
  /** Picker sheet border radius (falls back to xl) */
  picker?: number;
}

/**
 * Sizing tokens for component dimensions.
 * All values are in logical pixels and optional with sensible defaults.
 */
export interface HarkenSizing {
  /** Button minimum height (default: 48) */
  buttonMinHeight?: number;
  /** Input minimum height (default: 44) */
  inputMinHeight?: number;
  /** Attachment tile size (default: 80) */
  tileSize?: number;
  /** Add button icon size (default: 28) */
  addButtonIconSize?: number;
  /** Picker icon container size (default: 44) */
  pickerIconSize?: number;
}

/**
 * Opacity tokens for interactive states.
 * All values are between 0 and 1 and optional with sensible defaults.
 */
export interface HarkenOpacity {
  /** Disabled state opacity (default: 0.6) */
  disabled?: number;
  /** Pressed state opacity (default: 0.8) */
  pressed?: number;
}

/**
 * Input theme object with optional component tokens.
 * Used for theme configuration by consumers.
 */
export interface HarkenTheme {
  colors: HarkenColors;
  typography: HarkenTypography;
  spacing: HarkenSpacing;
  radii: HarkenRadii;
  sizing?: HarkenSizing;
  opacity?: HarkenOpacity;
}

/**
 * Partial theme for overriding specific values.
 * Allows deep partial overrides of any theme token.
 */
export type PartialHarkenTheme = {
  colors?: Partial<HarkenColors>;
  typography?: Partial<HarkenTypography>;
  spacing?: Partial<HarkenSpacing>;
  radii?: Partial<HarkenRadii>;
  sizing?: Partial<HarkenSizing>;
  opacity?: Partial<HarkenOpacity>;
};

/**
 * Theme mode for automatic light/dark theming.
 */
export type ThemeMode = "light" | "dark" | "system";

// ============================================================================
// RESOLVED THEME TYPES
// These types represent the fully-resolved theme after fallback resolution.
// Components should use these types - all values are guaranteed to exist.
// ============================================================================

/**
 * Fully resolved typography tokens with all component tokens populated.
 */
export interface ResolvedHarkenTypography {
  // Base tokens
  fontFamily: string;
  fontFamilyHeading?: string;
  titleSize: number;
  titleLineHeight: number;
  titleWeight: TextWeight;
  bodySize: number;
  bodyLineHeight: number;
  bodyWeight: TextWeight;
  labelSize: number;
  labelWeight: TextWeight;
  captionSize: number;
  captionWeight: TextWeight;

  // Component tokens (all resolved)
  buttonTextSize: number;
  buttonTextWeight: TextWeight;
}

/**
 * Fully resolved color tokens with all component tokens populated.
 * All optional component tokens have been resolved to their fallback values.
 */
export interface ResolvedHarkenColors {
  // Base tokens
  primary: string;
  primaryPressed: string;
  background: string;
  surface: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  textPlaceholder: string;
  textOnPrimary: string;
  border: string;
  borderFocused: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  overlay: string;
  overlayDark: string;
  accent1: string;
  accent2: string;
  accent3: string;

  // Component tokens (all resolved, no longer optional)
  chipBackground: string;
  chipBackgroundSelected: string;
  chipBorder: string;
  chipBorderSelected: string;
  chipText: string;
  chipTextSelected: string;

  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  inputBorderError: string;
  inputText: string;
  inputPlaceholder: string;

  buttonPrimaryBackground: string;
  buttonPrimaryBackgroundPressed: string;
  buttonPrimaryText: string;
  buttonSecondaryBackground: string;
  buttonSecondaryBorder: string;
  buttonSecondaryText: string;
  buttonGhostText: string;

  addButtonBackground: string;
  addButtonBackgroundPressed: string;
  addButtonBorder: string;
  addButtonIcon: string;
  addButtonText: string;

  tileBackground: string;
  tileBorder: string;

  uploadOverlay: string;
  uploadOverlayError: string;
  uploadProgressTrack: string;
  uploadProgressFill: string;
  uploadBadgeSuccess: string;
  uploadText: string;

  pickerOverlay: string;
  pickerBackground: string;
  pickerHandle: string;
  pickerOptionBackground: string;
  pickerOptionBackgroundPressed: string;
  pickerCancelText: string;

  formBackground: string;
}

/**
 * Fully resolved spacing tokens with all component tokens populated.
 */
export interface ResolvedHarkenSpacing {
  // Base tokens
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;

  // Component tokens (all resolved)
  chipPaddingVertical: number;
  chipPaddingHorizontal: number;
  chipGap: number;
  inputPadding: number;
  buttonPaddingVertical: number;
  buttonPaddingHorizontal: number;
  formPadding: number;
  sectionGap: number;
  tileGap: number;
}

/**
 * Fully resolved radii tokens with all component tokens populated.
 */
export interface ResolvedHarkenRadii {
  // Base tokens
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;

  // Component tokens (all resolved)
  chip: number;
  input: number;
  button: number;
  tile: number;
  form: number;
  picker: number;
}

/**
 * Fully resolved sizing tokens.
 */
export interface ResolvedHarkenSizing {
  buttonMinHeight: number;
  inputMinHeight: number;
  tileSize: number;
  addButtonIconSize: number;
  pickerIconSize: number;
}

/**
 * Fully resolved opacity tokens.
 */
export interface ResolvedHarkenOpacity {
  disabled: number;
  pressed: number;
}

/**
 * Structured component token aliases for better discoverability.
 * Maps to flat tokens but grouped by component for ergonomic access.
 */
export interface HarkenComponentTokens {
  chip: {
    background: string;
    backgroundSelected: string;
    border: string;
    borderSelected: string;
    text: string;
    textSelected: string;
    paddingVertical: number;
    paddingHorizontal: number;
    gap: number;
    radius: number;
  };
  input: {
    background: string;
    border: string;
    borderFocused: string;
    borderError: string;
    text: string;
    placeholder: string;
    padding: number;
    radius: number;
    minHeight: number;
  };
  button: {
    primary: {
      background: string;
      backgroundPressed: string;
      text: string;
    };
    secondary: {
      background: string;
      border: string;
      text: string;
    };
    ghost: {
      text: string;
    };
    paddingVertical: number;
    paddingHorizontal: number;
    radius: number;
    minHeight: number;
    textSize: number;
    textWeight: TextWeight;
  };
  addButton: {
    background: string;
    backgroundPressed: string;
    border: string;
    icon: string;
    text: string;
    iconSize: number;
  };
  tile: {
    background: string;
    border: string;
    radius: number;
    size: number;
    gap: number;
  };
  upload: {
    overlay: string;
    overlayError: string;
    progressTrack: string;
    progressFill: string;
    badgeSuccess: string;
    text: string;
  };
  picker: {
    overlay: string;
    background: string;
    handle: string;
    optionBackground: string;
    optionBackgroundPressed: string;
    cancelText: string;
    radius: number;
    iconSize: number;
  };
  form: {
    background: string;
    padding: number;
    sectionGap: number;
    radius: number;
  };
}

/**
 * Fully resolved theme object with all fallbacks applied.
 * This is what components receive - all values are guaranteed to exist.
 */
export interface ResolvedHarkenTheme {
  /** Flat color tokens (for compatibility) */
  colors: ResolvedHarkenColors;
  /** Typography tokens (with component tokens resolved) */
  typography: ResolvedHarkenTypography;
  /** Flat spacing tokens (for compatibility) */
  spacing: ResolvedHarkenSpacing;
  /** Flat radii tokens (for compatibility) */
  radii: ResolvedHarkenRadii;
  /** Sizing tokens */
  sizing: ResolvedHarkenSizing;
  /** Opacity tokens */
  opacity: ResolvedHarkenOpacity;
  /** Structured component tokens (for discoverability) */
  components: HarkenComponentTokens;
}
