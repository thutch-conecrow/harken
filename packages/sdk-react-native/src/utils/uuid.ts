/**
 * Crypto interface for UUID generation.
 * Available in React Native via Hermes or JavaScriptCore.
 */
declare const crypto:
  | {
      getRandomValues<T extends ArrayBufferView>(array: T): T;
    }
  | undefined;

/**
 * Generate a RFC4122 version 4 UUID.
 *
 * Uses crypto.getRandomValues when available (React Native),
 * falls back to Math.random for older environments.
 *
 * @returns A random UUID string in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  // Use crypto.getRandomValues if available (React Native has this)
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return generateUUIDCrypto();
  }

  // Fallback to Math.random-based generation
  return generateUUIDFallback();
}

/**
 * Generate UUID using crypto.getRandomValues
 */
function generateUUIDCrypto(): string {
  const bytes = new Uint8Array(16);
  crypto!.getRandomValues(bytes);

  // Set version (4) and variant (RFC4122)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // Variant RFC4122

  return formatUUID(bytes);
}

/**
 * Generate UUID using Math.random (fallback)
 */
function generateUUIDFallback(): string {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }

  // Set version (4) and variant (RFC4122)
  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // Variant RFC4122

  return formatUUID(bytes);
}

/**
 * Format bytes as UUID string
 */
function formatUUID(bytes: Uint8Array): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}
