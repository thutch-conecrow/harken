import { useContext } from "react";
import { HarkenContext } from "../context";
import type { ResolvedHarkenTheme } from "../theme";

/**
 * Hook to access the current Harken theme.
 *
 * Must be used within a HarkenProvider.
 *
 * Returns a fully-resolved theme with all component tokens populated.
 * You can access tokens in two ways:
 * - Flat: `theme.colors.chipBackground`
 * - Structured: `theme.components.chip.background`
 *
 * @returns The resolved theme object with all fallbacks applied
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
 *
 * @example
 * ```tsx
 * // Using structured component tokens
 * function ChipComponent() {
 *   const theme = useHarkenTheme();
 *   const { chip } = theme.components;
 *
 *   return (
 *     <View style={{
 *       backgroundColor: chip.background,
 *       borderRadius: chip.radius,
 *       padding: chip.paddingVertical,
 *     }}>
 *       <Text style={{ color: chip.text }}>Label</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useHarkenTheme(): ResolvedHarkenTheme {
  const context = useContext(HarkenContext);

  if (!context) {
    throw new Error("useHarkenTheme must be used within a HarkenProvider");
  }

  return context.theme;
}
