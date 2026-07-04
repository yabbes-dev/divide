"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  formatMoneyAmount,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency/constants";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatMoney: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved && isCurrencyCode(saved)) {
      setCurrencyState(saved);
      return;
    }

    fetch("/api/geo-currency")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { currency?: string } | null) => {
        if (data?.currency && isCurrencyCode(data.currency)) {
          setCurrencyState(data.currency);
        }
      })
      .catch(() => {
        /* keep default */
      });
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  }, []);

  const formatMoney = useCallback(
    (amount: number) => formatMoneyAmount(amount, currency),
    [currency],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, formatMoney }),
    [currency, setCurrency, formatMoney],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
