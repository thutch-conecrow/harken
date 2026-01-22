import { describe, it, expect, vi, beforeEach } from "vitest";
import { IdentityStore } from "./IdentityStore";
import { STORAGE_KEYS } from "./types";
import type { SecureStorage } from "./types";
import * as utils from "../utils";

// Mock generateUUID
vi.mock("../utils", () => ({
  generateUUID: vi.fn(),
}));

const mockGenerateUUID = vi.mocked(utils.generateUUID);

function createMockStorage(): SecureStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: vi.fn(async (key: string) => data.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      data.set(key, value);
    }),
    deleteItem: vi.fn(async (key: string) => {
      data.delete(key);
    }),
  };
}

describe("IdentityStore", () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let identityStore: IdentityStore;
  let uuidCounter: number;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage = createMockStorage();
    identityStore = new IdentityStore(mockStorage);

    // Reset UUID counter and set up mock to return predictable values
    uuidCounter = 0;
    mockGenerateUUID.mockImplementation(() => {
      uuidCounter++;
      return `mock-uuid-${uuidCounter}`;
    });
  });

  describe("getAnonymousId", () => {
    it("generates and stores new ID when none exists", async () => {
      const id = await identityStore.getAnonymousId();

      expect(id).toBe("mock-uuid-1");
      expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.ANON_ID, "mock-uuid-1");
    });

    it("returns existing ID from storage", async () => {
      mockStorage.data.set(STORAGE_KEYS.ANON_ID, "12345678-1234-4123-8123-123456789012");

      const id = await identityStore.getAnonymousId();

      expect(id).toBe("12345678-1234-4123-8123-123456789012");
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it("caches ID after first retrieval", async () => {
      const id1 = await identityStore.getAnonymousId();
      const id2 = await identityStore.getAnonymousId();
      const id3 = await identityStore.getAnonymousId();

      expect(id1).toBe(id2);
      expect(id2).toBe(id3);
      // getItem should only be called once (during first retrieval)
      expect(mockStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it("handles concurrent calls correctly", async () => {
      // Call getAnonymousId multiple times concurrently
      const [id1, id2, id3] = await Promise.all([
        identityStore.getAnonymousId(),
        identityStore.getAnonymousId(),
        identityStore.getAnonymousId(),
      ]);

      // All should return the same ID
      expect(id1).toBe(id2);
      expect(id2).toBe(id3);
      // Storage should only be accessed once
      expect(mockStorage.getItem).toHaveBeenCalledTimes(1);
      expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it("generates new ID if stored value is invalid UUID", async () => {
      mockStorage.data.set(STORAGE_KEYS.ANON_ID, "invalid-not-a-uuid");

      const id = await identityStore.getAnonymousId();

      // Should generate new valid UUID
      expect(id).toBe("mock-uuid-1");
      expect(mockStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.ANON_ID, "mock-uuid-1");
    });

    it("generates fallback ID if storage throws", async () => {
      mockStorage.getItem = vi.fn().mockRejectedValue(new Error("Storage error"));

      const id = await identityStore.getAnonymousId();

      // Should return a fallback UUID (not persisted)
      expect(id).toBe("mock-uuid-1");
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("clearAnonymousId", () => {
    it("clears cached and stored ID", async () => {
      // First, get an ID to populate cache
      await identityStore.getAnonymousId();

      // Clear it
      await identityStore.clearAnonymousId();

      expect(mockStorage.deleteItem).toHaveBeenCalledWith(STORAGE_KEYS.ANON_ID);
    });

    it("generates new ID after clear", async () => {
      const id1 = await identityStore.getAnonymousId();
      expect(id1).toBe("mock-uuid-1");

      await identityStore.clearAnonymousId();

      // After clear, getting ID again should generate a new one
      const id2 = await identityStore.getAnonymousId();
      expect(id2).toBe("mock-uuid-2");

      // IDs should be different
      expect(id1).not.toBe(id2);
    });
  });

  describe("UUID validation", () => {
    const validUUIDs = [
      "12345678-1234-4123-8123-123456789012",
      "a1b2c3d4-e5f6-4789-abcd-ef0123456789",
      "AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE",
      "00000000-0000-4000-8000-000000000000",
    ];

    const invalidUUIDs = [
      "", // empty
      "not-a-uuid", // random string
      "12345678-1234-1234-1234-123456789012", // version 1, not 4
      "12345678-1234-4123-0123-123456789012", // invalid variant (0)
      "12345678-1234-4123-c123-123456789012", // invalid variant (c)
      "12345678-1234-4123-8123-12345678901", // too short
      "12345678-1234-4123-8123-1234567890123", // too long
      "12345678_1234_4123_8123_123456789012", // wrong separator
    ];

    validUUIDs.forEach((uuid) => {
      it(`accepts valid UUID: ${uuid}`, async () => {
        mockStorage.data.set(STORAGE_KEYS.ANON_ID, uuid);
        const id = await identityStore.getAnonymousId();
        expect(id).toBe(uuid);
      });
    });

    invalidUUIDs.forEach((uuid) => {
      it(`rejects invalid UUID: ${uuid || "(empty)"}`, async () => {
        mockStorage.data.set(STORAGE_KEYS.ANON_ID, uuid);
        const id = await identityStore.getAnonymousId();
        // Should generate new UUID instead of using invalid one
        expect(id).not.toBe(uuid);
      });
    });
  });
});
