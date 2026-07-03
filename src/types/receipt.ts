/**
 * Receipt and line-item domain types.
 */

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number;
}

export interface Receipt {
  storeName: string;
  date: string | null;
  lineItems: LineItem[];
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number;
}

/** Raw structured output returned by the AI parser before client-side normalization. */
export interface ParsedReceipt {
  storeName: string;
  date: string | null;
  lineItems: Omit<LineItem, "id">[];
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number;
}
