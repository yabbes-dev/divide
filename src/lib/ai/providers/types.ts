export interface ParseReceiptImageInput {
  imageBase64: string;
  mimeType: string;
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
