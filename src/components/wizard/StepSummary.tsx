"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BlurFade } from "@/components/magicui/blur-fade";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { WizardAction, WizardActions } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import { formatCurrency, moneyClass } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface StepSummaryProps {
  personTotals: Record<string, number>;
  onCopySummary: () => void;
  onStartNew: () => void;
  onCancel: () => void;
}

export function StepSummary({
  personTotals,
  onCopySummary,
  onStartNew,
  onCancel,
}: StepSummaryProps) {
  const entries = Object.entries(personTotals).filter(([, amount]) => amount > 0);
  const grandTotal = entries.reduce((sum, [, amount]) => sum + amount, 0);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {entries.map(([person, amount], index) => (
          <BlurFade key={person} delay={index * 0.07}>
            <Card className="overflow-hidden">
              <CardHeader className="pb-2 text-center">
                <CardDescription>{person}</CardDescription>
                <CardTitle className="text-3xl">
                  <NumberTicker value={amount} />
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  {person} owes {formatCurrency(amount)}
                </p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>

      <BlurFade delay={entries.length * 0.07 + 0.05}>
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <span className="font-medium">Total</span>
            <NumberTicker value={grandTotal} className={cn("text-lg", moneyClass)} />
          </CardContent>
        </Card>
      </BlurFade>

      <Separator />

      <WizardActions>
        <BlurFade delay={0.15}>
          <WizardAction onClick={onCopySummary}>Copy Summary</WizardAction>
        </BlurFade>
        <WizardAction variant="outline" onClick={onStartNew}>
          Start New Split
        </WizardAction>
        <WizardCancelButton onClick={onCancel} />
      </WizardActions>
    </div>
  );
}
