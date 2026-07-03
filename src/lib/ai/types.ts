/**
 * AI provider interface — allows swapping Gemini for OpenAI or others.
 */

import type { ParsedReceipt } from "@/types";

export interface ParseReceiptOptions {
  imageBase64: string;
  mimeType: string;
}

export interface AIProvider {
  name: string;
  parseReceipt(options: ParseReceiptOptions): Promise<ParsedReceipt>;
}
