export interface ParseReceiptImageInput {
  imageBase64: string;
  mimeType: string;
  /** When set, call this model only. Used for a totals repair pass. */
  model?: string;
  /** Replaces the default receipt prompt. */
  prompt?: string;
  /** One try, no overload retries. Used for the repair pass. */
  singleAttempt?: boolean;
}

export interface ParseReceiptSuccess {
  raw: string;
  model: string;
  provider: "gemini" | "groq";
}

export interface ParseReceiptProviderFailure {
  rateLimitMessages: string[];
  modelsTried: string[];
  lastError: Error | null;
  /** True when every failure was retryable (quota / rate limit / model missing). */
  shouldFallback: boolean;
}

export type ParseReceiptProviderResult =
  | { type: "success"; result: ParseReceiptSuccess }
  | { type: "failure"; failure: ParseReceiptProviderFailure };
