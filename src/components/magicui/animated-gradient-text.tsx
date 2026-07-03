"use client";

import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "animate-gradient bg-clip-text text-transparent",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--foreground), var(--primary), oklch(0.75 0.14 262), var(--foreground))",
        backgroundSize: "300% 100%",
      }}
    >
      {children}
    </span>
  );
}
