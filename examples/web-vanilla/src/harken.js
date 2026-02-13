const HARKEN_API_BASE = "https://api.harken.app";

/**
 * Get or create a stable anonymous ID for this browser.
 * Persisted in localStorage so it survives page reloads.
 */
function getAnonymousId() {
  const STORAGE_KEY = "harken_anon_id";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

/**
 * Submit feedback to the Harken API.
 *
 * This is a minimal, framework-agnostic client that works in any
 * browser environment. It automatically:
 * - Generates and persists an anonymous device ID
 * - Sets `platform: "web"` in metadata
 *
 * @param {Object} params
 * @param {string} params.publishableKey - Your Harken publishable key
 * @param {string} params.message - Feedback message
 * @param {"bug"|"idea"|"ux"|"other"} params.category - Feedback category
 * @param {Record<string, string>} [params.metadata] - Optional additional metadata
 * @returns {Promise<{id: string, created_at: string}>} The created feedback
 */
export async function submitFeedback({ publishableKey, message, category, metadata }) {
  const response = await fetch(`${HARKEN_API_BASE}/v1/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Publishable-Key": publishableKey,
    },
    body: JSON.stringify({
      message,
      category,
      anon_id: getAnonymousId(),
      metadata: {
        platform: "web",
        ...metadata,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Harken feedback failed (${response.status}): ${body}`);
  }

  return response.json();
}
