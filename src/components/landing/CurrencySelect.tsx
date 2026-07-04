"use client";

import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CURRENCY_OPTIONS,
  currencySymbol,
  type CurrencyCode,
} from "@/lib/currency/constants";
import { useCurrency } from "@/lib/currency/CurrencyProvider";
import { cn } from "@/lib/utils";

interface CurrencySelectProps {
  className?: string;
}

function currencyOptionLabel(code: CurrencyCode, label: string) {
  return `${currencySymbol(code)} - ${label}`;
}

export function CurrencySelect({ className }: CurrencySelectProps) {
  const { currency, setCurrency } = useCurrency();

  const items = useMemo(
    () =>
      CURRENCY_OPTIONS.map((option) => ({
        value: option.code,
        label: currencyOptionLabel(option.code, option.label),
      })),
    [],
  );

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-muted-foreground",
        className,
      )}
    >
      <label
        id="currency-select-label"
        className="shrink-0 text-xs font-medium"
      >
        Currency
      </label>
      <Select<CurrencyCode>
        value={currency}
        onValueChange={(value) => {
          if (value) setCurrency(value);
        }}
        items={items}
        modal={false}
      >
        <SelectTrigger
          aria-labelledby="currency-select-label"
          className="text-foreground"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCY_OPTIONS.map((option) => (
            <SelectItem
              key={option.code}
              value={option.code}
              label={option.label}
            >
              {currencyOptionLabel(option.code, option.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
