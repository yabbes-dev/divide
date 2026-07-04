import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type DivideLogoVariant = "full" | "mark" | "wordmark";

interface DivideLogoProps {
  variant?: DivideLogoVariant;
  className?: string;
  /** Height in px; width scales automatically */
  size?: number;
}

/** Receipt silhouette with zig-zag tear — centered inside the circular mark. */
const RECEIPT_PATH =
  "M12 9h16c1.7 0 3 1.3 3 3v14.5l-1.8 2.2-1.8-2-1.8 2.2-1.8-2-1.8 2.2-1.8-2-1.8 2.2-1.8-2-1.8 2.2-1.8-2L11 26.5V12c0-1.7 1.3-3 3-3z";

const LEFT_ITEMS = [
  { x: 13.5, y: 13.5, w: 5, h: 2 },
  { x: 13.5, y: 17.5, w: 3.5, h: 2 },
  { x: 13.5, y: 21.5, w: 4.5, h: 2 },
] as const;

const RIGHT_ITEMS = [
  { x: 21, y: 13.5, w: 4.5, h: 2 },
  { x: 21, y: 17.5, w: 5, h: 2 },
  { x: 21, y: 21.5, w: 3.5, h: 2 },
] as const;

function DivideMark({
  className,
  style,
  gradId,
  leftClipId,
  rightClipId,
}: {
  className?: string;
  style?: CSSProperties;
  gradId: string;
  leftClipId: string;
  rightClipId: string;
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
          <stop stopColor="#7B93FF" />
          <stop offset="0.55" stopColor="#5B7CFA" />
          <stop offset="1" stopColor="#4A6AE8" />
        </linearGradient>
        <clipPath id={leftClipId}>
          <rect x="10" y="8" width="9.5" height="24" />
        </clipPath>
        <clipPath id={rightClipId}>
          <rect x="20.5" y="8" width="9.5" height="24" />
        </clipPath>
      </defs>

      <circle cx="20" cy="20" r="20" fill={`url(#${gradId})`} />
      <ellipse cx="13" cy="12" rx="9" ry="7" fill="white" fillOpacity="0.1" />

      <path d={RECEIPT_PATH} fill="white" fillOpacity="0.97" />

      <rect x="19.25" y="11" width="1.5" height="16.5" rx="0.75" fill={`url(#${gradId})`} />

      <g clipPath={`url(#${leftClipId})`}>
        {LEFT_ITEMS.map((item) => (
          <rect
            key={`${item.x}-${item.y}`}
            x={item.x}
            y={item.y}
            width={item.w}
            height={item.h}
            rx={1}
            fill="#5B7CFA"
          />
        ))}
        <circle cx="15.5" cy="25.5" r="1.5" fill="#5B7CFA" fillOpacity="0.35" />
      </g>

      <g clipPath={`url(#${rightClipId})`}>
        {RIGHT_ITEMS.map((item) => (
          <rect
            key={`${item.x}-${item.y}`}
            x={item.x}
            y={item.y}
            width={item.w}
            height={item.h}
            rx={1}
            fill="#5B7CFA"
            fillOpacity="0.45"
          />
        ))}
        <circle cx="24.5" cy="25.5" r="1.5" fill="#5B7CFA" fillOpacity="0.35" />
      </g>
    </svg>
  );
}

export function DivideLogo({ variant = "full", className, size = 32 }: DivideLogoProps) {
  const uid = useId();
  const gradId = `divide-grad${uid}`;
  const leftClipId = `divide-left${uid}`;
  const rightClipId = `divide-right${uid}`;
  const markSize = variant === "wordmark" ? 0 : size;
  const wordmarkClass = cn(
    "font-semibold tracking-tight text-foreground",
    size >= 36 ? "text-2xl" : size >= 28 ? "text-xl" : "text-lg",
  );

  if (variant === "mark") {
    return (
      <DivideMark
        gradId={gradId}
        leftClipId={leftClipId}
        rightClipId={rightClipId}
        className={cn("shrink-0 rounded-full", className)}
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
        leftClipId={leftClipId}
        rightClipId={rightClipId}
        className="shrink-0 rounded-full"
        style={{ width: markSize, height: markSize }}
      />
      <span className={wordmarkClass}>Divide</span>
    </span>
  );
}
