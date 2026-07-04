"use client";

import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Banknote,
  Calculator,
  Carrot,
  Coffee,
  Coins,
  Percent,
  Receipt,
  Scale,
  ShoppingBag,
  ShoppingCart,
  SplitSquareHorizontal,
  Users,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type FloaterKind = "icon" | "glyph";

interface Floater {
  id: string;
  kind: FloaterKind;
  Icon?: LucideIcon;
  glyph?: string;
  left: string;
  top: string;
  size: number;
  rotate: number;
  duration: number;
  delay: number;
  driftX: number;
}

/** Periphery-only positions — keeps the center column clear for wizard content. */
const FLOATERS: Floater[] = [
  {
    id: "receipt",
    kind: "icon",
    Icon: Receipt,
    left: "5%",
    top: "8%",
    size: 44,
    rotate: -14,
    duration: 16,
    delay: 0,
    driftX: 6,
  },
  {
    id: "cart",
    kind: "icon",
    Icon: ShoppingCart,
    left: "88%",
    top: "11%",
    size: 42,
    rotate: 10,
    duration: 18,
    delay: 1.2,
    driftX: -5,
  },
  {
    id: "bag",
    kind: "icon",
    Icon: ShoppingBag,
    left: "3%",
    top: "28%",
    size: 38,
    rotate: -6,
    duration: 17,
    delay: 2.1,
    driftX: 4,
  },
  {
    id: "apple",
    kind: "icon",
    Icon: Apple,
    left: "2%",
    top: "48%",
    size: 40,
    rotate: -8,
    duration: 15,
    delay: 2.4,
    driftX: 7,
  },
  {
    id: "carrot",
    kind: "icon",
    Icon: Carrot,
    left: "6%",
    top: "66%",
    size: 36,
    rotate: 12,
    duration: 19,
    delay: 3.3,
    driftX: 5,
  },
  {
    id: "percent",
    kind: "icon",
    Icon: Percent,
    left: "91%",
    top: "34%",
    size: 40,
    rotate: 12,
    duration: 17,
    delay: 0.6,
    driftX: -6,
  },
  {
    id: "coins",
    kind: "icon",
    Icon: Coins,
    left: "93%",
    top: "52%",
    size: 38,
    rotate: -5,
    duration: 16,
    delay: 1.9,
    driftX: -4,
  },
  {
    id: "scale",
    kind: "icon",
    Icon: Scale,
    left: "89%",
    top: "68%",
    size: 42,
    rotate: 8,
    duration: 20,
    delay: 2.6,
    driftX: -7,
  },
  {
    id: "users",
    kind: "icon",
    Icon: Users,
    left: "7%",
    top: "82%",
    size: 44,
    rotate: -6,
    duration: 19,
    delay: 3,
    driftX: 5,
  },
  {
    id: "banknote",
    kind: "icon",
    Icon: Banknote,
    left: "85%",
    top: "84%",
    size: 42,
    rotate: 8,
    duration: 14,
    delay: 1.8,
    driftX: -6,
  },
  {
    id: "calculator",
    kind: "icon",
    Icon: Calculator,
    left: "16%",
    top: "18%",
    size: 36,
    rotate: -10,
    duration: 20,
    delay: 2,
    driftX: 4,
  },
  {
    id: "utensils",
    kind: "icon",
    Icon: UtensilsCrossed,
    left: "80%",
    top: "20%",
    size: 38,
    rotate: 6,
    duration: 16,
    delay: 0.3,
    driftX: -4,
  },
  {
    id: "coffee",
    kind: "icon",
    Icon: Coffee,
    left: "78%",
    top: "88%",
    size: 36,
    rotate: -9,
    duration: 18,
    delay: 4.1,
    driftX: -5,
  },
  {
    id: "wine",
    kind: "icon",
    Icon: Wine,
    left: "20%",
    top: "90%",
    size: 34,
    rotate: 7,
    duration: 15,
    delay: 3.8,
    driftX: 4,
  },
  {
    id: "split",
    kind: "icon",
    Icon: SplitSquareHorizontal,
    left: "12%",
    top: "56%",
    size: 34,
    rotate: -12,
    duration: 18,
    delay: 4,
    driftX: 6,
  },
  {
    id: "divide",
    kind: "glyph",
    glyph: "÷",
    left: "84%",
    top: "46%",
    size: 46,
    rotate: 4,
    duration: 15,
    delay: 2.8,
    driftX: -5,
  },
  {
    id: "equals",
    kind: "glyph",
    glyph: "=",
    left: "22%",
    top: "38%",
    size: 40,
    rotate: -4,
    duration: 17,
    delay: 1.5,
    driftX: 4,
  },
  {
    id: "plus",
    kind: "glyph",
    glyph: "+",
    left: "76%",
    top: "58%",
    size: 38,
    rotate: 6,
    duration: 16,
    delay: 0.9,
    driftX: -3,
  },
];

const FLOATER_CLASS =
  "absolute text-primary/22 dark:text-primary/30";

interface FloatingBackgroundProps {
  className?: string;
}

export function FloatingBackground({ className }: FloatingBackgroundProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_48%,transparent_42%,var(--background)_100%)]" />

      {FLOATERS.map((item) => {
        const style = {
          left: item.left,
          top: item.top,
          ["--float-rotate" as string]: `${item.rotate}deg`,
          ["--float-duration" as string]: `${item.duration}s`,
          ["--float-delay" as string]: `${item.delay}s`,
          ["--float-x" as string]: `${item.driftX}px`,
        };

        if (item.kind === "glyph" && item.glyph) {
          return (
            <span
              key={item.id}
              style={style}
              className={cn(
                FLOATER_CLASS,
                "font-semibold leading-none",
                !reduceMotion && "animate-float-drift",
              )}
            >
              <span style={{ fontSize: item.size }}>{item.glyph}</span>
            </span>
          );
        }

        const Icon = item.Icon!;
        return (
          <span
            key={item.id}
            style={style}
            className={cn(
              FLOATER_CLASS,
              !reduceMotion && "animate-float-drift",
            )}
          >
            <Icon
              strokeWidth={1.35}
              style={{ width: item.size, height: item.size }}
            />
          </span>
        );
      })}
    </div>
  );
}
