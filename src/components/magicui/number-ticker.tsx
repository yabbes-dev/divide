"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";

interface NumberTickerProps {
  value: number;
  className?: string;
}

export function NumberTicker({ value, className }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 55,
    stiffness: 90,
  });
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (!isInView) return;
    motionValue.set(reduceMotion ? value : value);
  }, [isInView, motionValue, reduceMotion, value]);

  useEffect(() => {
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = formatCurrency(value);
      return;
    }

    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatCurrency(latest);
      }
    });
  }, [reduceMotion, springValue, value]);

  return (
    <span ref={ref} className={cn("text-money", className)}>
      {formatCurrency(0)}
    </span>
  );
}
