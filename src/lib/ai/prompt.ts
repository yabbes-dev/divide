import { toGeminiResponseSchema } from "@/lib/ai/receipt-schema";

/**
 * Prompt templates for receipt parsing.
 * Kept separate from provider logic for easy iteration and testing.
 */
export function buildReceiptParsePrompt(): string {
  return `You are a precise receipt OCR and parsing engine.

Extract every purchasable line item from this receipt image.

ACCURACY RULES (most important):
1. Read each price digit-by-digit exactly as printed. Do not guess or round.
2. Many receipts have columns: QTY | ITEM | UNIT PRICE | LINE TOTAL (or AMOUNT).
   - "unitPrice" = price for ONE unit (when a separate unit column exists).
   - "price" = the LINE TOTAL for that row (what the customer pays for that line).
   - If quantity > 1, "price" is usually NOT the same as "unitPrice" — it is unitPrice × quantity (minus any line discount).
3. Never swap unit price and line total. When both columns exist, copy each value from its own column.
4. Decimal points matter: 1.29 is not 12.9 or 129. Preserve cents exactly.
5. "price" must be the FINAL line total AFTER any per-item discount on that row.

DISCOUNTS:
- Discount lines immediately below an item (SAVINGS, DISCOUNT, PROMO, MULTI BUY, -0.50) belong to the item above.
- Do not create separate items for discount lines.
- If original price and discount are shown:
  - "originalPrice" = line total before discount
  - "discount" = positive discount amount (e.g. 0.50)
  - "price" = originalPrice minus discount

IGNORE:
- Receipt-level subtotal, tax, VAT, tips, service charges, payment method, change due.
- Header/footer marketing text, loyalty points, barcodes.

OTHER:
- If quantity is missing, use 1.
- If unit price column is not shown, omit "unitPrice".
- Extract "subtotal" and "total" from the receipt footer when visible (before tax/tip if both appear).
- All amounts are numbers only (no currency symbols).
- Return ONLY the JSON object — no markdown, no explanation.`;
}

/** Groq vision models reject system messages when images are present — use as user text. */
export function buildGroqReceiptParsePrompt(): string {
  return `${buildReceiptParsePrompt()}

Return a single JSON object matching this shape:
{
  "store": string,
  "items": [{ "name": string, "quantity": number, "price": number, "unitPrice"?: number, "discount"?: number, "originalPrice"?: number }],
  "subtotal"?: number,
  "total"?: number
}`;
}

export { toGeminiResponseSchema as buildReceiptParseSchema };
