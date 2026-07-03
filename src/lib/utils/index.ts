/**
 * General utility functions.
 */

import type { ParsedReceipt, Receipt, LineItem } from "@/types";

/** Merge Tailwind class names, filtering falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Generate a simple unique ID for client-side entities. */
export function generateId(): string {
  return crypto.randomUUID();
}

/** Convert a ParsedReceipt from the AI into a client-ready Receipt with IDs. */
export function normalizeParsedReceipt(parsed: ParsedReceipt): Receipt {
  // TODO: Add IDs to line items, validate totals, handle edge cases
  const lineItems: LineItem[] = parsed.lineItems.map((item) => ({
    ...item,
    id: generateId(),
  }));

  return {
    storeName: parsed.storeName,
    date: parsed.date,
    lineItems,
    subtotal: parsed.subtotal,
    tax: parsed.tax,
    tip: parsed.tip,
    total: parsed.total,
  };
}
