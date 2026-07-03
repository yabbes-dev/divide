/**
 * AI provider abstraction layer.
 * Components and API routes should import from here, not from provider-specific modules.
 */

export type { AIProvider, ParseReceiptOptions } from "./types";
export { parseReceiptWithGemini } from "./gemini";
// TODO: export { parseReceiptWithOpenAI } from "./openai";

/**
 * Parse a receipt image using the configured AI provider.
 * TODO: Implement provider selection via env var (e.g. AI_PROVIDER=gemini|openai).
 */
export async function parseReceipt(
  imageBase64: string,
  mimeType: string,
): Promise<never> {
  // TODO: Route to the appropriate provider based on configuration
  throw new Error("parseReceipt is not implemented yet");
}
