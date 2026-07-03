"use client";

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlurFade } from "@/components/magicui/blur-fade";
import { WizardAction, WizardActions } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import { formatCurrency, moneyClass } from "@/lib/utils/format";
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
  return (
    <div className="space-y-4">
      <BlurFade>
        <p className="text-center text-sm text-muted-foreground">
          Tap names to assign each item. Multiple people splits the cost equally.
        </p>
      </BlurFade>

      <div className="space-y-3">
        {items.map((item, index) => (
          <BlurFade key={item.id} delay={index * 0.05}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription>
                      {item.assignedTo.length > 1
                        ? `Split ${formatCurrency(item.price)} between ${item.assignedTo.length} people`
                        : item.assignedTo.length === 1
                          ? `Assigned to ${item.assignedTo[0]}`
                          : "Not assigned yet"}
                    </CardDescription>
                  </div>
                  <span className={cn("shrink-0 text-base", moneyClass)}>
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-2">
                  {people.map((person) => {
                    const isSelected = item.assignedTo.includes(person);
                    return (
                      <motion.button
                        key={person}
                        type="button"
                        onClick={() => onToggleAssignment(item.id, person)}
                        className="min-h-10"
                        whileTap={{ scale: 0.94 }}
                        layout
                      >
                        <Badge
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "h-9 cursor-pointer px-3.5 text-sm transition-all duration-200",
                            isSelected && "shadow-primary-glow",
                            !isSelected && "hover:bg-accent",
                          )}
                        >
                          {person}
                        </Badge>
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
          <p className="text-center text-sm text-amber-500">
            Assign every item to at least one person to continue.
          </p>
        </BlurFade>
      )}

      <WizardActions>
        <BlurFade delay={0.1}>
          <WizardAction disabled={!allItemsAssigned} onClick={onContinue}>
            Continue
          </WizardAction>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} />
      </WizardActions>
    </div>
  );
}
