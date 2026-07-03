/**
 * Client-side API helpers.
 * All server communication goes through these functions — never call Gemini directly from components.
 */

import {
  getReceiptReferenceTotal,
  hasTotalMismatch,
  mapApiItemsToWizard,
  parseReceiptJson,
} from "@/lib/api/parse-receipt-mapper";
import {
  type ParseErrorCode,
} from "@/lib/api/parse-errors";
import { compressImageForUpload } from "@/lib/utils/compress-image";
import { toBase64 } from "@/lib/utils/toBase64";
import type { WizardItem } from "@/types/wizard";

export interface ParseReceiptResult {
  store: string;
  items: WizardItem[];
  receiptReferenceTotal?: number | null;
  totalMismatch?: boolean;
  model?: string;
}

export interface ParseReceiptResponse {
  success: boolean;
  data?: ParseReceiptResult;
  error?: string;
  errorCode?: ParseErrorCode;
  retryAfterMs?: number | null;
}

/** Send a receipt image to the parse-receipt API route. */
export async function parseReceiptImage(
  file: File,
): Promise<ParseReceiptResponse> {
  try {
    const compressed = await compressImageForUpload(file);
    const imageBase64 = await toBase64(compressed);

    const res = await fetch("/api/parse-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64,
        mimeType: "image/jpeg",
      }),
    });

    let data: {
      raw?: string;
      model?: string;
      error?: string;
      code?: ParseErrorCode;
      retryAfterMs?: number;
    };
    try {
      data = await res.json();
    } catch {
      return {
        success: false,
        error:
          res.status === 413
            ? "Image is too large. Try a smaller photo or screenshot."
            : `Server error (${res.status}). Please try again.`,
      };
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.error ?? `Failed to parse receipt (${res.status})`,
        errorCode: data.code,
        retryAfterMs: data.retryAfterMs ?? null,
      };
    }

    if (!data.raw) {
      return {
        success: false,
        error: "No data returned from the server.",
      };
    }

    const parsed = parseReceiptJson(data.raw);

    return {
      success: true,
      data: {
        store: parsed.store ?? "Receipt",
        items: mapApiItemsToWizard(parsed.items),
        receiptReferenceTotal: getReceiptReferenceTotal(parsed),
        totalMismatch: hasTotalMismatch(parsed),
        model: data.model,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to parse receipt",
    };
  }
}
