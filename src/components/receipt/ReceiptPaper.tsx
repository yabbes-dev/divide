import { cn } from "@/lib/utils";

interface ReceiptPaperProps {
  children: React.ReactNode;
  className?: string;
}

/** Zig-zag tear strip — teeth match receipt surface; page background shows through the gaps. */
const TEAR_EDGE_PATH =
  "M0,0 H400 V8 L392,12 L384,8 L376,12 L368,8 L360,12 L352,8 L344,12 L336,8 L328,12 L320,8 L312,12 L304,8 L296,12 L288,8 L280,12 L272,8 L264,12 L256,8 L248,12 L240,8 L232,12 L224,8 L216,12 L208,8 L200,12 L192,8 L184,12 L176,8 L168,12 L160,8 L152,12 L144,8 L136,12 L128,8 L120,12 L112,8 L104,12 L96,8 L88,12 L80,8 L72,12 L64,8 L56,12 L48,8 L40,12 L32,8 L24,12 L16,8 L8,12 L0,8 Z";

/** Receipt surface with zig-zag torn bottom edge. */
export function ReceiptPaper({ children, className }: ReceiptPaperProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-visible shadow-card dark:shadow-none",
        className,
      )}
    >
      <div className="bg-surface-receipt px-4 py-5 text-surface-receipt-foreground">
        {children}
      </div>
      <svg
        aria-hidden
        viewBox="0 0 400 12"
        preserveAspectRatio="none"
        className="-mt-px block h-4 w-full overflow-visible"
      >
        <path d={TEAR_EDGE_PATH} fill="var(--surface-receipt)" />
      </svg>
    </div>
  );
}
