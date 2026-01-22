import { describe, it, expect, vi } from "vitest";
import { createSecureStoreAdapter, createMemoryStorage } from "./SecureStoreAdapter";

describe("createSecureStoreAdapter", () => {
  describe("when SecureStore is available", () => {
    it("maps getItem to getItemAsync", async () => {
      const mockSecureStore = {
        getItemAsync: vi.fn().mockResolvedValue("stored-value"),
        setItemAsync: vi.fn(),
        deleteItemAsync: vi.fn(),
      };

      const adapter = createSecureStoreAdapter(mockSecureStore);
      const result = await adapter.getItem("test-key");

      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith("test-key");
      expect(result).toBe("stored-value");
    });

    it("maps setItem to setItemAsync", async () => {
      const mockSecureStore = {
        getItemAsync: vi.fn(),
        setItemAsync: vi.fn().mockResolvedValue(undefined),
        deleteItemAsync: vi.fn(),
      };

      const adapter = createSecureStoreAdapter(mockSecureStore);
      await adapter.setItem("test-key", "test-value");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("test-key", "test-value");
    });

    it("maps deleteItem to deleteItemAsync", async () => {
      const mockSecureStore = {
        getItemAsync: vi.fn(),
        setItemAsync: vi.fn(),
        deleteItemAsync: vi.fn().mockResolvedValue(undefined),
      };

      const adapter = createSecureStoreAdapter(mockSecureStore);
      await adapter.deleteItem("test-key");

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("test-key");
    });

    it("returns null when key not found", async () => {
      const mockSecureStore = {
        getItemAsync: vi.fn().mockResolvedValue(null),
        setItemAsync: vi.fn(),
        deleteItemAsync: vi.fn(),
      };

      const adapter = createSecureStoreAdapter(mockSecureStore);
      const result = await adapter.getItem("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("error handling", () => {
    it("propagates getItemAsync errors", async () => {
      const mockSecureStore = {
        getItemAsync: vi.fn().mockRejectedValue(new Error("Storage error")),
        setItemAsync: vi.fn(),
        deleteItemAsync: vi.fn(),
      };

      const adapter = createSecureStoreAdapter(mockSecureStore);

      await expect(adapter.getItem("test-key")).rejects.toThrow("Storage error");
    });

    it("propagates setItemAsync errors", async () => {
      const mockSecureStore = {
        getItemAsync: vi.fn(),
        setItemAsync: vi.fn().mockRejectedValue(new Error("Write error")),
        deleteItemAsync: vi.fn(),
      };

      const adapter = createSecureStoreAdapter(mockSecureStore);

      await expect(adapter.setItem("key", "value")).rejects.toThrow("Write error");
    });

    it("propagates deleteItemAsync errors", async () => {
      const mockSecureStore = {
        getItemAsync: vi.fn(),
        setItemAsync: vi.fn(),
        deleteItemAsync: vi.fn().mockRejectedValue(new Error("Delete error")),
      };

      const adapter = createSecureStoreAdapter(mockSecureStore);

      await expect(adapter.deleteItem("key")).rejects.toThrow("Delete error");
    });
  });
});

describe("createMemoryStorage", () => {
  it("stores and retrieves values", async () => {
    const storage = createMemoryStorage();

    await storage.setItem("key1", "value1");
    const result = await storage.getItem("key1");

    expect(result).toBe("value1");
  });

  it("returns null for non-existent keys", async () => {
    const storage = createMemoryStorage();

    const result = await storage.getItem("nonexistent");

    expect(result).toBeNull();
  });

  it("deletes values", async () => {
    const storage = createMemoryStorage();

    await storage.setItem("key", "value");
    await storage.deleteItem("key");
    const result = await storage.getItem("key");

    expect(result).toBeNull();
  });

  it("overwrites existing values", async () => {
    const storage = createMemoryStorage();

    await storage.setItem("key", "first");
    await storage.setItem("key", "second");
    const result = await storage.getItem("key");

    expect(result).toBe("second");
  });

  it("isolates storage between instances", async () => {
    const storage1 = createMemoryStorage();
    const storage2 = createMemoryStorage();

    await storage1.setItem("key", "value1");
    await storage2.setItem("key", "value2");

    expect(await storage1.getItem("key")).toBe("value1");
    expect(await storage2.getItem("key")).toBe("value2");
  });
});
