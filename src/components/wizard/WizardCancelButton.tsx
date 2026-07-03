import { WizardAction } from "@/components/wizard/WizardAction";

interface WizardCancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function WizardCancelButton({ onClick, disabled }: WizardCancelButtonProps) {
  return (
    <WizardAction
      type="button"
      variant="ghost"
      disabled={disabled}
      className="text-foreground/80 hover:text-foreground"
      onClick={onClick}
    >
      Cancel
    </WizardAction>
  );
}
