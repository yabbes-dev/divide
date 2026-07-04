"use client";

import { Separator } from "@/components/ui/separator";
import { BlurFade } from "@/components/magicui/blur-fade";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { PersonAvatar } from "@/components/wizard/PersonAvatarChip";
import { WizardAction, WizardActions } from "@/components/wizard/WizardAction";
import { moneyClass } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface StepSummaryProps {
  personTotals: Record<string, number>;
  onCopySummary: () => void;
  onStartNew: () => void;
}

export function StepSummary({
  personTotals,
  onCopySummary,
  onStartNew,
}: StepSummaryProps) {
  const entries = Object.entries(personTotals).filter(([, amount]) => amount > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-center gap-3">
        {entries.map(([person, amount], index) => (
          <BlurFade key={person} delay={index * 0.07}>
            <div className="flex min-w-[7.5rem] flex-1 flex-col items-center gap-1 py-2 text-center sm:max-w-[9.5rem]">
              <PersonAvatar
                name={person}
                colorIndex={index}
                showName={false}
                className="w-auto"
              />
              <p className="mt-1 max-w-full truncate px-1 font-medium leading-tight">
                {person}
              </p>
              <p className="text-xs text-muted-foreground">owes</p>
              <NumberTicker
                value={amount}
                className={cn("mt-1.5 text-xl", moneyClass)}
              />
            </div>
          </BlurFade>
        ))}
      </div>

      <Separator />

      <WizardActions>
        <BlurFade delay={0.15}>
          <WizardAction onClick={onCopySummary}>Share totals</WizardAction>
        </BlurFade>
        <WizardAction variant="outline" onClick={onStartNew}>
          Split another receipt
        </WizardAction>
      </WizardActions>
    </div>
  );
}
