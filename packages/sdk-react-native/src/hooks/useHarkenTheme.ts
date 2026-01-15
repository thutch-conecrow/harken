import { useContext } from 'react';
import { HarkenContext } from '../context';
import type { HarkenTheme } from '../theme';

/**
 * Hook to access the current Harken theme.
 *
 * Must be used within a HarkenProvider.
 *
 * @returns The resolved HarkenTheme object
 * @throws Error if used outside of HarkenProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const theme = useHarkenTheme();
 *
 *   return (
 *     <View style={{ backgroundColor: theme.colors.background }}>
 *       <Text style={{ color: theme.colors.text }}>
 *         Hello
 *       </Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useHarkenTheme(): HarkenTheme {
  const context = useContext(HarkenContext);

  if (!context) {
    throw new Error('useHarkenTheme must be used within a HarkenProvider');
  }

  return context.theme;
}
