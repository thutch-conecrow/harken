import { useContext } from 'react';
import { HarkenContext } from '../context';
import type { HarkenContextValue } from '../context';

/**
 * Hook to access the full Harken context.
 *
 * Provides access to theme, config, and SDK state.
 * Must be used within a HarkenProvider.
 *
 * @returns The full HarkenContextValue
 * @throws Error if used outside of HarkenProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, isDarkMode, config } = useHarkenContext();
 *
 *   return (
 *     <View>
 *       <Text>Dark mode: {isDarkMode ? 'on' : 'off'}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useHarkenContext(): HarkenContextValue {
  const context = useContext(HarkenContext);

  if (!context) {
    throw new Error('useHarkenContext must be used within a HarkenProvider');
  }

  return context;
}
