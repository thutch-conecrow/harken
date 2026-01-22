import type {
  HarkenColors,
  HarkenTypography,
  HarkenSpacing,
  HarkenRadii,
  HarkenSizing,
  HarkenOpacity,
  HarkenTheme,
  PartialHarkenTheme,
  ResolvedHarkenColors,
  ResolvedHarkenSpacing,
  ResolvedHarkenRadii,
  ResolvedHarkenSizing,
  ResolvedHarkenOpacity,
  ResolvedHarkenTheme,
  HarkenComponentTokens,
} from './types';

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/** Default sizing values */
const DEFAULT_SIZING: ResolvedHarkenSizing = {
  buttonMinHeight: 48,
  inputMinHeight: 44,
  tileSize: 80,
  addButtonIconSize: 28,
  pickerIconSize: 44,
};

/** Default opacity values */
const DEFAULT_OPACITY: ResolvedHarkenOpacity = {
  disabled: 0.6,
  pressed: 0.8,
};

/** Default progress track color (used when no theme-aware value is available) */
const DEFAULT_PROGRESS_TRACK = 'rgba(255, 255, 255, 0.3)';

// ============================================================================
// COLOR RESOLUTION
// ============================================================================

/**
 * Resolves color tokens, applying fallbacks for all component tokens.
 * The resolution order for component tokens is:
 * 1. Explicit component token (e.g., chipBackground)
 * 2. User-provided base token (e.g., surface)
 * 3. Default base token value
 */
function resolveColors(
  input: Partial<HarkenColors> | undefined,
  defaults: HarkenColors
): ResolvedHarkenColors {
  // First resolve base tokens
  const primary = input?.primary ?? defaults.primary;
  const primaryPressed = input?.primaryPressed ?? defaults.primaryPressed;
  const background = input?.background ?? defaults.background;
  // Surface resolution order: explicit surface > explicit backgroundSecondary > defaults.surface > defaults.backgroundSecondary
  const surface = input?.surface ?? input?.backgroundSecondary ?? defaults.surface ?? defaults.backgroundSecondary;
  const backgroundSecondary = input?.backgroundSecondary ?? surface;
  const text = input?.text ?? defaults.text;
  const textSecondary = input?.textSecondary ?? defaults.textSecondary;
  const textPlaceholder = input?.textPlaceholder ?? defaults.textPlaceholder;
  const textOnPrimary = input?.textOnPrimary ?? defaults.textOnPrimary;
  const border = input?.border ?? defaults.border;
  const borderFocused = input?.borderFocused ?? defaults.borderFocused;
  const error = input?.error ?? defaults.error;
  const success = input?.success ?? defaults.success;
  const warning = input?.warning ?? defaults.warning;
  const info = input?.info ?? defaults.info;
  const overlay = input?.overlay ?? defaults.overlay;
  const overlayDark = input?.overlayDark ?? defaults.overlayDark;
  const accent1 = input?.accent1 ?? defaults.accent1;
  const accent2 = input?.accent2 ?? defaults.accent2;
  const accent3 = input?.accent3 ?? defaults.accent3;

  // Now resolve component tokens with fallbacks to base tokens
  return {
    // Base tokens
    primary,
    primaryPressed,
    background,
    surface,
    backgroundSecondary,
    text,
    textSecondary,
    textPlaceholder,
    textOnPrimary,
    border,
    borderFocused,
    error,
    success,
    warning,
    info,
    overlay,
    overlayDark,
    accent1,
    accent2,
    accent3,

    // Chip tokens
    chipBackground: input?.chipBackground ?? surface,
    chipBackgroundSelected: input?.chipBackgroundSelected ?? primary,
    chipBorder: input?.chipBorder ?? border,
    chipBorderSelected: input?.chipBorderSelected ?? primary,
    chipText: input?.chipText ?? text,
    chipTextSelected: input?.chipTextSelected ?? textOnPrimary,

    // Input tokens
    inputBackground: input?.inputBackground ?? surface,
    inputBorder: input?.inputBorder ?? border,
    inputBorderFocused: input?.inputBorderFocused ?? borderFocused,
    inputBorderError: input?.inputBorderError ?? error,
    inputText: input?.inputText ?? text,
    inputPlaceholder: input?.inputPlaceholder ?? textPlaceholder,

    // Button tokens - Primary
    buttonPrimaryBackground: input?.buttonPrimaryBackground ?? primary,
    buttonPrimaryBackgroundPressed: input?.buttonPrimaryBackgroundPressed ?? primaryPressed,
    buttonPrimaryText: input?.buttonPrimaryText ?? textOnPrimary,

    // Button tokens - Secondary
    buttonSecondaryBackground: input?.buttonSecondaryBackground ?? surface,
    buttonSecondaryBorder: input?.buttonSecondaryBorder ?? border,
    buttonSecondaryText: input?.buttonSecondaryText ?? text,

    // Button tokens - Ghost
    buttonGhostText: input?.buttonGhostText ?? text,

    // Add button tokens
    addButtonBackground: input?.addButtonBackground ?? surface,
    addButtonBackgroundPressed: input?.addButtonBackgroundPressed ?? border,
    addButtonBorder: input?.addButtonBorder ?? border,
    addButtonIcon: input?.addButtonIcon ?? textSecondary,
    addButtonText: input?.addButtonText ?? textSecondary,

    // Tile tokens
    tileBackground: input?.tileBackground ?? surface,
    tileBorder: input?.tileBorder ?? border,

    // Upload tokens
    uploadOverlay: input?.uploadOverlay ?? overlay,
    uploadOverlayError: input?.uploadOverlayError ?? overlayDark,
    uploadProgressTrack: input?.uploadProgressTrack ?? DEFAULT_PROGRESS_TRACK,
    uploadProgressFill: input?.uploadProgressFill ?? primary,
    uploadBadgeSuccess: input?.uploadBadgeSuccess ?? success,
    uploadText: input?.uploadText ?? textOnPrimary,

    // Picker tokens
    pickerOverlay: input?.pickerOverlay ?? overlay,
    pickerBackground: input?.pickerBackground ?? background,
    pickerHandle: input?.pickerHandle ?? textSecondary,
    pickerOptionBackground: input?.pickerOptionBackground ?? surface,
    pickerOptionBackgroundPressed: input?.pickerOptionBackgroundPressed ?? border,
    pickerCancelText: input?.pickerCancelText ?? error,

    // Form tokens
    formBackground: input?.formBackground ?? background,
  };
}

