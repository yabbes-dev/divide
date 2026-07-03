"use client";

import { motion } from "motion/react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlurFade } from "@/components/magicui/blur-fade";
import { WizardActions } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";

interface StepProcessingProps {
  model?: string | null;
  isWaiting?: boolean;
  onCancel: () => void;
}

export function StepProcessing({
  model,
  isWaiting = true,
  onCancel,
}: StepProcessingProps) {
  const hasModel = Boolean(model);

  return (
    <div className="space-y-4">
      <BlurFade>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center">
              <motion.div
                className="size-10 border-2 border-primary/30 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <CardTitle>
              {hasModel ? "Processing your receipt" : "Reading your receipt"}
            </CardTitle>
            <CardDescription>
              {hasModel ? (
                <>
                  Processing with{" "}
                  <span className="font-mono text-foreground">{model}</span>
                </>
              ) : isWaiting ? (
                "Finding an available model — this usually takes a few seconds."
              ) : (
                "Extracting items and prices…"
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      </BlurFade>

      <WizardActions>
        <WizardCancelButton onClick={onCancel} />
      </WizardActions>
    </div>
  );
}
