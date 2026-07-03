"use client";

import { SectionCard } from "@/components/layout/SectionCard";
import { formatCurrency } from "@/lib/utils/format";
import type { SplitSummary } from "@/types";

interface ReceiptSummaryProps {
  summary: SplitSummary | null;
}

export function ReceiptSummary({ summary }: ReceiptSummaryProps) {
  // TODO: Only render when split has been calculated
  // TODO: Show per-person breakdown with item details
  // TODO: Highlight unassigned total if any items remain unassigned
  // TODO: Add "Start Over" button

  if (!summary) {
    return null;
  }

  return (
    <SectionCard
      title="Summary"
      description="Here's what everyone owes."
    >
      <ul className="divide-y divide-border">
        {summary.people.map((person) => (
          <li
            key={person.personId}
            className="flex items-center justify-between py-4"
          >
            <span className="font-medium">{person.personName}</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(person.amountOwed)}
            </span>
          </li>
        ))}
      </ul>

      {summary.unassignedTotal > 0 && (
        <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
          {formatCurrency(summary.unassignedTotal)} in unassigned items
        </p>
      )}
    </SectionCard>
  );
}
