/** Shape returned by Gemini via /api/parse-receipt */
export interface ParsedReceiptApiResponse {
  store: string;
  items: {
    name: string;
    /** Final line total after discounts (what the customer pays for this row). */
    price: number;
    quantity: number;
    /** Optional: discount amount for this line (positive number, e.g. 0.50). */
    discount?: number | null;
    /** Optional: line total before discount. */
    originalPrice?: number | null;
  }[];
}