// ============================================================================
// SPACING RESOLUTION
// ============================================================================

/**
 * Resolves spacing tokens, applying fallbacks for all component tokens.
 */
function resolveSpacing(
  input: Partial<HarkenSpacing> | undefined,
  defaults: HarkenSpacing
): ResolvedHarkenSpacing {
  // Resolve base tokens
  const xs = input?.xs ?? defaults.xs;
  const sm = input?.sm ?? defaults.sm;
  const md = input?.md ?? defaults.md;
  const lg = input?.lg ?? defaults.lg;
  const xl = input?.xl ?? defaults.xl;
  const xxl = input?.xxl ?? defaults.xxl;

  return {
    // Base tokens
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,

    // Component tokens with fallbacks
    chipPaddingVertical: input?.chipPaddingVertical ?? sm,
    chipPaddingHorizontal: input?.chipPaddingHorizontal ?? md,
    chipGap: input?.chipGap ?? sm,
    inputPadding: input?.inputPadding ?? md,
    buttonPaddingVertical: input?.buttonPaddingVertical ?? sm,
    buttonPaddingHorizontal: input?.buttonPaddingHorizontal ?? md,
    formPadding: input?.formPadding ?? lg,
    sectionGap: input?.sectionGap ?? lg,
    tileGap: input?.tileGap ?? sm,
  };
}

// ============================================================================
// RADII RESOLUTION
// ============================================================================

/**
 * Resolves radii tokens, applying fallbacks for all component tokens.
 */
