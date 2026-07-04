import { NextResponse } from "next/server";

import {
  isAnyReceiptProviderConfigured,
  parseReceiptWithFallbacks,
} from "@/lib/ai/parse-receipt-server";
import {
  isDailyQuotaMessage,
  isRateLimitMessage,
  isTemporaryOverloadMessage,
  maxRetryDelayMs,
} from "@/lib/ai/provider-errors";
import { PARSE_ERROR_CODES } from "@/lib/api/parse-errors";

export const maxDuration = 60;

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Failed to parse receipt";
}

function missingProviderHint(): string {
  return process.env.NODE_ENV === "development"
    ? "Add GEMINI_API_KEY and/or GROQ_API_KEY to .env.local and restart the dev server."
    : "Add GEMINI_API_KEY or GROQ_API_KEY in your host's environment variables, then redeploy.";
}

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "imageBase64 is required" },
        { status: 400 },
      );
    }

    if (!isAnyReceiptProviderConfigured()) {
      return NextResponse.json(
        {
          error: `Receipt scanning isn't configured. ${missingProviderHint()}`,
        },
        { status: 500 },
      );
    }

    const outcome = await parseReceiptWithFallbacks({ imageBase64, mimeType });

    if (outcome.type === "success") {
      return NextResponse.json({
        raw: outcome.data.raw,
        model: outcome.data.model,
      });
    }

    const { error } = outcome;
    return NextResponse.json(
      {
        error: error.error,
        code: error.code,
        retryAfterMs: error.retryAfterMs,
        modelsTried: error.modelsTried,
      },
      { status: error.status },
    );
  } catch (err) {
    console.error("parse-receipt error:", err);

    const message = getErrorMessage(err);

    if (isRateLimitMessage(message)) {
      const retryAfterMs = maxRetryDelayMs([message]);
      const isDaily = isDailyQuotaMessage(message);

      return NextResponse.json(
        {
          error: isDaily
            ? "You've hit today's free scan limit. Try again tomorrow — quotas reset overnight (Pacific time)."
            : `Busy moment — wait ${Math.ceil((retryAfterMs ?? 60_000) / 1000)}s, then try again.`,
          code: isDaily
            ? PARSE_ERROR_CODES.QUOTA_EXCEEDED
            : PARSE_ERROR_CODES.RATE_LIMITED,
          retryAfterMs: retryAfterMs ?? 60_000,
        },
        { status: 429 },
      );
    }

    if (message.includes("API key not valid") || message.includes("Invalid API Key")) {
      return NextResponse.json(
        { error: "Receipt scanning isn't set up yet." },
        { status: 500 },
      );
    }

    if (message.includes("not found") || message.includes("404")) {
      return NextResponse.json(
        {
          error:
            "Receipt reader model not found. Check GEMINI_MODEL or GROQ_MODEL in .env.local.",
        },
        { status: 500 },
      );
    }

    if (isTemporaryOverloadMessage(message)) {
      return NextResponse.json(
        {
          error:
            "Receipt reader is temporarily busy. Please wait a moment and try again.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
