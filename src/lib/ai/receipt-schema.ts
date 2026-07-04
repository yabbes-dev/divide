import { SchemaType, type ResponseSchema } from "@google/generative-ai";
import { z } from "zod";

import type { ParsedReceiptApiResponse } from "@/types/parse-receipt";

const receiptItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().finite().positive().optional().default(1),
  price: z.coerce.number().finite(),
  unitPrice: z.coerce.number().finite().optional().nullable(),
  discount: z.coerce.number().finite().optional().nullable(),
  originalPrice: z.coerce.number().finite().optional().nullable(),
});

export const receiptParseSchema = z.object({
  store: z.string().min(1),
  items: z.array(receiptItemSchema).min(1),
  subtotal: z.coerce.number().finite().optional().nullable(),
  total: z.coerce.number().finite().optional().nullable(),
});

export type ValidatedReceiptParse = z.infer<typeof receiptParseSchema>;

/** Gemini structured-output schema (derived from the same shape as Zod). */
export function toGeminiResponseSchema(): ResponseSchema {
  return {
    type: SchemaType.OBJECT,
    properties: {
      store: { type: SchemaType.STRING },
      items: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            quantity: { type: SchemaType.NUMBER },
            unitPrice: { type: SchemaType.NUMBER },
            price: { type: SchemaType.NUMBER },
            discount: { type: SchemaType.NUMBER },
            originalPrice: { type: SchemaType.NUMBER },
          },
          required: ["name", "quantity", "price"],
        },
      },
      subtotal: { type: SchemaType.NUMBER },
      total: { type: SchemaType.NUMBER },
    },
    required: ["store", "items"],
  };
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonStr = fenceMatch ? fenceMatch[1].trim() : trimmed;

  const objectStart = jsonStr.indexOf("{");
  const objectEnd = jsonStr.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd !== -1) {
    jsonStr = jsonStr.slice(objectStart, objectEnd + 1);
  }

  return jsonStr;
}

export type ValidateReceiptResult =
  | { ok: true; data: ParsedReceiptApiResponse; raw: string }
  | { ok: false; error: string };

/** Server-side gate: valid receipt JSON shape before returning to the client. */
export function validateReceiptResponse(raw: string): ValidateReceiptResult {
  if (!raw?.trim()) {
    return { ok: false, error: "AI returned an empty response" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonObject(raw));
  } catch {
    return { ok: false, error: "AI response was not valid JSON" };
  }

  const result = receiptParseSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? "Invalid receipt JSON shape",
    };
  }

  const data: ParsedReceiptApiResponse = {
    store: result.data.store,
    items: result.data.items.map((item) => ({
      name: item.name,
      quantity: item.quantity ?? 1,
      price: item.price,
      unitPrice: item.unitPrice ?? undefined,
      discount: item.discount ?? undefined,
      originalPrice: item.originalPrice ?? undefined,
    })),
    subtotal: result.data.subtotal ?? undefined,
    total: result.data.total ?? undefined,
  };

  return { ok: true, data, raw: JSON.stringify(data) };
}
