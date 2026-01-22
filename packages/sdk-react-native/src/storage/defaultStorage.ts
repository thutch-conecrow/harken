import type { SecureStorage } from "./types";
import { createMemoryStorage } from "./SecureStoreAdapter";

/**
 * Cached default storage instance.
 * @internal
 */
let defaultStorageInstance: SecureStorage | null = null;

/**
 * Whether we've already attempted to load expo-secure-store.
 * @internal
 */
let hasAttemptedLoad = false;

/**
 * Creates or returns the default storage implementation.
 *
 * Attempts to use expo-secure-store if available, falling back to
 * in-memory storage if not installed or if loading fails.
 *
 * @internal
 */
export async function getDefaultStorage(): Promise<SecureStorage> {
  if (defaultStorageInstance) {
    return defaultStorageInstance;
  }

  if (!hasAttemptedLoad) {
    hasAttemptedLoad = true;

    try {
      // Dynamically import expo-secure-store
      const SecureStore = await import("expo-secure-store");

      defaultStorageInstance = {
        async getItem(key: string): Promise<string | null> {
          return SecureStore.getItemAsync(key);
        },
        async setItem(key: string, value: string): Promise<void> {
          await SecureStore.setItemAsync(key, value);
        },
        async deleteItem(key: string): Promise<void> {
          await SecureStore.deleteItemAsync(key);
        },
      };

      return defaultStorageInstance;
    } catch {
      // expo-secure-store not available, fall back to memory storage
      console.warn(
        "[Harken] expo-secure-store not available. Using in-memory storage. " +
          "Anonymous IDs will not persist across app restarts. " +
          "Install expo-secure-store for persistent storage."
      );
    }
  }

  // Fall back to memory storage
  if (!defaultStorageInstance) {
    defaultStorageInstance = createMemoryStorage();
  }

  return defaultStorageInstance;
}

/**
 * Synchronously creates a storage implementation.
 *
 * Returns a lazy wrapper that will resolve to expo-secure-store if available,
 * or memory storage if not. The actual storage is initialized on first use.
 *
 * @internal
 */
export function createDefaultStorage(): SecureStorage {
  // Return a lazy wrapper that initializes on first use
  let resolvedStorage: SecureStorage | null = null;
  let initPromise: Promise<SecureStorage> | null = null;

  const ensureInitialized = async (): Promise<SecureStorage> => {
    if (resolvedStorage) {
      return resolvedStorage;
    }

    if (!initPromise) {
      initPromise = getDefaultStorage().then((storage) => {
        resolvedStorage = storage;
        return storage;
      });
    }

    return initPromise;
  };

  return {
    async getItem(key: string): Promise<string | null> {
      const storage = await ensureInitialized();
      return storage.getItem(key);
    },
    async setItem(key: string, value: string): Promise<void> {
      const storage = await ensureInitialized();
      await storage.setItem(key, value);
    },
    async deleteItem(key: string): Promise<void> {
      const storage = await ensureInitialized();
      await storage.deleteItem(key);
    },
  };
}
