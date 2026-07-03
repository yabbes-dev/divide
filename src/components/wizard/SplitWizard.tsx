"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
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
import type { WizardStep } from "@/types/wizard";

const STEP_META: Record<WizardStep, { title: string; description: string }> = {
  0: {
    title: "Upload Receipt",
    description: "Start by adding a photo of your grocery or restaurant receipt.",
  },
  1: {
    title: "Processing",
    description: "We're extracting items from your receipt.",
  },
  2: {
    title: "Review Items",
    description: "Check the extracted items and edit if needed.",
  },
  3: {
    title: "Add People",
    description: "Who's sharing this bill?",
  },
  4: {
    title: "Assign Items",
    description: "Choose who ordered each item.",
  },
  5: {
    title: "Summary",
    description: "Here's what everyone owes.",
  },
};

export function SplitWizard() {
  const wizard = useSplitWizard();
  const { step } = wizard;
  const meta = STEP_META[step];

  useEffect(() => {
    if (wizard.parseError && !isRateLimitUiError(wizard.parseErrorCode)) {
      toast.error(wizard.parseError);
    }
  }, [wizard.parseError, wizard.parseErrorCode]);

  async function handleCopySummary() {
    await wizard.copySummary();
    toast.success("Summary copied to clipboard");
  }

  if (!wizard.started) {
    return <LandingPage onGetStarted={wizard.startWizard} />;
  }

  return (
    <AppLayout
      title={meta.title}
      description={meta.description}
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
            onCancel={wizard.cancel}
          />
        )}
      </WizardStepTransition>
    </AppLayout>
  );
}
