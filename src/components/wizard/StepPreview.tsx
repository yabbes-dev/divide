"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ReceiptPaper } from "@/components/receipt/ReceiptPaper";
import { BlurFade } from "@/components/magicui/blur-fade";
import { WizardAction, WizardActions } from "@/components/wizard/WizardAction";
import { WizardCancelButton } from "@/components/wizard/WizardCancelButton";
import {
  amountsMatchMoney,
  hasItemsTotalMismatch,
  isAdjustmentItem,
  sumItemPrices,
} from "@/lib/calculations/receipt-total";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { WizardItem } from "@/types/wizard";

interface StepPreviewProps {
  store?: string;
  items: WizardItem[];
  receiptReferenceTotal?: number | null;
  receiptTargetTotal?: number | null;
  onUpdateItem: (id: string, updates: Partial<Pick<WizardItem, "name" | "price">>) => void;
  onUpdateReceiptTotal: (total: number) => void;
  onUpdateStore: (store: string) => void;
  onContinue: () => void;
  onCancel: () => void;
}

const receiptFieldClass = cn(
  "h-8 rounded-none border-0 px-0 shadow-none",
  "bg-transparent text-zinc-900 placeholder:text-zinc-400",
  "!bg-transparent dark:!bg-transparent dark:text-zinc-900 dark:placeholder:text-zinc-400",
  "[&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.zinc.900)]",
  "[&:-webkit-autofill]:[box-shadow:0_0_0px_1000px_#fff_inset]",
  "focus-visible:ring-0",
);

const storeTitleClass = cn(
  receiptFieldClass,
  "h-auto py-1 text-center text-lg font-bold tracking-[0.15em] uppercase sm:text-xl",
);

function ReviewNotice({
  variant,
  children,
}: {
  variant: "warning" | "success";
  children: ReactNode;
}) {
  const Icon = variant === "warning" ? AlertCircle : CheckCircle2;
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        variant === "warning"
          ? "border-primary/20 bg-accent/40 text-foreground"
          : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          variant === "warning" ? "text-primary" : "text-chart-3",
        )}
        aria-hidden
      />
      <span>{children}</span>
    </p>
  );
}

export function StepPreview({
  store,
  items,
  receiptReferenceTotal,
  receiptTargetTotal,
  onUpdateItem,
  onUpdateReceiptTotal,
  onUpdateStore,
  onContinue,
  onCancel,
}: StepPreviewProps) {
  const itemsSum = sumItemPrices(items);
  const targetTotal = receiptTargetTotal ?? itemsSum;
  const itemsMismatch = hasItemsTotalMismatch(items, targetTotal);
  const receiptPhotoMismatch =
    receiptReferenceTotal != null &&
    receiptReferenceTotal > 0 &&
    !amountsMatchMoney(targetTotal, receiptReferenceTotal);
  const totalsAligned = !itemsMismatch && !receiptPhotoMismatch;

  const today = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-4">
      {itemsMismatch && (
        <BlurFade>
          <ReviewNotice variant="warning">
            Items add up to {formatCurrency(itemsSum)} but the total is{" "}
            {formatCurrency(targetTotal)}. Fix individual prices or update the
            total below — we&apos;ll add a discount/adjustment line if needed.
          </ReviewNotice>
        </BlurFade>
      )}
      {!itemsMismatch && receiptPhotoMismatch && (
        <BlurFade>
          <ReviewNotice variant="warning">
            Total ({formatCurrency(targetTotal)}) doesn&apos;t match the receipt
            photo ({formatCurrency(receiptReferenceTotal!)}). Set the total
            below to match your receipt.
          </ReviewNotice>
        </BlurFade>
      )}
      {totalsAligned && items.length > 0 && (
        <BlurFade>
          <ReviewNotice variant="success">
            Items add up to {formatCurrency(itemsSum)} — total looks good.
          </ReviewNotice>
        </BlurFade>
      )}
      <BlurFade>
        <ReceiptPaper>
          <div className="border-b border-dashed border-zinc-300 pb-4 text-center">
            <Input
              aria-label="Store name"
              value={store ?? ""}
              placeholder="Store name"
              onChange={(e) => onUpdateStore(e.target.value)}
              className={storeTitleClass}
            />
            <p className="mt-1 text-sm text-zinc-500">{today}</p>
          </div>

          <div className="py-2">
            <div className="mb-2 flex justify-between text-xs font-medium tracking-wide text-zinc-500 uppercase">
              <span>Item</span>
              <span>Price</span>
            </div>

            <ul className="divide-y divide-dashed divide-zinc-300">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn("py-3", isAdjustmentItem(item) && "bg-zinc-50/80")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Input
                      aria-label={`Item name for ${item.name}`}
                      value={item.name}
                      onChange={(e) =>
                        onUpdateItem(item.id, { name: e.target.value })
                      }
                      className={cn(receiptFieldClass, "flex-1 text-sm font-medium")}
                    />
                    <Input
                      aria-label={`Price for ${item.name}`}
                      type="number"
                      step={0.01}
                      inputMode="decimal"
                      value={item.price}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={cn(
                        receiptFieldClass,
                        "w-24 shrink-0 text-right text-sm tabular-nums sm:w-20",
                      )}
                    />
                  </div>
                  {item.discount != null && item.discount > 0 && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Discount: −{formatCurrency(item.discount)}
                      {item.originalPrice != null && item.originalPrice > item.price && (
                        <span className="ml-2 line-through opacity-60">
                          {" "}
                          was {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                    </p>
                  )}
                  {isAdjustmentItem(item) && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Adjusts item total to match your receipt
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <Separator className="my-3 border-dashed border-zinc-300" />

            <div className="space-y-1 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold tracking-wide text-zinc-900 uppercase">
                  Total
                </span>
                <Input
                  aria-label="Receipt total"
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  value={Number.isFinite(targetTotal) ? targetTotal : 0}
                  onChange={(e) =>
                    onUpdateReceiptTotal(parseFloat(e.target.value) || 0)
                  }
                  className={cn(
                    receiptFieldClass,
                    "w-28 shrink-0 text-right text-lg font-semibold tabular-nums sm:w-24",
                    itemsMismatch && "text-primary",
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-right text-xs tabular-nums",
                  itemsMismatch ? "text-primary" : "text-zinc-500",
                )}
              >
                Items sum: {formatCurrency(itemsSum)}
              </p>
            </div>
          </div>
        </ReceiptPaper>
      </BlurFade>

      <WizardActions>
        <BlurFade delay={0.1}>
          <WizardAction onClick={onContinue}>Continue</WizardAction>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} />
      </WizardActions>
    </div>
  );
}
