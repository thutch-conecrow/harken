/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { useAnonymousId } from "./useAnonymousId";
import { HarkenContext } from "../context";

// Mock identityStore
function createMockIdentityStore() {
  return {
    getAnonymousId: vi.fn(),
    getUserId: vi.fn(),
    setUserId: vi.fn(),
    clearUserId: vi.fn(),
  };
}

// Helper to create a wrapper with HarkenContext
function createWrapper(contextValue: unknown) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(HarkenContext.Provider, { value: contextValue as never }, children);
  };
}

describe("useAnonymousId", () => {
  let mockIdentityStore: ReturnType<typeof createMockIdentityStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIdentityStore = createMockIdentityStore();
  });

  describe("context requirement", () => {
    it("throws when used outside HarkenProvider", () => {
      // Suppress console.error for expected error
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAnonymousId());
      }).toThrow("useAnonymousId must be used within a HarkenProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("loading state", () => {
    it("starts with isLoading true and anonymousId null", () => {
      mockIdentityStore.getAnonymousId.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const wrapper = createWrapper({
        identityStore: mockIdentityStore,
        client: {},
        config: {},
      });

      const { result } = renderHook(() => useAnonymousId(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.anonymousId).toBeNull();
    });

    it("sets isLoading false after loading completes", async () => {
      mockIdentityStore.getAnonymousId.mockResolvedValue("anon-123");

      const wrapper = createWrapper({
        identityStore: mockIdentityStore,
        client: {},
        config: {},
      });

      const { result } = renderHook(() => useAnonymousId(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("anonymousId retrieval", () => {
    it("returns anonymousId from identityStore", async () => {
      mockIdentityStore.getAnonymousId.mockResolvedValue("stable-uuid-abc");

      const wrapper = createWrapper({
        identityStore: mockIdentityStore,
        client: {},
        config: {},
      });

      const { result } = renderHook(() => useAnonymousId(), { wrapper });

      await waitFor(() => {
        expect(result.current.anonymousId).toBe("stable-uuid-abc");
      });

      expect(mockIdentityStore.getAnonymousId).toHaveBeenCalledTimes(1);
    });

    it("returns different IDs for different stores", async () => {
      const store1 = createMockIdentityStore();
      const store2 = createMockIdentityStore();
      store1.getAnonymousId.mockResolvedValue("id-from-store-1");
      store2.getAnonymousId.mockResolvedValue("id-from-store-2");

      const wrapper1 = createWrapper({
        identityStore: store1,
        client: {},
        config: {},
      });
      const wrapper2 = createWrapper({
        identityStore: store2,
        client: {},
        config: {},
      });

      const { result: result1 } = renderHook(() => useAnonymousId(), { wrapper: wrapper1 });
      const { result: result2 } = renderHook(() => useAnonymousId(), { wrapper: wrapper2 });

      await waitFor(() => {
        expect(result1.current.anonymousId).toBe("id-from-store-1");
      });
      await waitFor(() => {
        expect(result2.current.anonymousId).toBe("id-from-store-2");
      });
    });
  });

  describe("error handling", () => {
    it("handles storage errors gracefully", async () => {
      mockIdentityStore.getAnonymousId.mockRejectedValue(new Error("Storage failed"));

      const wrapper = createWrapper({
        identityStore: mockIdentityStore,
        client: {},
        config: {},
      });

      const { result } = renderHook(() => useAnonymousId(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have null ID but not crash
      expect(result.current.anonymousId).toBeNull();
    });
  });

  describe("cleanup", () => {
    it("does not update state after unmount", async () => {
      // Spy on console.error to detect React's unmounted component warning
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      mockIdentityStore.getAnonymousId.mockReturnValue(promise);

      const wrapper = createWrapper({
        identityStore: mockIdentityStore,
        client: {},
        config: {},
      });

      const { unmount } = renderHook(() => useAnonymousId(), { wrapper });

      // Unmount before the promise resolves
      unmount();

      // Resolve after unmount - should not trigger setState on unmounted component
      resolvePromise!("late-id");

      // Wait for the async handler to run
      await new Promise((resolve) => setTimeout(() => resolve(undefined), 10));

      // Verify no React warning about updating unmounted component was logged
      const reactWarnings = errorSpy.mock.calls.filter(
        (call) => typeof call[0] === "string" && call[0].includes("unmounted component")
      );
      expect(reactWarnings).toHaveLength(0);

      errorSpy.mockRestore();
    });
  });
});
