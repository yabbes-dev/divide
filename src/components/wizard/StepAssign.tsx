"use client";

import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlurFade } from "@/components/magicui/blur-fade";
import { InlineNotice } from "@/components/ui/inline-notice";
import { PersonAvatar } from "@/components/wizard/PersonAvatarChip";
import { WizardAction, WizardActions } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import { formatCurrency, moneyClass } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { wizardPanelClass } from "@/lib/wizard-styles";
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
  const assignedCount = items.filter((item) => item.assignedTo.length > 0).length;

  return (
    <div className="space-y-4">
      <BlurFade>
        <p className="text-center text-sm text-muted-foreground">
          {assignedCount} of {items.length} items assigned
        </p>
      </BlurFade>

      <div className="space-y-3">
        {items.map((item, index) => (
          <BlurFade key={item.id} delay={index * 0.05}>
            <Card className={cn(wizardPanelClass, "rounded-none")}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                  </div>
                  <span className={cn("shrink-0 text-base", moneyClass)}>
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-4">
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
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>

      {!allItemsAssigned && (
        <BlurFade>
          <InlineNotice variant="warning">
            Assign every item to continue.
          </InlineNotice>
        </BlurFade>
      )}

      <WizardActions>
        <BlurFade delay={0.1}>
          <WizardAction disabled={!allItemsAssigned} onClick={onContinue}>
            See totals
          </WizardAction>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} />
      </WizardActions>
    </div>
  );
}
