/**
 * Shared TypeScript types for the receipt splitting app.
 * Re-export domain types from their respective modules.
 */

export type { Receipt, LineItem, ParsedReceipt } from "./receipt";
export type { Person } from "./person";
export type { ItemAssignment, PersonSplit, SplitSummary } from "./split";
