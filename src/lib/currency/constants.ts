export const CURRENCY_STORAGE_KEY = "divide-currency";

export const DEFAULT_CURRENCY = "EUR" as const;

export type CurrencyCode =
  | "EUR"
  | "USD"
  | "GBP"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK"
  | "PLN"
  | "CAD"
  | "AUD"
  | "NZD"
  | "JPY"
  | "INR"
  | "SGD"
  | "AED";

export const CURRENCY_OPTIONS: {
  code: CurrencyCode;
  label: string;
  locale: string;
}[] = [
  { code: "EUR", label: "Euro", locale: "en-IE" },
  { code: "USD", label: "US Dollar", locale: "en-US" },
  { code: "GBP", label: "British Pound", locale: "en-GB" },
  { code: "CHF", label: "Swiss Franc", locale: "de-CH" },
  { code: "SEK", label: "Swedish Krona", locale: "sv-SE" },
  { code: "NOK", label: "Norwegian Krone", locale: "nb-NO" },
  { code: "DKK", label: "Danish Krone", locale: "da-DK" },
  { code: "PLN", label: "Polish Złoty", locale: "pl-PL" },
  { code: "CAD", label: "Canadian Dollar", locale: "en-CA" },
  { code: "AUD", label: "Australian Dollar", locale: "en-AU" },
  { code: "NZD", label: "New Zealand Dollar", locale: "en-NZ" },
  { code: "JPY", label: "Japanese Yen", locale: "ja-JP" },
  { code: "INR", label: "Indian Rupee", locale: "en-IN" },
  { code: "SGD", label: "Singapore Dollar", locale: "en-SG" },
  { code: "AED", label: "UAE Dirham", locale: "en-AE" },
];

const CURRENCY_CODES = new Set(CURRENCY_OPTIONS.map((c) => c.code));

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCY_CODES.has(value as CurrencyCode);
}

export function localeForCurrency(code: CurrencyCode): string {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.locale ?? "en-IE";
}

const symbolCache = new Map<CurrencyCode, string>();

/** Narrow currency symbol for compact UI (€, $, £, …). */
export function currencySymbol(code: CurrencyCode): string {
  const cached = symbolCache.get(code);
  if (cached) return cached;

  const symbol =
    new Intl.NumberFormat(localeForCurrency(code), {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? code;

  symbolCache.set(code, symbol);
  return symbol;
}

/** ISO 3166-1 alpha-2 country → default currency (approximate; not exact for every edge case). */
const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD",
  GB: "GBP",
  IE: "EUR",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  JP: "JPY",
  IN: "INR",
  SG: "SGD",
  AE: "AED",
  AT: "EUR",
  BE: "EUR",
  DE: "EUR",
  ES: "EUR",
  FI: "EUR",
  FR: "EUR",
  GR: "EUR",
  IT: "EUR",
  LU: "EUR",
  NL: "EUR",
  PT: "EUR",
  CY: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  MT: "EUR",
  SK: "EUR",
  SI: "EUR",
  HR: "EUR",
};

export function currencyForCountry(countryCode: string | null | undefined): CurrencyCode {
  if (!countryCode) return DEFAULT_CURRENCY;
  return COUNTRY_CURRENCY[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY;
}

export function formatMoneyAmount(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(localeForCurrency(currency), {
    style: "currency",
    currency,
  }).format(amount);
}
