"use client";

import { SectionCard } from "@/components/layout/SectionCard";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { LineItem, Person, ItemAssignment } from "@/types";

interface ItemAssignmentProps {
  lineItems: LineItem[];
  people: Person[];
  assignments: ItemAssignment[];
  onAssign: (itemId: string, personIds: string[]) => void;
}

export function ItemAssignment({
  lineItems,
  people,
  assignments,
  onAssign,
}: ItemAssignmentProps) {
  // TODO: Only render when people have been added
  // TODO: Highlight unassigned items
  // TODO: Show visual indicator when item is split among multiple people

  if (lineItems.length === 0 || people.length === 0) {
    return null;
  }

  function getAssignedPersonIds(itemId: string): string[] {
    return assignments.find((a) => a.itemId === itemId)?.personIds ?? [];
  }

  function togglePerson(itemId: string, personId: string) {
    const current = getAssignedPersonIds(itemId);
    const updated = current.includes(personId)
      ? current.filter((id) => id !== personId)
      : [...current, personId];
    onAssign(itemId, updated);
  }

  return (
    <SectionCard
      title="Assign Items"
      description="Select who ordered each item."
    >
      <ul className="space-y-3">
        {lineItems.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-border bg-muted/30 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-medium">{item.name}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {formatCurrency(item.totalPrice)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {people.map((person) => {
                const isAssigned = getAssignedPersonIds(item.id).includes(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => togglePerson(item.id, person.id)}
                  >
                    <Badge
                      variant={isAssigned ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        !isAssigned && "hover:bg-accent",
                      )}
                    >
                      {person.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
