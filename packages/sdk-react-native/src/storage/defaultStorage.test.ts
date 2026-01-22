import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to test the module in isolation, so we use dynamic imports
// and reset the module state between tests

describe("defaultStorage", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getDefaultStorage", () => {
    it("uses SecureStore when available", async () => {
      // Mock expo-secure-store to be available
      vi.doMock("expo-secure-store", () => ({
        getItemAsync: vi.fn().mockResolvedValue("secure-value"),
        setItemAsync: vi.fn().mockResolvedValue(undefined),
        deleteItemAsync: vi.fn().mockResolvedValue(undefined),
      }));

      const { getDefaultStorage } = await import("./defaultStorage");
      const storage = await getDefaultStorage();

      // The storage should use SecureStore
      const result = await storage.getItem("test-key");

      // Since we mocked getItemAsync to return "secure-value"
      expect(result).toBe("secure-value");
    });

    it("falls back to memory storage when SecureStore unavailable", async () => {
      // Mock expo-secure-store to throw (simulating it not being installed)
      vi.doMock("expo-secure-store", () => {
        throw new Error("Cannot find module 'expo-secure-store'");
      });

      // Suppress console.warn for this test
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const { getDefaultStorage } = await import("./defaultStorage");
      const storage = await getDefaultStorage();

      // Should fall back to memory storage and warn
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("expo-secure-store not available"));

      // Memory storage should work
      await storage.setItem("key", "value");
      const result = await storage.getItem("key");
      expect(result).toBe("value");
    });

    it("caches the storage instance", async () => {
      vi.doMock("expo-secure-store", () => ({
        getItemAsync: vi.fn().mockResolvedValue(null),
        setItemAsync: vi.fn().mockResolvedValue(undefined),
        deleteItemAsync: vi.fn().mockResolvedValue(undefined),
      }));

      const { getDefaultStorage } = await import("./defaultStorage");

      const storage1 = await getDefaultStorage();
      const storage2 = await getDefaultStorage();

      // Should return the same instance
      expect(storage1).toBe(storage2);
    });
  });

  describe("createDefaultStorage", () => {
    it("returns a lazy wrapper that initializes on first use", async () => {
      const mockGetItemAsync = vi.fn().mockResolvedValue("lazy-value");

      vi.doMock("expo-secure-store", () => ({
        getItemAsync: mockGetItemAsync,
        setItemAsync: vi.fn().mockResolvedValue(undefined),
        deleteItemAsync: vi.fn().mockResolvedValue(undefined),
      }));

      const { createDefaultStorage } = await import("./defaultStorage");
      const storage = createDefaultStorage();

      // SecureStore shouldn't be called yet (lazy)
      expect(mockGetItemAsync).not.toHaveBeenCalled();

      // First use triggers initialization
      const result = await storage.getItem("test-key");

      expect(mockGetItemAsync).toHaveBeenCalledWith("test-key");
      expect(result).toBe("lazy-value");
    });

    it("caches initialization across method calls", async () => {
      let initCount = 0;

      vi.doMock("expo-secure-store", () => {
        initCount++;
        return {
          getItemAsync: vi.fn().mockResolvedValue(null),
          setItemAsync: vi.fn().mockResolvedValue(undefined),
          deleteItemAsync: vi.fn().mockResolvedValue(undefined),
        };
      });

      const { createDefaultStorage } = await import("./defaultStorage");
      const storage = createDefaultStorage();

      // Multiple operations should only initialize once
      await storage.getItem("key1");
      await storage.setItem("key2", "value");
      await storage.deleteItem("key3");

      // Module should only be imported once
      expect(initCount).toBe(1);
    });

    it("handles concurrent initialization correctly", async () => {
      vi.doMock("expo-secure-store", () => ({
        getItemAsync: vi.fn().mockResolvedValue("concurrent-value"),
        setItemAsync: vi.fn().mockResolvedValue(undefined),
        deleteItemAsync: vi.fn().mockResolvedValue(undefined),
      }));

      const { createDefaultStorage } = await import("./defaultStorage");
      const storage = createDefaultStorage();

      // Concurrent calls should all succeed
      const [result1, result2, result3] = await Promise.all([
        storage.getItem("key1"),
        storage.getItem("key2"),
        storage.getItem("key3"),
      ]);

      expect(result1).toBe("concurrent-value");
      expect(result2).toBe("concurrent-value");
      expect(result3).toBe("concurrent-value");
    });
  });

  describe("error handling", () => {
    it("does not crash when SecureStore throws during operations", async () => {
      vi.doMock("expo-secure-store", () => ({
        getItemAsync: vi.fn().mockRejectedValue(new Error("SecureStore error")),
        setItemAsync: vi.fn().mockRejectedValue(new Error("SecureStore error")),
        deleteItemAsync: vi.fn().mockRejectedValue(new Error("SecureStore error")),
      }));

      const { createDefaultStorage } = await import("./defaultStorage");
      const storage = createDefaultStorage();

      // Errors from SecureStore should propagate (not swallowed)
      await expect(storage.getItem("key")).rejects.toThrow("SecureStore error");
    });
  });
});
