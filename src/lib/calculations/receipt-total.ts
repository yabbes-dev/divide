import type { WizardItem } from "@/types/wizard";

export const ADJUSTMENT_ITEM_NAME = "Discount / adjustment";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function isAdjustmentItem(item: WizardItem): boolean {
  return item.isAdjustment === true;
}

export function sumItemPrices(items: WizardItem[]): number {
  return roundMoney(items.reduce((sum, item) => sum + item.price, 0));
}

export function sumRegularItemPrices(items: WizardItem[]): number {
  return roundMoney(
    items
      .filter((item) => !isAdjustmentItem(item))
      .reduce((sum, item) => sum + item.price, 0),
  );
}

/** Apply a target receipt total by adding or updating an adjustment line. */
export function applyReceiptTotal(
  items: WizardItem[],
  targetTotal: number,
): WizardItem[] {
  const regular = items.filter((item) => !isAdjustmentItem(item));
  const adjustment = items.find(isAdjustmentItem);
  const regularSum = sumRegularItemPrices(items);
  const adjustmentPrice = roundMoney(targetTotal - regularSum);

  if (Math.abs(adjustmentPrice) < 0.01) {
    return regular;
  }

  if (adjustment) {
    return [...regular, { ...adjustment, price: adjustmentPrice }];
  }

  return [
    ...regular,
    {
      id: crypto.randomUUID(),
      name: ADJUSTMENT_ITEM_NAME,
      price: adjustmentPrice,
      assignedTo: [],
      isAdjustment: true,
    },
  ];
}

export function stripAdjustmentItems(items: WizardItem[]): WizardItem[] {
  return items.filter((item) => !isAdjustmentItem(item));
}
