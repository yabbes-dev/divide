import {
  isModelNotFoundMessage,
  isRateLimitMessage,
  isTemporaryOverloadMessage,
} from "@/lib/ai/provider-errors";
import { buildGroqReceiptParsePrompt } from "@/lib/ai/prompt";
import { validateReceiptResponse } from "@/lib/ai/receipt-schema";
import type {
  ParseReceiptImageInput,
  ParseReceiptProviderResult,
} from "@/lib/ai/providers/types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_GROQ_MODELS = [
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-vision-preview",
] as const;

const MAX_RETRIES = 2;
const RETRY_BASE_MS = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGroqFallbackEnabled(): boolean {
  if (process.env.AI_FALLBACK_ENABLED === "false") return false;
  return isGroqConfigured();
}

export function isGroqConfigured(): boolean {
  const key = process.env.GROQ_API_KEY;
  return Boolean(key && key !== "your_groq_api_key_here");
}

export function shouldTryGroqFallback(): boolean {
  return isGroqFallbackEnabled();
}

function getGroqModelList(): string[] {
  const override = process.env.GROQ_MODEL;
  return [
    ...new Set(
      [override, ...DEFAULT_GROQ_MODELS].filter((m): m is string => Boolean(m)),
    ),
  ];
}

interface GroqChatResponse {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
  error?: { message?: string };
}

async function callGroqVision(
  apiKey: string,
  model: string,
  input: ParseReceiptImageInput,
  prompt: string,
): Promise<string> {
  const dataUrl = `data:${input.mimeType};base64,${input.imageBase64}`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
    }),
  });

  const body = (await response.json()) as GroqChatResponse;

  if (!response.ok) {
    const message =
      body.error?.message ??
      `Groq request failed (${response.status} ${response.statusText})`;
    throw new Error(message);
  }

  const content = body.choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("Groq returned an empty response");
  }

  return content;
}

export async function parseReceiptWithGroq(
  input: ParseReceiptImageInput,
): Promise<ParseReceiptProviderResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    return {
      type: "failure",
      failure: {
        rateLimitMessages: [],
        modelsTried: [],
        lastError: new Error("GROQ_API_KEY is not configured"),
        shouldFallback: false,
      },
    };
  }

  const models = getGroqModelList();
  const prompt = buildGroqReceiptParsePrompt();
  let lastError: Error | null = null;
  const rateLimitMessages: string[] = [];
  let sawRetryableFailure = false;

  for (const modelName of models) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const text = await callGroqVision(apiKey, modelName, input, prompt);
        const validation = validateReceiptResponse(text);

        if (!validation.ok) {
          sawRetryableFailure = true;
          console.warn(
            `Groq "${modelName}" returned invalid JSON (${validation.error}), trying next...`,
          );
          break;
        }

        return {
          type: "success",
          result: {
            raw: validation.raw,
            model: modelName,
            provider: "groq",
          },
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const message = lastError.message;

        if (isModelNotFoundMessage(message)) {
          sawRetryableFailure = true;
          console.warn(`Groq model "${modelName}" not found, trying next...`);
          break;
        }

        if (isRateLimitMessage(message)) {
          sawRetryableFailure = true;
          rateLimitMessages.push(message);
          console.warn(
            `Groq "${modelName}" rate limited (attempt ${attempt + 1}/${MAX_RETRIES}), trying next...`,
          );
          break;
        }

        if (isTemporaryOverloadMessage(message)) {
          sawRetryableFailure = true;
          const isLastAttempt = attempt === MAX_RETRIES - 1;
          if (!isLastAttempt) {
            await sleep(RETRY_BASE_MS * (attempt + 1));
            continue;
          }
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
      shouldFallback: sawRetryableFailure || rateLimitMessages.length > 0,
    },
  };
}
