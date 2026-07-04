"use client";

import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerDuration?: string;
}

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "rgba(255,255,255,0.35)",
      shimmerDuration = "2.5s",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-duration": shimmerDuration,
          } as CSSProperties
        }
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden",
          "rounded-none bg-primary font-semibold text-primary-foreground",
          "px-6 py-0",
          "shadow-primary-glow transition-transform active:scale-[0.98]",
          "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full animate-shimmer bg-[linear-gradient(110deg,transparent_25%,var(--shimmer-color)_50%,transparent_75%)] group-disabled:hidden"
        />
        <span className="relative z-10">{children}</span>
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";
