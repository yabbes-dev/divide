/** Shared motion timings — keep in sync with globals.css where mirrored. */
export const MOTION = {
  fast: 0.15,
  base: 0.32,
  slow: 0.45,
  stagger: 0.07,
  easeOut: [0.22, 1, 0.36, 1] as const,
} as const;

export const WIZARD_STEP_COUNT = 6;

export const PROCESSING_MESSAGES = [
  "Reading line items…",
  "Checking prices…",
  "Almost there…",
] as const;
