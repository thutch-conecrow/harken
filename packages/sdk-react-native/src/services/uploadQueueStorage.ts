/**
 * Persistent storage for the upload queue.
 *
 * Uses AsyncStorage to persist queue state across app restarts.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PersistedQueue, QueueItem } from "../domain";

const STORAGE_KEY = "@harkenapp/upload-queue";
const CURRENT_VERSION = 1;

/**
 * Manages persistent storage of the upload queue.
 */
export class UploadQueueStorage {
  /**
   * Load queue items from persistent storage.
   * Returns empty array if no queue exists or on error.
   */
  async loadQueue(): Promise<QueueItem[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as PersistedQueue;

      // Handle version migrations
      if (parsed.version !== CURRENT_VERSION) {
        return this.migrateQueue(parsed);
      }

      return parsed.items;
    } catch (error) {
      console.error("[UploadQueueStorage] Failed to load queue:", error);
      return [];
    }
  }

  /**
   * Save queue items to persistent storage.
   */
  async saveQueue(items: QueueItem[]): Promise<void> {
    try {
      const data: PersistedQueue = {
        version: CURRENT_VERSION,
        items,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("[UploadQueueStorage] Failed to save queue:", error);
    }
  }

  /**
   * Clear all persisted queue data.
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("[UploadQueueStorage] Failed to clear queue:", error);
    }
  }

  /**
   * Migrate queue data from older versions.
   * For now, unknown versions are reset to empty.
   */
  private migrateQueue(data: PersistedQueue): QueueItem[] {
    console.warn(`[UploadQueueStorage] Unknown queue version ${data.version}, resetting`);
    return [];
  }
}
