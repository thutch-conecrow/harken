import { useState, useEffect, useContext } from "react";
import { HarkenContext } from "../context";

/**
 * Hook to access the anonymous ID for the current installation.
 *
 * The anonymous ID is a stable UUID that persists across app sessions.
 * It's generated once and stored securely on the device.
 *
 * @returns Object with the anonymous ID and loading state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { anonymousId, isLoading } = useAnonymousId();
 *
 *   if (isLoading) {
 *     return <Text>Loading...</Text>;
 *   }
 *
 *   return <Text>ID: {anonymousId}</Text>;
 * }
 * ```
 */
export function useAnonymousId(): {
  /** The anonymous ID, or null while loading */
  anonymousId: string | null;
  /** True while the ID is being loaded from storage */
  isLoading: boolean;
} {
  const context = useContext(HarkenContext);

  if (!context) {
    throw new Error("useAnonymousId must be used within a HarkenProvider");
  }

  // Capture identityStore to satisfy TypeScript narrowing in useEffect
  const { identityStore } = context;

  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAnonymousId() {
      try {
        const id = await identityStore.getAnonymousId();
        if (mounted) {
          setAnonymousId(id);
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAnonymousId();

    return () => {
      mounted = false;
    };
  }, [identityStore]);

  return { anonymousId, isLoading };
}
