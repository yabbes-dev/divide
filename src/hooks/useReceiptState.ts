/**
 * Central hook for managing receipt splitting state in the browser.
 * All app state lives here — no persistence, no auth.
 */

import type { Receipt, Person, ItemAssignment, SplitSummary } from "@/types";

export type AppStep = "upload" | "review" | "people" | "assign" | "summary";

export interface ReceiptAppState {
  step: AppStep;
  receipt: Receipt | null;
  people: Person[];
  assignments: ItemAssignment[];
  splitSummary: SplitSummary | null;
  isLoading: boolean;
  error: string | null;
}

export interface ReceiptAppActions {
  setStep: (step: AppStep) => void;
  setReceipt: (receipt: Receipt | null) => void;
  addPerson: (name: string) => void;
  removePerson: (personId: string) => void;
  updateLineItem: (itemId: string, updates: Partial<Receipt["lineItems"][number]>) => void;
  assignItem: (itemId: string, personIds: string[]) => void;
  calculateSummary: () => void;
  reset: () => void;
}

export type UseReceiptStateReturn = ReceiptAppState & ReceiptAppActions;

/**
 * Manage the full receipt splitting flow in browser state.
 */
export function useReceiptState(): UseReceiptStateReturn {
  // TODO: Implement with useState/useReducer
  // TODO: Wire up calculateSplits from lib/calculations/splits
  throw new Error("useReceiptState is not implemented yet");
}
