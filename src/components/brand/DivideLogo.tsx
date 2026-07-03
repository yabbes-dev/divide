import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type DivideLogoVariant = "full" | "mark" | "wordmark";

interface DivideLogoProps {
  variant?: DivideLogoVariant;
  className?: string;
  /** Height in px; width scales automatically */
  size?: number;
}

function DivideMark({
  className,
  style,
  gradId,
  shineId,
}: {
  className?: string;
  style?: CSSProperties;
  gradId: string;
  shineId: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="6" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6B8FFF" />
          <stop offset="1" stopColor="#5B7CFA" />
        </linearGradient>
        <linearGradient id={shineId} x1="12" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0.35" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gradId})`} />
      <rect x="10" y="8" width="18" height="24" rx="4" fill="white" fillOpacity="0.14" />
      <path
        d="M19 11.5v17"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2.5 3"
      />
      <rect x="12.5" y="13" width="5" height="1.75" rx="0.875" fill="white" fillOpacity="0.9" />
      <rect x="12.5" y="17.25" width="4" height="1.75" rx="0.875" fill="white" fillOpacity="0.65" />
      <rect x="20.5" y="13" width="5" height="1.75" rx="0.875" fill="white" fillOpacity="0.9" />
      <rect x="21.5" y="17.25" width="4" height="1.75" rx="0.875" fill="white" fillOpacity="0.65" />
      <rect x="12" y="22.5" width="16" height="1.75" rx="0.875" fill="white" fillOpacity="0.45" />
      <path
        d="M26 20.5l3.25 3.25M26 23.75l3.25-3.25"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect width="40" height="40" rx="11" fill={`url(#${shineId})`} />
    </svg>
  );
}

export function DivideLogo({ variant = "full", className, size = 32 }: DivideLogoProps) {
  const uid = useId();
  const gradId = `divide-grad${uid}`;
  const shineId = `divide-shine${uid}`;
  const markSize = variant === "wordmark" ? 0 : size;
  const wordmarkClass = cn(
    "font-semibold tracking-tight text-foreground",
    size >= 36 ? "text-2xl" : size >= 28 ? "text-xl" : "text-lg",
  );

  if (variant === "mark") {
    return (
      <DivideMark
        gradId={gradId}
        shineId={shineId}
        className={cn("shrink-0", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  if (variant === "wordmark") {
    return <span className={cn(wordmarkClass, className)}>Divide</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <DivideMark
        gradId={gradId}
        shineId={shineId}
        className="shrink-0"
        style={{ width: markSize, height: markSize }}
      />
      <span className={wordmarkClass}>Divide</span>
    </span>
  );
}
