import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  buildReceiptParsePrompt,
  buildReceiptParseSchema,
} from "@/lib/ai/prompt";
import {
  isDailyQuotaMessage,
  isRateLimitMessage,
  maxRetryDelayMs,
} from "@/lib/ai/gemini-errors";
import { PARSE_ERROR_CODES } from "@/lib/api/parse-errors";

export const maxDuration = 60;

/** Models to try in order — env override first, then fallbacks (each has its own quota). */
const MODEL_FALLBACKS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
].filter((m): m is string => Boolean(m));

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1500;

const RECEIPT_PROMPT = buildReceiptParsePrompt();
const RECEIPT_SCHEMA = buildReceiptParseSchema();

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Failed to parse receipt";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isModelNotFound(message: string) {
  return message.includes("not found") || message.includes("404");
}

function isTemporaryOverload(message: string) {
  return (
    message.includes("503") ||
    message.includes("Service Unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("UNAVAILABLE")
  );
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

    const apiKey =
      process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      const hint =
        process.env.NODE_ENV === "development"
          ? "Add your key to .env.local and restart the dev server."
          : "Add GEMINI_API_KEY in your host's environment variables (e.g. Vercel → Project Settings → Environment Variables), then redeploy.";
      return NextResponse.json(
        { error: `GEMINI_API_KEY is not configured. ${hint}` },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const imagePart = {
      inlineData: { mimeType, data: imageBase64 },
    };

    const uniqueModels = [...new Set(MODEL_FALLBACKS)];
    let lastError: Error | null = null;
    const rateLimitMessages: string[] = [];

    for (const modelName of uniqueModels) {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
              responseSchema: RECEIPT_SCHEMA,
            },
          });
          const result = await model.generateContent([
            RECEIPT_PROMPT,
            imagePart,
          ]);
          const text = result.response.text();

          if (!text?.trim()) {
            return NextResponse.json(
              { error: "AI returned an empty response" },
              { status: 502 },
            );
          }

          return NextResponse.json({ raw: text, model: modelName });
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          const message = lastError.message;

          if (isModelNotFound(message)) {
            console.warn(`Model "${modelName}" not found, trying next...`);
            break;
          }

          if (isRateLimitMessage(message)) {
            rateLimitMessages.push(message);
            console.warn(
              `Model "${modelName}" rate limited (attempt ${attempt + 1}/${MAX_RETRIES}), trying next model...`,
            );
            break;
          }

          if (isTemporaryOverload(message)) {
            const isLastAttempt = attempt === MAX_RETRIES - 1;
            if (!isLastAttempt) {
              const delay = RETRY_BASE_MS * (attempt + 1);
              console.warn(
                `Model "${modelName}" overloaded (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`,
              );
              await sleep(delay);
              continue;
            }
            console.warn(`Model "${modelName}" still overloaded, trying next model...`);
            break;
          }

          throw lastError;
        }
      }
    }

    if (rateLimitMessages.length > 0) {
      const retryAfterMs = maxRetryDelayMs(rateLimitMessages);
      const allDaily = rateLimitMessages.every(isDailyQuotaMessage);

      if (allDaily) {
        return NextResponse.json(
          {
            error:
              "Today's free scan limit has been reached for all available models. Daily quotas reset around midnight Pacific time — please try again tomorrow.",
            code: PARSE_ERROR_CODES.QUOTA_EXCEEDED,
            retryAfterMs: retryAfterMs ?? 60_000,
            modelsTried: uniqueModels,
          },
          { status: 429 },
        );
      }

      const waitSeconds = retryAfterMs
        ? Math.ceil(retryAfterMs / 1000)
        : 60;

      return NextResponse.json(
        {
          error: `Too many scans in a short time. Please wait about ${waitSeconds} seconds, then tap Try again.`,
          code: PARSE_ERROR_CODES.RATE_LIMITED,
          retryAfterMs: retryAfterMs ?? 60_000,
        },
        { status: 429 },
      );
    }

    throw lastError ?? new Error("No Gemini model available for this API key");
  } catch (err) {
    console.error("parse-receipt error:", err);

    const message = getErrorMessage(err);

    if (isRateLimitMessage(message)) {
      const retryAfterMs = maxRetryDelayMs([message]);
      const isDaily = isDailyQuotaMessage(message);

      return NextResponse.json(
        {
          error: isDaily
            ? "Today's free scan limit has been reached. Please try again tomorrow."
            : `Too many scans in a short time. Please wait about ${Math.ceil((retryAfterMs ?? 60_000) / 1000)} seconds, then try again.`,
          code: isDaily
            ? PARSE_ERROR_CODES.QUOTA_EXCEEDED
            : PARSE_ERROR_CODES.RATE_LIMITED,
          retryAfterMs: retryAfterMs ?? 60_000,
        },
        { status: 429 },
      );
    }

    if (message.includes("API key not valid")) {
      return NextResponse.json(
        { error: "Invalid GEMINI_API_KEY. Check your .env.local file." },
        { status: 500 },
      );
    }

    if (message.includes("not found") || message.includes("404")) {
      return NextResponse.json(
        {
          error:
            'Gemini model not found. Set GEMINI_MODEL=gemini-2.5-flash in .env.local.',
        },
        { status: 500 },
      );
    }

    if (isTemporaryOverload(message)) {
      return NextResponse.json(
        {
          error:
            "Gemini is temporarily busy. Please wait a moment and try again, or set GEMINI_MODEL=gemini-2.5-flash in .env.local.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
