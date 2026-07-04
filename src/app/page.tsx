import { CurrencyProvider } from "@/lib/currency/CurrencyProvider";
import { SplitWizard } from "@/components/wizard/SplitWizard";

export default function HomePage() {
  return (
    <CurrencyProvider>
      <SplitWizard />
    </CurrencyProvider>
  );
}
