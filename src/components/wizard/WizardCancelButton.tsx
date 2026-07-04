import { WizardAction } from "@/components/wizard/WizardAction";

interface WizardCancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function WizardCancelButton({
  onClick,
  disabled,
  label = "Cancel",
}: WizardCancelButtonProps) {
  return (
    <WizardAction
      type="button"
      variant="link"
      disabled={disabled}
      className="h-auto min-h-0 px-2 py-1 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
      onClick={onClick}
    >
      {label}
    </WizardAction>
  );
}
