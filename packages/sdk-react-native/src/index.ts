/**
 * Harken React Native SDK
 *
 * A mobile-first feedback SDK for React Native and Expo applications.
 *
 * @packageDocumentation
 */

// Provider and context
export { HarkenProvider } from './context';
export type { HarkenContextValue } from './context';

// Hooks
export { useHarkenTheme, useHarkenContext } from './hooks';

// Theme system
export type {
  HarkenColors,
  HarkenTypography,
  HarkenSpacing,
  HarkenRadii,
  HarkenTheme,
  PartialHarkenTheme,
  TextWeight,
  ThemeMode,
} from './theme';

export {
  lightColors,
  darkColors,
  defaultTypography,
  defaultSpacing,
  defaultRadii,
  lightTheme,
  darkTheme,
  createTheme,
} from './theme';

// Configuration types
export type {
  HarkenConfig,
  HarkenProviderProps,
  FeedbackCategory,
  Platform,
  DeviceMetadata,
} from './types';
