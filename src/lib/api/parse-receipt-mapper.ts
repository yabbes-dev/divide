import type { ParsedReceiptApiResponse } from "@/types/parse-receipt";
import type { WizardItem } from "@/types/wizard";

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
  return items.map((item) => ({
    id: crypto.randomUUID(),
    name: item.name,
    price: getItemLineTotal(item),
    originalPrice: item.originalPrice ?? null,
    discount: item.discount ?? null,
    assignedTo: [],
  }));
}
