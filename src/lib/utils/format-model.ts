/** User-facing model label, e.g. gemini-2.5-flash → gemini_2_5_flash */
export function formatModelDisplayName(model: string): string {
  return model.toLowerCase().replace(/[.-]/g, "_");
}
