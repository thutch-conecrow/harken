import React, { createContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import type { ResolvedHarkenTheme, ThemeMode } from "../theme";
import { lightTheme, darkTheme, resolveTheme } from "../theme";
import type { HarkenConfig, HarkenProviderProps } from "../types";
import { IdentityStore, createDefaultStorage } from "../storage";
import { HarkenClient } from "../api/client";

/**
 * Context value provided by HarkenProvider.
 */
export interface HarkenContextValue {
  /** The resolved theme with all fallbacks applied */
  theme: ResolvedHarkenTheme;
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
 * By default, uses expo-secure-store for persistent anonymous ID storage
 * (falls back to in-memory storage if not available).
 *
 * @example
 * ```tsx
 * import { HarkenProvider, FeedbackSheet } from '@harkenapp/sdk-react-native';
 *
 * function App() {
 *   return (
 *     <HarkenProvider config={{ publishableKey: 'pk_live_xxxx' }}>
 *       <FeedbackSheet />
 *     </HarkenProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom theme for modal embedding
 * <HarkenProvider
 *   config={{ publishableKey: 'pk_live_xxxx' }}
 *   themeMode="dark"
 *   darkTheme={{
 *     colors: {
 *       surface: '#2d2d2d',
 *       chipBackground: '#3d3d3d',
 *       formBackground: 'transparent',
 *     },
 *   }}
 * >
 *   <FeedbackSheet layout="auto" />
 * </HarkenProvider>
 * ```
 */
export function HarkenProvider({
  config,
  themeMode = "system",
  lightTheme: lightOverrides,
  darkTheme: darkOverrides,
  storage,
  children,
}: HarkenProviderProps): React.JSX.Element {
  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Determine if dark mode should be active
  const isDarkMode = useMemo(() => {
    if (themeMode === "dark") return true;
    if (themeMode === "light") return false;
    // 'system' mode - follow device preference
    return systemColorScheme === "dark";
  }, [themeMode, systemColorScheme]);

  // Build the resolved theme using the centralized resolver
  const theme = useMemo(() => {
    const baseTheme = isDarkMode ? darkTheme : lightTheme;
    const overrides = isDarkMode ? darkOverrides : lightOverrides;
    return resolveTheme(baseTheme, overrides);
  }, [isDarkMode, lightOverrides, darkOverrides]);

  // Create identity store (memoized to persist across re-renders)
  // Uses expo-secure-store by default if available, otherwise falls back to memory
  const identityStore = useMemo(() => {
    const storageImpl = storage ?? createDefaultStorage();
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

  // Note: Upload queue service initialization has been moved to the attachments module.
  // When using attachments, the service is initialized when useAttachmentUpload is first called.

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

  return <HarkenContext.Provider value={contextValue}>{children}</HarkenContext.Provider>;
}
