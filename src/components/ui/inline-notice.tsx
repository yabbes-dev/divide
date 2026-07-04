import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type InlineNoticeVariant = "success" | "warning" | "error" | "info";

const variantConfig: Record<
  InlineNoticeVariant,
  { Icon: typeof AlertCircle; className: string; iconClassName: string }
> = {
  success: {
    Icon: CheckCircle2,
    className: "border-success/25 bg-success-subtle text-foreground",
    iconClassName: "text-success",
  },
  warning: {
    Icon: AlertCircle,
    className: "border-warning/25 bg-warning-subtle text-foreground",
    iconClassName: "text-warning",
  },
  error: {
    Icon: XCircle,
    className: "border-destructive/30 bg-destructive/5 text-destructive",
    iconClassName: "text-destructive",
  },
  info: {
    Icon: Info,
    className: "border-primary/20 bg-accent/40 text-foreground",
    iconClassName: "text-primary",
  },
};

interface InlineNoticeProps {
  variant: InlineNoticeVariant;
  children: ReactNode;
  className?: string;
}

export function InlineNotice({ variant, children, className }: InlineNoticeProps) {
  const { Icon, className: variantClassName, iconClassName } =
    variantConfig[variant];

  return (
    <p
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        variantClassName,
        className,
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4 shrink-0", iconClassName)}
        aria-hidden
      />
      <span>{children}</span>
    </p>
  );
}
