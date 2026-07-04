"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import { useCurrency } from "@/lib/currency/CurrencyProvider";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  className?: string;
}

export function NumberTicker({ value, className }: NumberTickerProps) {
  const { formatMoney } = useCurrency();
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 200,
  });
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (!isInView) return;
    motionValue.set(reduceMotion ? value : value);
  }, [isInView, motionValue, reduceMotion, value]);

  useEffect(() => {
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = formatMoney(value);
      return;
    }

    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatMoney(latest);
      }
    });
  }, [formatMoney, reduceMotion, springValue, value]);

  return (
    <span ref={ref} className={cn("text-money", className)}>
      {formatMoney(0)}
    </span>
  );
}
