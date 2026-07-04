/** Helpers for classifying provider API errors from error messages. */

export function isRateLimitMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    message.includes("429") ||
    lower.includes("too many requests") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("rate_limit")
  );
}

export function isDailyQuotaMessage(message: string): boolean {
  return (
    message.includes("PerDay") ||
    message.includes("GenerateRequestsPerDay") ||
    message.includes("limit: 0") ||
    message.toLowerCase().includes("tokens per day")
  );
}

export function isModelNotFoundMessage(message: string): boolean {
  return (
    message.includes("not found") ||
    message.includes("404") ||
    message.toLowerCase().includes("does not exist") ||
    message.toLowerCase().includes("model_not_found")
  );
}

export function isTemporaryOverloadMessage(message: string): boolean {
  return (
    message.includes("503") ||
    message.includes("Service Unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("UNAVAILABLE")
  );
}

/** Parse "Please retry in 27.13s" from Gemini error text. */
export function parseRetryDelayMs(message: string): number | null {
  const match = message.match(/Please retry in ([\d.]+)s/i);
  if (!match) return null;
  const seconds = parseFloat(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
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
