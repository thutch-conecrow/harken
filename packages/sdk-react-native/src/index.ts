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
export { useHarkenTheme, useHarkenContext, useAnonymousId } from './hooks';

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

// Storage and identity
export type { SecureStorage } from './storage';
export {
  createSecureStoreAdapter,
  createMemoryStorage,
  IdentityStore,
} from './storage';

// Utilities
export { generateUUID } from './utils';

// Configuration types
export type {
  HarkenConfig,
  HarkenProviderProps,
  FeedbackCategory,
  Platform,
  DeviceMetadata,
} from './types';
