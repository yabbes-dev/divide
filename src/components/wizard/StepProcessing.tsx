"use client";

import { useEffect, useState } from "react";
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
import { PROCESSING_MESSAGES } from "@/lib/design-tokens";

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
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!hasModel) return;
    const id = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % PROCESSING_MESSAGES.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [hasModel]);

  const description = hasModel
    ? `Reading with ${model} — ${PROCESSING_MESSAGES[messageIndex]}`
    : isWaiting
      ? "Finding the best reader…"
      : "This usually takes a few seconds.";

  return (
    <div className="space-y-4">
      <BlurFade>
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center">
              <motion.div
                className="size-10 border-2 border-primary/30 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <CardTitle>Reading your receipt</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </Card>
      </BlurFade>

      <WizardActions>
        <WizardCancelButton onClick={onCancel} label="Cancel scan" />
      </WizardActions>
    </div>
  );
}