function resolveRadii(
  input: Partial<HarkenRadii> | undefined,
  defaults: HarkenRadii
): ResolvedHarkenRadii {
  // Resolve base tokens
  const none = input?.none ?? defaults.none;
  const sm = input?.sm ?? defaults.sm;
  const md = input?.md ?? defaults.md;
  const lg = input?.lg ?? defaults.lg;
  const xl = input?.xl ?? defaults.xl;
  const full = input?.full ?? defaults.full;

  return {
    // Base tokens
    none,
    sm,
    md,
    lg,
    xl,
    full,

    // Component tokens with fallbacks
    chip: input?.chip ?? full,
    input: input?.input ?? md,
    button: input?.button ?? md,
    tile: input?.tile ?? md,
    form: input?.form ?? lg,
    picker: input?.picker ?? xl,
  };
}

// ============================================================================
// SIZING RESOLUTION
// ============================================================================

/**
 * Resolves sizing tokens.
 */
function resolveSizing(input: Partial<HarkenSizing> | undefined): ResolvedHarkenSizing {
  return {
    buttonMinHeight: input?.buttonMinHeight ?? DEFAULT_SIZING.buttonMinHeight,
    inputMinHeight: input?.inputMinHeight ?? DEFAULT_SIZING.inputMinHeight,
    tileSize: input?.tileSize ?? DEFAULT_SIZING.tileSize,
    addButtonIconSize: input?.addButtonIconSize ?? DEFAULT_SIZING.addButtonIconSize,
    pickerIconSize: input?.pickerIconSize ?? DEFAULT_SIZING.pickerIconSize,
  };
}

// ============================================================================
// OPACITY RESOLUTION
// ============================================================================

/**
 * Resolves opacity tokens.
 */
function resolveOpacity(input: Partial<HarkenOpacity> | undefined): ResolvedHarkenOpacity {
  return {
    disabled: input?.disabled ?? DEFAULT_OPACITY.disabled,
    pressed: input?.pressed ?? DEFAULT_OPACITY.pressed,
  };
}

// ============================================================================
// TYPOGRAPHY RESOLUTION
// ============================================================================

/**
 * Resolves typography tokens.
 * Typography doesn't have component-specific tokens, just base overrides.
 */
function resolveTypography(
  input: Partial<HarkenTypography> | undefined,
  defaults: HarkenTypography
): HarkenTypography {
  return {
    fontFamily: input?.fontFamily ?? defaults.fontFamily,
    fontFamilyHeading: input?.fontFamilyHeading ?? defaults.fontFamilyHeading,
    titleSize: input?.titleSize ?? defaults.titleSize,
    titleLineHeight: input?.titleLineHeight ?? defaults.titleLineHeight,
    titleWeight: input?.titleWeight ?? defaults.titleWeight,
    bodySize: input?.bodySize ?? defaults.bodySize,
    bodyLineHeight: input?.bodyLineHeight ?? defaults.bodyLineHeight,
    bodyWeight: input?.bodyWeight ?? defaults.bodyWeight,
    labelSize: input?.labelSize ?? defaults.labelSize,
    labelWeight: input?.labelWeight ?? defaults.labelWeight,
    captionSize: input?.captionSize ?? defaults.captionSize,
    captionWeight: input?.captionWeight ?? defaults.captionWeight,
  };
}

// ============================================================================
// COMPONENT ALIASES
// ============================================================================

/**
 * Builds the structured component token aliases from resolved flat tokens.
 * This provides an ergonomic grouped API for accessing theme values.
 */
