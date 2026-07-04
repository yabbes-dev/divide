import {
  isDailyQuotaMessage,
  maxRetryDelayMs,
} from "@/lib/ai/provider-errors";
import {
  isGeminiConfigured,
  parseReceiptWithGemini,
} from "@/lib/ai/providers/gemini";
import {
  isGroqConfigured,
  parseReceiptWithGroq,
  shouldTryGroqFallback,
} from "@/lib/ai/providers/groq";
import type {
  ParseReceiptImageInput,
  ParseReceiptSuccess,
} from "@/lib/ai/providers/types";
import { PARSE_ERROR_CODES } from "@/lib/api/parse-errors";

export interface ParseReceiptServerError {
  status: number;
  error: string;
  code?: string;
  retryAfterMs?: number;
  modelsTried?: string[];
}

export type ParseReceiptServerResult =
  | { type: "success"; data: ParseReceiptSuccess }
  | { type: "error"; error: ParseReceiptServerError };

export function isAnyReceiptProviderConfigured(): boolean {
  return isGeminiConfigured() || isGroqConfigured();
}

export async function parseReceiptWithFallbacks(
  input: ParseReceiptImageInput,
): Promise<ParseReceiptServerResult> {
  if (isGeminiConfigured()) {
    const geminiResult = await parseReceiptWithGemini(input);

    if (geminiResult.type === "success") {
      return { type: "success", data: geminiResult.result };
    }

    const geminiFailure = geminiResult.failure;

    if (shouldTryGroqFallback() && geminiFailure.shouldFallback) {
      const groqResult = await parseReceiptWithGroq(input);
      if (groqResult.type === "success") {
        return { type: "success", data: groqResult.result };
      }

      return buildRateLimitOrGenericError(
        [
          ...geminiFailure.rateLimitMessages,
          ...groqResult.failure.rateLimitMessages,
        ],
        [...geminiFailure.modelsTried, ...groqResult.failure.modelsTried],
        groqResult.failure.lastError ?? geminiFailure.lastError,
      );
    }

    if (geminiFailure.rateLimitMessages.length > 0) {
      return buildRateLimitOrGenericError(
        geminiFailure.rateLimitMessages,
        geminiFailure.modelsTried,
        geminiFailure.lastError,
      );
    }

    const message =
      geminiFailure.lastError?.message ??
      "No Gemini model available for this API key";

    return {
      type: "error",
      error: {
        status: 500,
        error: message,
      },
    };
  }

  if (shouldTryGroqFallback()) {
    const groqResult = await parseReceiptWithGroq(input);
    if (groqResult.type === "success") {
      return { type: "success", data: groqResult.result };
    }

    if (groqResult.failure.rateLimitMessages.length > 0) {
      return buildRateLimitOrGenericError(
        groqResult.failure.rateLimitMessages,
        groqResult.failure.modelsTried,
        groqResult.failure.lastError,
      );
    }

    return {
      type: "error",
      error: {
        status: 500,
        error:
          groqResult.failure.lastError?.message ??
          "No Groq model available for this API key",
      },
    };
  }

  return {
    type: "error",
    error: {
      status: 500,
      error: `Receipt scanning isn't configured. ${process.env.NODE_ENV === "development" ? "Add GEMINI_API_KEY and/or GROQ_API_KEY to .env.local." : "Configure API keys on the server."}`,
    },
  };
}

function buildRateLimitOrGenericError(
  rateLimitMessages: string[],
  modelsTried: string[],
  lastError: Error | null,
): ParseReceiptServerResult {
  if (rateLimitMessages.length === 0) {
    return {
      type: "error",
      error: {
        status: 500,
        error:
          lastError?.message ??
          "Couldn't read this receipt. Try again with a clearer photo.",
      },
    };
  }

  const retryAfterMs = maxRetryDelayMs(rateLimitMessages);
  const allDaily = rateLimitMessages.every(isDailyQuotaMessage);

  if (allDaily) {
    return {
      type: "error",
      error: {
        status: 429,
        error:
          "You've hit today's free scan limit. Try again tomorrow — quotas reset overnight (Pacific time).",
        code: PARSE_ERROR_CODES.QUOTA_EXCEEDED,
        retryAfterMs: retryAfterMs ?? 60_000,
        modelsTried,
      },
    };
  }

  const waitSeconds = retryAfterMs ? Math.ceil(retryAfterMs / 1000) : 60;

  return {
    type: "error",
    error: {
      status: 429,
      error: `Busy moment — wait ${waitSeconds}s, then try again.`,
      code: PARSE_ERROR_CODES.RATE_LIMITED,
      retryAfterMs: retryAfterMs ?? 60_000,
      modelsTried,
    },
  };
}
