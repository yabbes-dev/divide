/**
 * Formatting utilities for currency and dates.
 */

/** Shared class for currency amounts */
export const moneyClass = "text-money";

/** Format a number as currency (EUR for MVP). */
export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(amount);
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
