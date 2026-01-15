/**
 * Color tokens for Harken SDK theming.
 * All colors support full override by host apps.
 */
export interface HarkenColors {
  /** Primary brand color for buttons and accents */
  primary: string;
  /** Darker variant of primary for pressed states */
  primaryPressed: string;
  /** Background color for the feedback form */
  background: string;
  /** Secondary background (cards, inputs) */
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

  /** Label text size (for buttons, form labels) */
  labelSize: number;
  /** Label font weight */
  labelWeight: TextWeight;

  /** Caption/small text size */
  captionSize: number;
  /** Caption font weight */
  captionWeight: TextWeight;
}

/** Font weight values supported across platforms */
export type TextWeight =
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

/**
 * Spacing tokens for consistent layout.
 * All values are in logical pixels.
 */
export interface HarkenSpacing {
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
}

/**
 * Border radius tokens for rounded corners.
 * All values are in logical pixels.
 */
export interface HarkenRadii {
  /** No radius */
  none: number;
  /** Small radius for subtle rounding (4px default) */
  sm: number;
  /** Medium radius for inputs and cards (8px default) */
  md: number;
  /** Large radius for modals and sheets (16px default) */
  lg: number;
  /** Full/pill radius */
  full: number;
}

/**
 * Complete theme object combining all token types.
 */
export interface HarkenTheme {
  colors: HarkenColors;
  typography: HarkenTypography;
  spacing: HarkenSpacing;
  radii: HarkenRadii;
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
};

/**
 * Theme mode for automatic light/dark theming.
 */
export type ThemeMode = 'light' | 'dark' | 'system';
