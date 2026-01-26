// Theme type exports
export type {
  HarkenColors,
  HarkenTypography,
  HarkenSpacing,
  HarkenRadii,
  HarkenSizing,
  HarkenOpacity,
  HarkenTheme,
  PartialHarkenTheme,
  TextWeight,
  ThemeMode,
  // Resolved theme types
  ResolvedHarkenColors,
  ResolvedHarkenTypography,
  ResolvedHarkenSpacing,
  ResolvedHarkenRadii,
  ResolvedHarkenSizing,
  ResolvedHarkenOpacity,
  ResolvedHarkenTheme,
  HarkenComponentTokens,
} from "./types";

// Default theme exports
export {
  lightColors,
  darkColors,
  defaultTypography,
  defaultSpacing,
  defaultRadii,
  lightTheme,
  darkTheme,
  createTheme,
} from "./defaults";

// Theme resolver
export { resolveTheme } from "./resolver";
