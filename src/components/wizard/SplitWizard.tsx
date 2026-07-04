"use client";

import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { LandingPage } from "@/components/landing/LandingPage";
import { StepAssign } from "@/components/wizard/StepAssign";
import { StepPeople } from "@/components/wizard/StepPeople";
import { StepPreview } from "@/components/wizard/StepPreview";
import { StepProcessing } from "@/components/wizard/StepProcessing";
import { StepSummary } from "@/components/wizard/StepSummary";
import { StepUpload } from "@/components/wizard/StepUpload";
import { WizardStepTransition } from "@/components/wizard/WizardStepTransition";
import { useSplitWizard } from "@/hooks/useSplitWizard";
import { isRateLimitUiError } from "@/lib/api/parse-errors";
import { moneyClass } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { WizardStep } from "@/types/wizard";

const STEP_META: Record<WizardStep, { title: string; description: string }> = {
  0: {
    title: "Upload receipt",
    description: "Snap or upload a photo of your receipt.",
  },
  1: {
    title: "Reading your receipt",
    description: "This usually takes a few seconds.",
  },
  2: {
    title: "Review items",
    description: "Fix anything that looks off — tap to edit.",
  },
  3: {
    title: "Who's splitting?",
    description: "Add everyone sharing this bill.",
  },
  4: {
    title: "Assign items",
    description: "Tap a name for each item. Tap multiple to split evenly.",
  },
  5: {
    title: "All sorted!",
    description: "Here's what everyone owes.",
  },
};

export function SplitWizard() {
  const wizard = useSplitWizard();
  const { step } = wizard;
  const meta = STEP_META[step];
  const summaryGrandTotal = useMemo(
    () =>
      Object.values(wizard.personTotals).reduce(
        (sum, amount) => sum + (amount > 0 ? amount : 0),
        0,
      ),
    [wizard.personTotals],
  );

  useEffect(() => {
    if (
      wizard.parseError &&
      wizard.step !== 0 &&
      !isRateLimitUiError(wizard.parseErrorCode)
    ) {
      toast.error(wizard.parseError);
    }
  }, [wizard.parseError, wizard.parseErrorCode, wizard.step]);

  async function handleCopySummary() {
    await wizard.copySummary();
    toast.success("Copied — paste in your group chat.");
  }

  if (!wizard.started) {
    return <LandingPage onGetStarted={wizard.startWizard} />;
  }

  return (
    <AppLayout
      title={meta.title}
      description={meta.description}
      headerExtra={
        step === 5 ? (
          <p className="text-sm text-muted-foreground">
            Total{" "}
            <NumberTicker
              value={summaryGrandTotal}
              className={cn("font-semibold text-foreground", moneyClass)}
            />
          </p>
        ) : undefined
      }
      step={step}
      onBack={wizard.canGoBack ? wizard.prevStep : undefined}
    >
      <WizardStepTransition stepKey={step}>
        {step === 0 && (
          <StepUpload
            imagePreview={wizard.imagePreview}
            isLoading={wizard.isProcessing}
            error={wizard.parseError}
            errorCode={wizard.parseErrorCode}
            retryAfterMs={wizard.retryAfterMs}
            onSelectFile={wizard.setImageFile}
            onClearImage={wizard.clearImageFile}
            onContinue={wizard.parseReceipt}
            onCancel={wizard.cancel}
          />
        )}

        {step === 1 && (
          <StepProcessing
            model={wizard.processingModel}
            isWaiting={wizard.isProcessing && !wizard.processingModel}
            onCancel={wizard.cancel}
          />
        )}

        {step === 2 && (
          <StepPreview
            store={wizard.receipt.store}
            items={wizard.receipt.items}
            receiptReferenceTotal={wizard.receipt.receiptReferenceTotal}
            receiptTargetTotal={wizard.receipt.receiptTargetTotal}
            onUpdateItem={wizard.updateItem}
            onUpdateReceiptTotal={wizard.updateReceiptTotal}
            onUpdateStore={wizard.updateStore}
            onContinue={wizard.nextStep}
            onCancel={wizard.cancel}
          />
        )}

        {step === 3 && (
          <StepPeople
            people={wizard.receipt.people}
            onAddPerson={wizard.addPerson}
            onRemovePerson={wizard.removePerson}
            onContinue={wizard.nextStep}
            onCancel={wizard.cancel}
          />
        )}

        {step === 4 && (
          <StepAssign
            items={wizard.receipt.items}
            people={wizard.receipt.people}
            allItemsAssigned={wizard.allItemsAssigned}
            onToggleAssignment={wizard.toggleAssignment}
            onContinue={wizard.nextStep}
            onCancel={wizard.cancel}
          />
        )}

        {step === 5 && (
          <StepSummary
            personTotals={wizard.personTotals}
            onCopySummary={handleCopySummary}
            onStartNew={wizard.reset}
          />
        )}
      </WizardStepTransition>
    </AppLayout>
  );
}
