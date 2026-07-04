"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { InlineNotice } from "@/components/ui/inline-notice";
import { PersonAvatar } from "@/components/wizard/PersonAvatarChip";
import { WizardAction, WizardActions } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import { useCurrency } from "@/lib/currency/CurrencyProvider";
import { moneyClass } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { WizardItem } from "@/types/wizard";

interface StepAssignProps {
  items: WizardItem[];
  people: string[];
  allItemsAssigned: boolean;
  onToggleAssignment: (itemId: string, person: string) => void;
  onContinue: () => void;
  onCancel: () => void;
}

export function StepAssign({
  items,
  people,
  allItemsAssigned,
  onToggleAssignment,
  onContinue,
  onCancel,
}: StepAssignProps) {
  const { formatMoney } = useCurrency();
  const assignedCount = items.filter((item) => item.assignedTo.length > 0).length;
  const [showAssignWarning, setShowAssignWarning] = useState(false);

  useEffect(() => {
    if (allItemsAssigned) {
      setShowAssignWarning(false);
    }
  }, [allItemsAssigned]);

  function handleBlockedContinue() {
    setShowAssignWarning(true);
  }

  return (
    <div className="space-y-4">
      <BlurFade>
        <p className="text-center text-sm text-muted-foreground">
          {assignedCount} of {items.length} items assigned
        </p>
      </BlurFade>

      <BlurFade delay={0.05}>
        <ul className="divide-y divide-border/60">
          {items.map((item) => {
            const isAssigned = item.assignedTo.length > 0;

            return (
              <li
                key={item.id}
                className={cn(
                  "border-l-2 py-4 pl-4 transition-opacity first:pt-0 last:pb-0",
                  isAssigned
                    ? "border-l-transparent opacity-100"
                    : "border-l-warning/70 opacity-90",
                )}
              >
                <div className="flex items-start justify-between gap-3 pr-1">
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    {isAssigned && (
                      <span
                        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        aria-hidden
                      >
                        <Check className="size-2.5" />
                      </span>
                    )}
                    <p className="min-w-0 text-sm font-semibold leading-snug">
                      {item.name}
                    </p>
                  </div>
                  <span className={cn("shrink-0 text-sm tabular-nums", moneyClass)}>
                    {formatMoney(item.price)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  {people.map((person, personIndex) => {
                    const isSelected = item.assignedTo.includes(person);
                    return (
                      <motion.button
                        key={person}
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={`${isSelected ? "Unassign" : "Assign"} ${item.name} to ${person}`}
                        onClick={() => onToggleAssignment(item.id, person)}
                        className="min-h-11 min-w-11 rounded-none"
                        whileTap={{ scale: 0.94 }}
                        layout
                      >
                        <PersonAvatar
                          name={person}
                          colorIndex={personIndex}
                          selected={isSelected}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </BlurFade>

      {showAssignWarning && !allItemsAssigned && (
        <BlurFade>
          <InlineNotice variant="warning">
            Assign every item to continue.
          </InlineNotice>
        </BlurFade>
      )}

      <WizardActions>
        <BlurFade delay={0.1}>
          <div className="relative mx-auto w-fit">
            {!allItemsAssigned && (
              <button
                type="button"
                aria-label="See totals — assign every item first"
                className="absolute inset-0 z-10 cursor-not-allowed rounded-none"
                onClick={handleBlockedContinue}
              />
            )}
            <WizardAction disabled={!allItemsAssigned} onClick={onContinue}>
              See totals
            </WizardAction>
          </div>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} />
      </WizardActions>
    </div>
  );
}
