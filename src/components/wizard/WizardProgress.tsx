import { WIZARD_STEP_COUNT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { WizardStep } from "@/types/wizard";

interface WizardProgressProps {
  step: WizardStep;
  className?: string;
}

export function WizardProgress({ step, className }: WizardProgressProps) {
  const current = step + 1;

  return (
    <div
      className={cn("flex flex-col items-center gap-2", className)}
      aria-label={`Step ${current} of ${WIZARD_STEP_COUNT}`}
    >
      <p className="text-label">
        Step {current} of {WIZARD_STEP_COUNT}
      </p>
      <div className="flex items-center gap-1.5" aria-hidden>
        {Array.from({ length: WIZARD_STEP_COUNT }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1 w-6 transition-colors",
              index <= step ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
