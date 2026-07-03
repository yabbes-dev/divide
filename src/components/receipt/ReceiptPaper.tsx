import { cn } from "@/lib/utils";

interface ReceiptPaperProps {
  children: React.ReactNode;
  className?: string;
}

/** White receipt surface with zig-zag torn bottom edge. */
export function ReceiptPaper({ children, className }: ReceiptPaperProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="bg-white px-4 py-5 text-zinc-900">{children}</div>
      <svg
        aria-hidden
        viewBox="0 0 400 12"
        preserveAspectRatio="none"
        className="block h-3 w-full text-background"
      >
        <path
          d="M0,0 H400 V8 L392,12 L384,8 L376,12 L368,8 L360,12 L352,8 L344,12 L336,8 L328,12 L320,8 L312,12 L304,8 L296,12 L288,8 L280,12 L272,8 L264,12 L256,8 L248,12 L240,8 L232,12 L224,8 L216,12 L208,8 L200,12 L192,8 L184,12 L176,8 L168,12 L160,8 L152,12 L144,8 L136,12 L128,8 L120,12 L112,8 L104,12 L96,8 L88,12 L80,8 L72,12 L64,8 L56,12 L48,8 L40,12 L32,8 L24,12 L16,8 L8,12 L0,8 Z"
          fill="white"
        />
        <path
          d="M0,12 L8,8 L16,12 L24,8 L32,12 L40,8 L48,12 L56,8 L64,12 L72,8 L80,12 L88,8 L96,12 L104,8 L112,12 L120,8 L128,12 L136,8 L144,12 L152,8 L160,12 L168,8 L176,12 L184,8 L192,12 L200,8 L208,12 L216,8 L224,12 L232,8 L240,12 L248,8 L256,12 L264,8 L272,12 L280,8 L288,12 L296,8 L304,12 L312,8 L320,12 L328,8 L336,12 L344,8 L352,12 L360,8 L368,12 L376,8 L384,12 L392,8 L400,12 V12 H0 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
