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
  onCancel: () => void;
}

export function StepProcessing({ onCancel }: StepProcessingProps) {
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
            <CardTitle>Reading your receipt</CardTitle>
            <CardDescription>
              Extracting items and prices — this usually takes a few seconds.
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
