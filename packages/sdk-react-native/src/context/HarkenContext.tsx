import React, { createContext, useEffect, useMemo, useRef } from 'react';
import { useColorScheme } from 'react-native';
import type { HarkenTheme, ThemeMode } from '../theme';
import { lightTheme, darkTheme, createTheme } from '../theme';
import type { HarkenConfig, HarkenProviderProps } from '../types';
import { IdentityStore, createMemoryStorage } from '../storage';
import { HarkenClient } from '../api/client';
import { uploadQueueService } from '../services';

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
  /** Identity store for anonymous ID management */
  identityStore: IdentityStore;
  /** API client instance */
  client: HarkenClient;
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
 * import { HarkenProvider, createSecureStoreAdapter } from '@harken/sdk-react-native';
 * import * as SecureStore from 'expo-secure-store';
 *
 * const storage = createSecureStoreAdapter(SecureStore);
 *
 * function App() {
 *   return (
 *     <HarkenProvider
 *       config={{
 *         publishableKey: 'pk_live_xxxx',
 *       }}
 *       storage={storage}
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
  storage,
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

  // Create identity store (memoized to persist across re-renders)
  const identityStore = useMemo(() => {
    const storageImpl = storage ?? createMemoryStorage();
    return new IdentityStore(storageImpl);
  }, [storage]);

  // Create API client (memoized)
  const client = useMemo(() => {
    return new HarkenClient({
      publishableKey: config.publishableKey,
      userToken: config.userToken,
      baseUrl: config.apiBaseUrl,
    });
  }, [config.publishableKey, config.userToken, config.apiBaseUrl]);

  // Initialize upload queue service ONCE at app startup (D2)
  // This prevents the race condition where uploads complete before callbacks are registered
  const isQueueInitialized = useRef(false);

  useEffect(() => {
    if (isQueueInitialized.current) return;
    isQueueInitialized.current = true;

    void uploadQueueService.initialize({
      client,
      debug: config.debug,
    });
  }, [client, config.debug]);

  // Memoize the context value
  const contextValue = useMemo<HarkenContextValue>(
    () => ({
      theme,
      themeMode,
      isDarkMode,
      config,
      identityStore,
      client,
    }),
    [theme, themeMode, isDarkMode, config, identityStore, client]
  );

  return (
    <HarkenContext.Provider value={contextValue}>
      {children}
    </HarkenContext.Provider>
  );
}
