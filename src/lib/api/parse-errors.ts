export const PARSE_ERROR_CODES = {
  /** Temporary rate limit — retry after a short wait. */
  RATE_LIMITED: "RATE_LIMITED",
  /** Daily free-tier quota exhausted across models. */
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
} as const;

export type ParseErrorCode =
  (typeof PARSE_ERROR_CODES)[keyof typeof PARSE_ERROR_CODES];

export function isRateLimitUiError(code?: string | null): boolean {
  return (
    code === PARSE_ERROR_CODES.RATE_LIMITED ||
    code === PARSE_ERROR_CODES.QUOTA_EXCEEDED
  );
}

/** @deprecated use isRateLimitUiError */
export function isQuotaExceededError(code?: string | null): boolean {
  return isRateLimitUiError(code);
}

export function formatRetryCountdown(seconds: number): string {
  if (seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
