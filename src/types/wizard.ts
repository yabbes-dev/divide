export interface WizardItem {
  id: string;
  name: string;
  /** Final line total used for splitting (after discounts). */
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  assignedTo: string[];
}

export interface WizardReceipt {
  store?: string;
  items: WizardItem[];
  people: string[];
}

export const MOCK_RECEIPT_ITEMS: Omit<WizardItem, "id" | "assignedTo">[] = [
  { name: "Milk", price: 2.1 },
  { name: "Bread", price: 1.5 },
  { name: "Eggs", price: 3.2 },
  { name: "Chicken Breast", price: 8.9 },
];

export const WIZARD_STEPS = [
  "Upload",
  "Process",
  "Review",
  "People",
  "Assign",
  "Summary",
] as const;

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;
