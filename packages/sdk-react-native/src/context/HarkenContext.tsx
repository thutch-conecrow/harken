import React, { createContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import type { HarkenTheme, ThemeMode } from '../theme';
import { lightTheme, darkTheme, createTheme } from '../theme';
import type { HarkenConfig, HarkenProviderProps } from '../types';

/**
 * Context value provided by HarkenProvider.
 */
export interface HarkenContextValue {
  /** The resolved theme based on mode and overrides */
  theme: HarkenTheme;
  /** Current theme mode */
  themeMode: ThemeMode;
  /** Whether dark mode is currently active */
  isDarkMode: boolean;
  /** SDK configuration */
  config: HarkenConfig;
}

/**
 * React context for Harken SDK state.
 * @internal
 */
export const HarkenContext = createContext<HarkenContextValue | null>(null);

/**
 * Provider component that configures the Harken SDK.
 *
 * Wrap your app with this provider to enable Harken feedback components.
 *
 * @example
 * ```tsx
 * import { HarkenProvider } from '@harken/sdk-react-native';
 *
 * function App() {
 *   return (
 *     <HarkenProvider
 *       config={{
 *         publishableKey: 'pk_live_xxxx',
 *       }}
 *       themeMode="system"
 *     >
 *       <YourApp />
 *     </HarkenProvider>
 *   );
 * }
 * ```
 */
export function HarkenProvider({
  config,
  themeMode = 'system',
  lightTheme: lightOverrides,
  darkTheme: darkOverrides,
  children,
}: HarkenProviderProps): React.JSX.Element {
  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Determine if dark mode should be active
  const isDarkMode = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    // 'system' mode - follow device preference
    return systemColorScheme === 'dark';
  }, [themeMode, systemColorScheme]);

  // Build the resolved theme
  const theme = useMemo(() => {
    const baseTheme = isDarkMode ? darkTheme : lightTheme;
    const overrides = isDarkMode ? darkOverrides : lightOverrides;
    return createTheme(baseTheme, overrides);
  }, [isDarkMode, lightOverrides, darkOverrides]);

  // Memoize the context value
  const contextValue = useMemo<HarkenContextValue>(
    () => ({
      theme,
      themeMode,
      isDarkMode,
      config,
    }),
    [theme, themeMode, isDarkMode, config]
  );

  return (
    <HarkenContext.Provider value={contextValue}>
      {children}
    </HarkenContext.Provider>
  );
}
