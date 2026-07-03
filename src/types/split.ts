/**
 * Split calculation domain types.
 */

export interface ItemAssignment {
  itemId: string;
  personIds: string[];
}

export interface PersonSplit {
  personId: string;
  personName: string;
  amountOwed: number;
  items: {
    itemId: string;
    itemName: string;
    shareAmount: number;
  }[];
}

export interface SplitSummary {
  people: PersonSplit[];
  receiptTotal: number;
  assignedTotal: number;
  unassignedTotal: number;
}
