/** Helpers for classifying Gemini API errors from error messages. */

export function isRateLimitMessage(message: string): boolean {
  return (
    message.includes("429") ||
    message.includes("Too Many Requests") ||
    message.includes("quota")
  );
}

export function isDailyQuotaMessage(message: string): boolean {
  return (
    message.includes("PerDay") ||
    message.includes("GenerateRequestsPerDay") ||
    message.includes("limit: 0")
  );
}

/** Parse "Please retry in 27.13s" from Gemini error text. */
export function parseRetryDelayMs(message: string): number | null {
  const match = message.match(/Please retry in ([\d.]+)s/i);
  if (!match) return null;
  const seconds = parseFloat(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  // Small buffer so we don't retry a millisecond too early.
  return Math.ceil(seconds * 1000) + 1000;
}

export function maxRetryDelayMs(messages: string[]): number | null {
  let max: number | null = null;
  for (const message of messages) {
    const delay = parseRetryDelayMs(message);
    if (delay != null && (max == null || delay > max)) {
      max = delay;
    }
  }
  return max;
}
