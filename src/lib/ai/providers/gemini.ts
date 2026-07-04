import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  isModelNotFoundMessage,
  isRateLimitMessage,
  isTemporaryOverloadMessage,
} from "@/lib/ai/provider-errors";
import {
  buildReceiptParsePrompt,
  buildReceiptParseSchema,
} from "@/lib/ai/prompt";
import { validateReceiptResponse } from "@/lib/ai/receipt-schema";
import type {
  ParseReceiptImageInput,
  ParseReceiptProviderResult,
} from "@/lib/ai/providers/types";

const DEFAULT_MODEL_FALLBACKS = [
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1500;

const RECEIPT_PROMPT = buildReceiptParsePrompt();
const RECEIPT_SCHEMA = buildReceiptParseSchema();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getModelList(): string[] {
  return [
    ...new Set(
      [process.env.GEMINI_MODEL, ...DEFAULT_MODEL_FALLBACKS].filter(
        (m): m is string => Boolean(m),
      ),
    ),
  ];
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  return Boolean(key && key !== "your_gemini_api_key_here");
}

export async function parseReceiptWithGemini(
  input: ParseReceiptImageInput,
): Promise<ParseReceiptProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return {
      type: "failure",
      failure: {
        rateLimitMessages: [],
        modelsTried: [],
        lastError: new Error("GEMINI_API_KEY is not configured"),
        shouldFallback: true,
      },
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const imagePart = {
    inlineData: { mimeType: input.mimeType, data: input.imageBase64 },
  };

  const models = getModelList();
  let lastError: Error | null = null;
  const rateLimitMessages: string[] = [];
  let sawRetryableFailure = false;

  for (const modelName of models) {
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
        const result = await model.generateContent([RECEIPT_PROMPT, imagePart]);
        const text = result.response.text();
        const validation = validateReceiptResponse(text);

        if (!validation.ok) {
          sawRetryableFailure = true;
          console.warn(
            `Gemini "${modelName}" returned invalid JSON (${validation.error}), trying next...`,
          );
          break;
        }

        return {
          type: "success",
          result: {
            raw: validation.raw,
            model: modelName,
            provider: "gemini",
          },
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const message = lastError.message;

        if (isModelNotFoundMessage(message)) {
          sawRetryableFailure = true;
          console.warn(`Gemini model "${modelName}" not found, trying next...`);
          break;
        }

        if (isRateLimitMessage(message)) {
          sawRetryableFailure = true;
          rateLimitMessages.push(message);
          console.warn(
            `Gemini "${modelName}" rate limited (attempt ${attempt + 1}/${MAX_RETRIES}), trying next...`,
          );
          break;
        }

        if (isTemporaryOverloadMessage(message)) {
          sawRetryableFailure = true;
          const isLastAttempt = attempt === MAX_RETRIES - 1;
          if (!isLastAttempt) {
            const delay = RETRY_BASE_MS * (attempt + 1);
            console.warn(
              `Gemini "${modelName}" overloaded (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`,
            );
            await sleep(delay);
            continue;
          }
          console.warn(`Gemini "${modelName}" still overloaded, trying next...`);
          break;
        }

        return {
          type: "failure",
          failure: {
            rateLimitMessages,
            modelsTried: models,
            lastError,
            shouldFallback: false,
          },
        };
      }
    }
  }

  return {
    type: "failure",
    failure: {
      rateLimitMessages,
      modelsTried: models,
      lastError,
      shouldFallback:
        sawRetryableFailure ||
        rateLimitMessages.length > 0 ||
        lastError == null,
    },
  };
}
