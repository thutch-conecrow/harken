import { useState, useEffect, useCallback } from "react";

/**
 * Result from usePressedState hook.
 */
export interface UsePressedStateResult {
  /** Whether the component is currently pressed */
  isPressed: boolean;
  /** Handler for onPressIn event */
  onPressIn: () => void;
  /** Handler for onPressOut event */
  onPressOut: () => void;
}

/**
 * Hook to manage pressed state for Pressable components.
 *
 * This hook provides NativeWind 4.x compatibility by using useState
 * instead of Pressable's function-style style prop, which is broken
 * by NativeWind's CSS interop system.
 *
 * @param disabled - Whether the component is disabled. When disabled
 *   changes to true, pressed state is automatically reset to prevent
 *   "stuck" pressed visual state.
 *
 * @example
 * ```tsx
 * function MyButton({ disabled, onPress }) {
 *   const { isPressed, onPressIn, onPressOut } = usePressedState(disabled);
 *
 *   return (
 *     <Pressable
 *       disabled={disabled}
 *       onPress={onPress}
 *       onPressIn={onPressIn}
 *       onPressOut={onPressOut}
 *       style={[
 *         styles.button,
 *         isPressed && !disabled && styles.buttonPressed,
 *       ]}
 *     >
 *       <Text>Press me</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */
export function usePressedState(disabled?: boolean): UsePressedStateResult {
  const [isPressed, setIsPressed] = useState(false);

  // Reset pressed state when disabled changes to true
  // Prevents "stuck" pressed style if disabled while pressing
  useEffect(() => {
    if (disabled) {
      setIsPressed(false);
    }
  }, [disabled]);

  const onPressIn = useCallback(() => setIsPressed(true), []);
  const onPressOut = useCallback(() => setIsPressed(false), []);

  return { isPressed, onPressIn, onPressOut };
}
