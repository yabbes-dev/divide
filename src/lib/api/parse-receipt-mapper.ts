import type { ParsedReceiptApiResponse } from "@/types/parse-receipt";
import type { WizardItem } from "@/types/wizard";

const MONEY_TOLERANCE = 0.02;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function isClose(a: number, b: number, tolerance = MONEY_TOLERANCE): boolean {
  return Math.abs(a - b) <= tolerance;
}

/** Compute the final line total, applying discounts when present. */
export function getItemLineTotal(
  item: ParsedReceiptApiResponse["items"][number],
): number {
  const quantity = Number(item.quantity) || 1;
  const discount = Math.abs(Number(item.discount) || 0);
  const explicitPrice = Number(item.price);

  // If original + discount provided, compute net (handles model returning pre-discount price)
  if (item.originalPrice != null && discount > 0) {
    const original = Number(item.originalPrice);
    const netFromDiscount = original - discount;
    if (Number.isFinite(netFromDiscount) && netFromDiscount >= 0) {
      return netFromDiscount;
    }
  }

  // If only discount provided alongside price, treat price as pre-discount
  if (discount > 0 && Number.isFinite(explicitPrice)) {
    const net = explicitPrice - discount;
    if (net >= 0 && net < explicitPrice) {
      return net;
    }
  }

  // Default: price is the final line total (already includes qty + discounts)
  if (Number.isFinite(explicitPrice)) {
    return explicitPrice;
  }

  const original = Number(item.originalPrice) || 0;
  return Math.max(0, original * quantity - discount);
}

/** Correct common unit-price vs line-total mix-ups before mapping. */
export function normalizeParsedItem(
  item: ParsedReceiptApiResponse["items"][number],
): ParsedReceiptApiResponse["items"][number] {
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const unitPrice =
    item.unitPrice != null && Number.isFinite(Number(item.unitPrice))
      ? roundMoney(Number(item.unitPrice))
      : null;
  let price = Number(item.price);

  if (!Number.isFinite(price)) {
    price = 0;
  } else {
    price = roundMoney(price);
  }

  if (quantity > 1 && unitPrice != null && unitPrice > 0) {
    const expectedLineTotal = roundMoney(unitPrice * quantity);

    // Model copied unit price into "price" instead of line total
    if (isClose(price, unitPrice) && !isClose(price, expectedLineTotal)) {
      price = expectedLineTotal;
    }
  }

  return { ...item, quantity, price, unitPrice };
}

export function sumItemLineTotals(
  items: ParsedReceiptApiResponse["items"],
): number {
  return roundMoney(
    items.reduce((sum, item) => sum + getItemLineTotal(normalizeParsedItem(item)), 0),
  );
}

/** Pick the best receipt reference total for validation (prefer subtotal). */
export function getReceiptReferenceTotal(
  parsed: Pick<ParsedReceiptApiResponse, "subtotal" | "total" | "items">,
): number | null {
  const subtotal = parsed.subtotal != null ? Number(parsed.subtotal) : NaN;
  const total = parsed.total != null ? Number(parsed.total) : NaN;

  if (Number.isFinite(subtotal) && subtotal > 0) return roundMoney(subtotal);
  if (Number.isFinite(total) && total > 0) return roundMoney(total);
  return null;
}

export function hasTotalMismatch(
  parsed: Pick<ParsedReceiptApiResponse, "subtotal" | "total" | "items">,
  tolerance = 0.15,
): boolean {
  const reference = getReceiptReferenceTotal(parsed);
  if (reference == null) return false;
  return Math.abs(sumItemLineTotals(parsed.items) - reference) > tolerance;
}

/** Strip markdown fences and parse JSON from Gemini text output. */
export function parseReceiptJson(raw: string): ParsedReceiptApiResponse {
  if (!raw?.trim()) {
    throw new Error("AI returned an empty response. Try a clearer photo.");
  }

  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  let jsonStr = fenceMatch ? fenceMatch[1].trim() : trimmed;

  const objectStart = jsonStr.indexOf("{");
  const objectEnd = jsonStr.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd !== -1) {
    jsonStr = jsonStr.slice(objectStart, objectEnd + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr) as ParsedReceiptApiResponse;

    if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      throw new Error("No items found on the receipt. Try a clearer photo.");
    }

    parsed.items = parsed.items.map(normalizeParsedItem);

    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message.includes("No items found")) {
      throw error;
    }
    throw new Error(
      "Could not read receipt data from AI. Try again with a clearer, well-lit photo.",
    );
  }
}

export function mapApiItemsToWizard(
  items: ParsedReceiptApiResponse["items"],
): WizardItem[] {
  return items.map((item) => {
    const normalized = normalizeParsedItem(item);
    return {
      id: crypto.randomUUID(),
      name: normalized.name,
      price: getItemLineTotal(normalized),
      originalPrice: normalized.originalPrice ?? null,
      discount: normalized.discount ?? null,
      assignedTo: [],
    };
  });
}
