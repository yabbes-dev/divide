import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

/** Models to try in order — env override first, then fallbacks. */
const MODEL_FALLBACKS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
].filter((m): m is string => Boolean(m));

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1500;

const RECEIPT_PROMPT = `
You are a receipt parsing engine.

Extract all purchasable line items from this receipt image.

Return ONLY valid JSON in this format:

{
  "store": "string",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "price": number,
      "discount": number,
      "originalPrice": number
    }
  ]
}

CRITICAL — per-item discounts:
- Many receipts show a discount on the line IMMEDIATELY BELOW an item (e.g. "SAVINGS", "DISCOUNT", "PROMO", "CARD SAVINGS", "MULTI BUY", "-0.50", "You saved").
- "price" MUST be the FINAL amount the customer pays for that line AFTER any per-item discount.
- Do NOT use the pre-discount / original shelf price as "price".
- If an item shows original price then a discount sub-line, set:
  - "originalPrice" = line total before discount
  - "discount" = discount amount as a positive number (e.g. 0.50)
  - "price" = originalPrice minus discount (the net line total)
- If only the discounted price is shown, set "price" to that and omit discount/originalPrice.

Other rules:
- "price" is always the final LINE TOTAL for that row (quantity already included).
- Ignore receipt-level totals, VAT, tips, service charges, and payment details.
- Do not create separate items for discount lines — attach the discount to the item above.
- If quantity is missing, assume 1.
- All amounts must be numbers only (no currency symbols).
- Do not wrap the JSON in markdown.
`;

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
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured. Add your key to .env.local and restart the dev server.",
        },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const imagePart = {
      inlineData: { mimeType, data: imageBase64 },
    };

    const uniqueModels = [...new Set(MODEL_FALLBACKS)];
    let lastError: Error | null = null;

    for (const modelName of uniqueModels) {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
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

    throw lastError ?? new Error("No Gemini model available for this API key");
  } catch (err) {
    console.error("parse-receipt error:", err);

    const message = getErrorMessage(err);

    if (message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        {
          error:
            "Gemini API quota exceeded. Wait a few minutes or enable billing at aistudio.google.com. Try GEMINI_MODEL=gemini-2.5-flash-lite in .env.local.",
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
