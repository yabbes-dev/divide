/**
 * Formatting utilities for currency and dates.
 */

import {
  DEFAULT_CURRENCY,
  formatMoneyAmount,
  type CurrencyCode,
} from "@/lib/currency/constants";

/** Shared class for currency amounts */
export const moneyClass = "text-money";

/** Format a number as currency (defaults to EUR). Prefer `useCurrency().formatMoney` in the wizard. */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): string {
  return formatMoneyAmount(amount, currency);
}

/** Format an ISO date string for display. */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  // TODO: Parse and format date consistently
  return dateString;
}

/** "alice smith" → "Alice Smith" */
export function toTitleCase(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
