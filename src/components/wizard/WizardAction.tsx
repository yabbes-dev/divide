import { type ComponentProps, type ReactNode } from "react";

import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

export const wizardButtonClass =
  "h-11 shrink-0 rounded-none px-6 text-sm font-semibold whitespace-nowrap";

const actionButtonClass = cn(wizardButtonClass, "w-auto");

interface WizardActionProps extends Omit<ComponentProps<"button">, "children"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ComponentProps<typeof Button>["size"];
}

export function WizardActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-stretch gap-2",
        "sticky bottom-0 z-10 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WizardAction({
  children,
  className,
  size = "lg",
  variant,
  type = "button",
  ...props
}: WizardActionProps) {
  const isPrimary = !variant || variant === "default";

  return (
    <div className="flex w-full justify-center">
      {isPrimary ? (
        <ShimmerButton
          type={type}
          className={cn(actionButtonClass, className)}
          {...props}
        >
          {children}
        </ShimmerButton>
      ) : (
        <Button
          type={type}
          size={size}
          variant={variant}
          className={cn(actionButtonClass, className)}
          {...props}
        >
          {children}
        </Button>
      )}
    </div>
  );
}
