/**
 * Split calculation business logic.
 * Pure functions — no React, no side effects.
 */

import type { LineItem, Person, ItemAssignment, SplitSummary } from "@/types";

/**
 * Calculate how much each person owes based on item assignments.
 * Items assigned to multiple people are split evenly among them.
 */
export function calculateSplits(
  lineItems: LineItem[],
  people: Person[],
  assignments: ItemAssignment[],
): SplitSummary {
  // TODO: Implement split calculation
  // - For each item, divide totalPrice evenly among assigned personIds
  // - Sum per-person totals
  // - Track unassigned items
  throw new Error("calculateSplits is not implemented yet");
}

/**
 * Validate that all line items have at least one person assigned.
 */
export function getUnassignedItemIds(
  lineItems: LineItem[],
  assignments: ItemAssignment[],
): string[] {
  // TODO: Return IDs of items with no assignment
  return [];
}
