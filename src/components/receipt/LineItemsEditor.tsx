"use client";

import { SectionCard } from "@/components/layout/SectionCard";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/format";
import type { LineItem } from "@/types";

interface LineItemsEditorProps {
  lineItems: LineItem[];
  storeName?: string;
  date?: string | null;
  onUpdateItem: (itemId: string, updates: Partial<LineItem>) => void;
  onUpdateStoreName?: (name: string) => void;
}

export function LineItemsEditor({
  lineItems,
  storeName,
  date,
  onUpdateItem: _onUpdateItem,
  onUpdateStoreName,
}: LineItemsEditorProps) {
  // TODO: Only render when receipt has been parsed
  // TODO: Allow inline editing of item name, quantity, prices
  // TODO: Allow adding/removing line items

  if (lineItems.length === 0) {
    return null;
  }

  return (
    <SectionCard
      title="Review Items"
      description="Check that everything was extracted correctly."
    >
      {storeName && onUpdateStoreName && (
        <div className="mb-4 space-y-1.5">
          <label htmlFor="store-name" className="text-sm font-medium">
            Store
          </label>
          <Input
            id="store-name"
            value={storeName}
            onChange={(e) => onUpdateStoreName(e.target.value)}
          />
        </div>
      )}

      {date && (
        <p className="mb-4 text-sm text-muted-foreground">Date: {date}</p>
      )}

      <ul className="divide-y divide-border">
        {lineItems.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity}
                {item.unitPrice !== null && ` · ${formatCurrency(item.unitPrice)} each`}
              </p>
            </div>
            <span className="font-medium tabular-nums">
              {formatCurrency(item.totalPrice)}
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
