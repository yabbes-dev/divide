import type { WizardItem } from "@/types/wizard";

/** Split each item equally among assigned people and sum per person. */
export function calculatePersonTotals(
  items: WizardItem[],
  people: string[],
): Record<string, number> {
  const totals = Object.fromEntries(people.map((p) => [p, 0]));

  for (const item of items) {
    if (item.assignedTo.length === 0) continue;
    const share = item.price / item.assignedTo.length;
    for (const person of item.assignedTo) {
      totals[person] = (totals[person] ?? 0) + share;
    }
  }

  return totals;
}

export function formatSummaryText(
  totals: Record<string, number>,
  formatter: (n: number) => string,
): string {
  return Object.entries(totals)
    .filter(([, amount]) => amount > 0)
    .map(([person, amount]) => `${person} owes: ${formatter(amount)}`)
    .join("\n");
}
