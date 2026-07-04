import { NextResponse } from "next/server";

import {
  currencyForCountry,
  DEFAULT_CURRENCY,
} from "@/lib/currency/constants";

/** Suggest currency from request geo headers (Vercel, Cloudflare, etc.). */
export async function GET(req: Request) {
  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-country-code");

  const currency = currencyForCountry(country);

  return NextResponse.json({
    currency,
    country: country?.toUpperCase() ?? null,
    source: country ? "geo" : "default",
    fallback: currency === DEFAULT_CURRENCY && !country,
  });
}
