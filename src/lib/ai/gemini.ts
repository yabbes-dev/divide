/**
 * Gemini-specific receipt parsing implementation.
 * This module is the only place that should reference the Gemini SDK/API.
 */

import type { ParsedReceipt } from "@/types";
import type { AIProvider, ParseReceiptOptions } from "./types";
// TODO: import { GoogleGenerativeAI } from "@google/generative-ai";

/** System prompt sent to Gemini for receipt extraction. */
export const RECEIPT_PARSE_PROMPT = `
TODO: Define the prompt that instructs Gemini to return structured JSON with:
- storeName
- date (if available)
- lineItems (name, quantity, unitPrice, totalPrice)
- subtotal, tax, tip, total
`.trim();

export async function parseReceiptWithGemini(
  options: ParseReceiptOptions,
): Promise<ParsedReceipt> {
  // TODO: Initialize Gemini client with process.env.GEMINI_API_KEY
  // TODO: Send image + RECEIPT_PARSE_PROMPT
  // TODO: Parse and validate JSON response
  // TODO: Return ParsedReceipt
  throw new Error("parseReceiptWithGemini is not implemented yet");
}

export const geminiProvider: AIProvider = {
  name: "gemini",
  parseReceipt: parseReceiptWithGemini,
};
