"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ReceiptPaper } from "@/components/receipt/ReceiptPaper";
import { BlurFade } from "@/components/magicui/blur-fade";
import { InlineNotice } from "@/components/ui/inline-notice";
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
  "bg-transparent text-surface-receipt-foreground placeholder:text-receipt-muted",
  "!bg-transparent dark:!bg-transparent",
  "focus-visible:ring-0",
);

const storeTitleClass = cn(
  receiptFieldClass,
  "h-auto py-1 text-center text-lg font-bold tracking-[0.15em] uppercase sm:text-xl",
);

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
          <InlineNotice variant="warning">
            Items add up to {formatCurrency(itemsSum)}, but your total is{" "}
            {formatCurrency(targetTotal)}. Update prices or set the total below.
          </InlineNotice>
        </BlurFade>
      )}
      {!itemsMismatch && receiptPhotoMismatch && (
        <BlurFade>
          <InlineNotice variant="warning">
            Your total ({formatCurrency(targetTotal)}) doesn&apos;t match the
            receipt ({formatCurrency(receiptReferenceTotal!)}). Take another look
            before continuing.
          </InlineNotice>
        </BlurFade>
      )}
      {totalsAligned && items.length > 0 && (
        <BlurFade>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <InlineNotice variant="success">
              <span className="inline-flex items-center gap-1.5">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                  className="inline-flex"
                >
                  <Check className="size-3.5 text-success" aria-hidden />
                </motion.span>
                Items add up to {formatCurrency(itemsSum)} — you&apos;re good to
                go.
              </span>
            </InlineNotice>
          </motion.div>
        </BlurFade>
      )}
      <BlurFade>
        <ReceiptPaper>
          <div className="border-b border-dashed border-receipt pb-4 text-center">
            <Input
              aria-label="Store name"
              value={store ?? ""}
              placeholder="Store name"
              onChange={(e) => onUpdateStore(e.target.value)}
              className={storeTitleClass}
            />
            <p className="mt-1 text-sm text-receipt-muted">{today}</p>
          </div>

          <div className="max-h-[min(50vh,24rem)] overflow-y-auto py-2">
            <div className="mb-2 flex justify-between text-xs font-medium tracking-wide text-receipt-muted uppercase">
              <span>Item</span>
              <span>Price</span>
            </div>

            <ul className="divide-y divide-dashed divide-[var(--surface-receipt-border)]">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "py-3",
                    isAdjustmentItem(item) && "bg-[color-mix(in_oklch,var(--surface-receipt),var(--foreground)_4%)]",
                  )}
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
                    <p className="mt-1 text-xs text-receipt-muted">
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
                    <p className="mt-1 text-xs text-receipt-muted">
                      Adjusts item total to match your receipt
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <Separator className="my-3 border-dashed border-receipt" />

          <div className="sticky bottom-0 z-[1] -mx-4 bg-surface-receipt px-4 pb-1">
            <div className="space-y-1 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold tracking-wide text-surface-receipt-foreground uppercase">
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
                    itemsMismatch && "text-warning",
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-right text-xs tabular-nums",
                  itemsMismatch ? "text-warning" : "text-receipt-muted",
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
          <WizardAction onClick={onContinue}>Looks good</WizardAction>
        </BlurFade>
        <WizardCancelButton onClick={onCancel} />
      </WizardActions>
    </div>
  );
}
