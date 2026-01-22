import type { SecureStorage } from "./types";

/**
 * Adapter for expo-secure-store.
 *
 * This adapter wraps expo-secure-store to implement the SecureStorage interface.
 * It dynamically imports expo-secure-store to avoid bundling issues when not used.
 *
 * @example
 * ```tsx
 * import { createSecureStoreAdapter } from '@harkenapp/sdk-react-native';
 * import * as SecureStore from 'expo-secure-store';
 *
 * const storage = createSecureStoreAdapter(SecureStore);
 * ```
 */
export function createSecureStoreAdapter(secureStore: {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
}): SecureStorage {
  return {
    async getItem(key: string): Promise<string | null> {
      return secureStore.getItemAsync(key);
    },

    async setItem(key: string, value: string): Promise<void> {
      await secureStore.setItemAsync(key, value);
    },

    async deleteItem(key: string): Promise<void> {
      await secureStore.deleteItemAsync(key);
    },
  };
}

/**
 * In-memory storage for testing or when secure storage is unavailable.
 * Values are not persisted across app restarts.
 *
 * @internal
 */
export function createMemoryStorage(): SecureStorage {
  const storage = new Map<string, string>();

  return {
    async getItem(key: string): Promise<string | null> {
      return storage.get(key) ?? null;
    },

    async setItem(key: string, value: string): Promise<void> {
      storage.set(key, value);
    },

    async deleteItem(key: string): Promise<void> {
      storage.delete(key);
    },
  };
}
