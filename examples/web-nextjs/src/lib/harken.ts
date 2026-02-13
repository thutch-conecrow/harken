const HARKEN_API_BASE = "https://api.harken.app";

function getPublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_HARKEN_PUBLISHABLE_KEY;
  if (!key) throw new Error("Missing NEXT_PUBLIC_HARKEN_PUBLISHABLE_KEY");
  return key;
}

function getAnonymousId(): string {
  const STORAGE_KEY = "harken_anon_id";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export type FeedbackCategory = "bug" | "idea" | "ux" | "other";

interface SubmitFeedbackParams {
  message: string;
  category: FeedbackCategory;
  metadata?: Record<string, string>;
}

export async function submitFeedback({
  message,
  category,
  metadata,
}: SubmitFeedbackParams): Promise<void> {
  const response = await fetch(`${HARKEN_API_BASE}/v1/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Publishable-Key": getPublishableKey(),
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
}
