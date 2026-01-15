/**
 * Interface for secure key-value storage.
 * Default implementation uses expo-secure-store.
 * Can be replaced with custom implementations.
 */
export interface SecureStorage {
  /**
   * Retrieve a value from secure storage.
   * @param key - The key to retrieve
   * @returns The stored value, or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Store a value in secure storage.
   * @param key - The key to store under
   * @param value - The value to store
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove a value from secure storage.
   * @param key - The key to remove
   */
  deleteItem(key: string): Promise<void>;
}

/**
 * Storage keys used by the Harken SDK.
 * @internal
 */
export const STORAGE_KEYS = {
  ANON_ID: 'harken_anon_id',
} as const;
