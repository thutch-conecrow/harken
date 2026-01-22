/**
 * Mock @react-native-async-storage/async-storage for testing.
 */

const storage = new Map<string, string>();

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    return storage.get(key) ?? null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    storage.set(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    storage.delete(key);
  },

  clear: async (): Promise<void> => {
    storage.clear();
  },

  getAllKeys: async (): Promise<string[]> => {
    return Array.from(storage.keys());
  },

  multiGet: async (keys: string[]): Promise<readonly [string, string | null][]> => {
    return keys.map((key) => [key, storage.get(key) ?? null]);
  },

  multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
    keyValuePairs.forEach(([key, value]) => storage.set(key, value));
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    keys.forEach((key) => storage.delete(key));
  },
};

// Helper to clear storage between tests
export function __clearStorage(): void {
  storage.clear();
}

export default AsyncStorage;
