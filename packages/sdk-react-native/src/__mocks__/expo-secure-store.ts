/**
 * Mock expo-secure-store for testing.
 */

const storage = new Map<string, string>();

export async function getItemAsync(key: string): Promise<string | null> {
  return storage.get(key) ?? null;
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  storage.set(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  storage.delete(key);
}

// Helper to clear storage between tests
export function __clearStorage(): void {
  storage.clear();
}

export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
  __clearStorage,
};