function buildComponentAliases(
  colors: ResolvedHarkenColors,
  spacing: ResolvedHarkenSpacing,
  radii: ResolvedHarkenRadii,
  sizing: ResolvedHarkenSizing,
  opacity: ResolvedHarkenOpacity
): HarkenComponentTokens {
  return {
    chip: {
      background: colors.chipBackground,
      backgroundSelected: colors.chipBackgroundSelected,
      border: colors.chipBorder,
      borderSelected: colors.chipBorderSelected,
      text: colors.chipText,
      textSelected: colors.chipTextSelected,
      paddingVertical: spacing.chipPaddingVertical,
      paddingHorizontal: spacing.chipPaddingHorizontal,
      gap: spacing.chipGap,
      radius: radii.chip,
    },
    input: {
      background: colors.inputBackground,
      border: colors.inputBorder,
      borderFocused: colors.inputBorderFocused,
      borderError: colors.inputBorderError,
      text: colors.inputText,
      placeholder: colors.inputPlaceholder,
      padding: spacing.inputPadding,
      radius: radii.input,
      minHeight: sizing.inputMinHeight,
    },
    button: {
      primary: {
        background: colors.buttonPrimaryBackground,
        backgroundPressed: colors.buttonPrimaryBackgroundPressed,
        text: colors.buttonPrimaryText,
      },
      secondary: {
        background: colors.buttonSecondaryBackground,
        border: colors.buttonSecondaryBorder,
        text: colors.buttonSecondaryText,
      },
      ghost: {
        text: colors.buttonGhostText,
      },
      paddingVertical: spacing.buttonPaddingVertical,
      paddingHorizontal: spacing.buttonPaddingHorizontal,
      radius: radii.button,
      minHeight: sizing.buttonMinHeight,
    },
    addButton: {
      background: colors.addButtonBackground,
      backgroundPressed: colors.addButtonBackgroundPressed,
      border: colors.addButtonBorder,
      icon: colors.addButtonIcon,
      text: colors.addButtonText,
      iconSize: sizing.addButtonIconSize,
    },
    tile: {
      background: colors.tileBackground,
      border: colors.tileBorder,
      radius: radii.tile,
      size: sizing.tileSize,
      gap: spacing.tileGap,
    },
    upload: {
      overlay: colors.uploadOverlay,
      overlayError: colors.uploadOverlayError,
      progressTrack: colors.uploadProgressTrack,
      progressFill: colors.uploadProgressFill,
      badgeSuccess: colors.uploadBadgeSuccess,
      text: colors.uploadText,
    },
    picker: {
      overlay: colors.pickerOverlay,
      background: colors.pickerBackground,
      handle: colors.pickerHandle,
      optionBackground: colors.pickerOptionBackground,
      optionBackgroundPressed: colors.pickerOptionBackgroundPressed,
      cancelText: colors.pickerCancelText,
      radius: radii.picker,
      iconSize: sizing.pickerIconSize,
    },
    form: {
      background: colors.formBackground,
      padding: spacing.formPadding,
      sectionGap: spacing.sectionGap,
      radius: radii.form,
    },
  };
}

// ============================================================================
// MAIN RESOLVER
// ============================================================================

/**
 * Resolves a theme by merging user overrides with a base theme and applying
 * all fallback rules. Returns a fully-resolved theme where all values are
 * guaranteed to exist.
 *
 * This is the single source of truth for fallback logic. Components should
 * never do their own `??` checks - they receive a resolved theme with all
 * values populated.
 *
 * @param baseTheme - The base theme (light or dark)
 * @param overrides - User-provided partial overrides
 * @returns A fully resolved theme with all component tokens populated
 */
export function resolveTheme(
  baseTheme: HarkenTheme,
  overrides?: PartialHarkenTheme
): ResolvedHarkenTheme {
  // Resolve each category
  const colors = resolveColors(overrides?.colors, baseTheme.colors);
  const typography = resolveTypography(overrides?.typography, baseTheme.typography);
  const spacing = resolveSpacing(overrides?.spacing, baseTheme.spacing);
  const radii = resolveRadii(overrides?.radii, baseTheme.radii);
  const sizing = resolveSizing(overrides?.sizing);
  const opacity = resolveOpacity(overrides?.opacity);

  // Build component aliases
  const components = buildComponentAliases(colors, spacing, radii, sizing, opacity);

  return {
    colors,
    typography,
    spacing,
    radii,
    sizing,
    opacity,
    components,
  };
}
