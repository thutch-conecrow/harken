"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Bug, Lightbulb, Palette, HelpCircle, Loader2 } from "lucide-react";
import { submitFeedback, type FeedbackCategory } from "@/lib/harken";
import { toast } from "sonner";

const categories: { value: FeedbackCategory; label: string; icon: React.ElementType }[] = [
  { value: "bug", label: "Bug", icon: Bug },
  { value: "idea", label: "Idea", icon: Lightbulb },
  { value: "ux", label: "UX", icon: Palette },
  { value: "other", label: "Other", icon: HelpCircle },
];

/**
 * Floating feedback widget for Next.js apps.
 *
 * Requires:
 * - `NEXT_PUBLIC_HARKEN_PUBLISHABLE_KEY` env var
 * - `lucide-react` for icons
 * - `sonner` for toast notifications
 * - Tailwind CSS
 *
 * Drop this component into your root layout:
 *
 * ```tsx
 * // app/layout.tsx
 * import { FeedbackWidget } from "@/components/feedback-widget";
 * import { Toaster } from "sonner";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <FeedbackWidget />
 *         <Toaster />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function FeedbackWidget(): React.ReactElement | null {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Don't render if no publishable key configured
  if (!process.env.NEXT_PUBLIC_HARKEN_PUBLISHABLE_KEY) return null;

  // Close on click outside or Escape
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Focus textarea when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  async function handleSubmit(): Promise<void> {
    if (!message.trim() || submitting) return;

    setSubmitting(true);
    try {
      await submitFeedback({ message: message.trim(), category });
      toast.success("Thanks for your feedback!");
      setMessage("");
      setCategory("idea");
      setOpen(false);
    } catch {
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50">
      {/* Feedback form popover */}
      <div
        className={[
          "absolute bottom-14 right-0 w-80",
          "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg",
          "transition-all duration-200 origin-bottom-right",
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none",
        ].join(" ")}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Send Feedback
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              aria-label="Close feedback"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Category selector */}
          <div className="flex gap-1.5 mb-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const selected = category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={[
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                    selected
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-500 hover:text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200",
                  ].join(" ")}
                >
                  <Icon className="size-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Message input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className={[
              "w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2",
              "text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400",
              "focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white",
              "resize-none",
            ].join(" ")}
          />

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!message.trim() || submitting}
            className={[
              "w-full mt-3 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
              "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </span>
            ) : (
              "Send Feedback"
            )}
          </button>
        </div>
      </div>

      {/* Floating circle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={[
          "size-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer",
          "transition-all duration-200",
          open
            ? "bg-neutral-100 text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
            : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
        ].join(" ")}
        aria-label={open ? "Close feedback" : "Send feedback"}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </div>
  );
}
