import type { SecureStorage } from "./types";
import { STORAGE_KEYS } from "./types";
import { generateUUID } from "../utils";

/**
 * Manages anonymous identity persistence.
 *
 * The identity store generates and persists a stable anonymous ID
 * that uniquely identifies the app installation without collecting PII.
 */
export class IdentityStore {
  private storage: SecureStorage;
  private cachedAnonId: string | null = null;
  private initPromise: Promise<string> | null = null;

  constructor(storage: SecureStorage) {
    this.storage = storage;
  }

  /**
   * Get the anonymous ID, creating one if it doesn't exist.
   *
   * This method is safe to call multiple times concurrently.
   * The ID is cached after first retrieval/creation.
   *
   * @returns The stable anonymous ID for this installation
   */
  async getAnonymousId(): Promise<string> {
    // Return cached value if available
    if (this.cachedAnonId) {
      return this.cachedAnonId;
    }

    // Ensure only one initialization happens
    if (!this.initPromise) {
      this.initPromise = this.initializeAnonymousId();
    }

    return this.initPromise;
  }

  /**
   * Initialize the anonymous ID by loading from storage or generating a new one.
   */
  private async initializeAnonymousId(): Promise<string> {
    try {
      // Try to load existing ID
      const existingId = await this.storage.getItem(STORAGE_KEYS.ANON_ID);

      if (existingId && this.isValidUUID(existingId)) {
        this.cachedAnonId = existingId;
        return existingId;
      }

      // Generate and persist a new ID
      const newId = generateUUID();
      await this.storage.setItem(STORAGE_KEYS.ANON_ID, newId);
      this.cachedAnonId = newId;
      return newId;
    } catch {
      // If storage fails, generate a transient ID
      // This ensures the SDK still works even if storage is unavailable
      const fallbackId = generateUUID();
      this.cachedAnonId = fallbackId;
      return fallbackId;
    }
  }

  /**
   * Clear the stored anonymous ID.
   *
   * After calling this, the next call to getAnonymousId will generate a new ID.
   * Use this for "reset" functionality or testing.
   */
  async clearAnonymousId(): Promise<void> {
    this.cachedAnonId = null;
    this.initPromise = null;
    await this.storage.deleteItem(STORAGE_KEYS.ANON_ID);
  }

  /**
   * Validate that a string is a valid UUID v4 format.
   */
  private isValidUUID(value: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
