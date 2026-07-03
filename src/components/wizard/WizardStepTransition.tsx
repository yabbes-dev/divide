"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface WizardStepTransitionProps {
  stepKey: number;
  children: ReactNode;
}

export function WizardStepTransition({
  stepKey,
  children,
}: WizardStepTransitionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 16, filter: "blur(6px)" }
        }
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -10, filter: "blur(4px)" }
        }
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full flex-col justify-center"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
