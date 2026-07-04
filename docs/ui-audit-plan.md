# Divide — UX & UI Audit Plan

**Version:** 1.0  
**Date:** July 2026  
**Scope:** Visual polish, interaction feel, motion, copy, and design-system consistency  
**Constraint:** Flow is fixed — no IA, navigation, step order, or feature changes

---

# Executive Summary

Divide already has a clear, validated six-step flow and a distinctive visual direction (sharp corners, purple primary, dot-grid shell, receipt metaphor). The product reads as intentional rather than generic. Motion is present but unevenly applied. Copy is mostly human, though several screens still feel like “form completion” rather than “we just paid — let’s split this in 60 seconds.”

The biggest gaps are **wayfinding** (no progress sense within the fixed steps), **theme cohesion** (receipt preview breaks dark mode and token usage), **semantic colour inconsistency** (warnings use ad-hoc amber), and **mobile ergonomics** (primary actions and cancel compete equally; some tap targets are tight).

## Overall strengths

- Single-column, mobile-first layout (`max-w-lg`) suited to in-aisle use
- Strong landing identity: logo, gradient headline, shimmer CTA
- Receipt paper on review step is a memorable, on-brand metaphor
- Thoughtful error states: rate-limit dino game, retry countdown, model name on processing
- Live total validation on review reduces split anxiety
- Reduced-motion support on core step transitions and BlurFade
- Safe-area handling on shell and landing

## Overall weaknesses

- No visible step progress despite a six-step journey
- Receipt preview hardcodes `white` / `zinc-*` — breaks dark mode and design tokens
- “Banking” token naming and zero-radius everywhere can feel cold vs. friendly consumer app
- Primary actions all labelled “Continue” — low narrative momentum
- Cancel is always visible and equally weighted — high accidental exit risk mid-flow
- ShimmerButton lacks focus ring parity with `Button`
- Validation colours not tokenised (`text-amber-500`, inline primary accents)
- Legacy components (`Header`, `StepIndicator`, `receipt/*`) drift from active UI
- Duplicate error surfacing (toast + inline on upload)

## Scores

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **UX** | **7 / 10** | Flow is clear; missing progress, weak back behaviour communication, cancel prominence |
| **Visual** | **7.5 / 10** | Cohesive shell; receipt step and warning colours break system |
| **Delight** | **6.5 / 10** | Dino game, NumberTicker, shimmer — good seeds; completion moment underplayed |
| **Confidence** | **High** | Audit based on full wizard codebase, tokens, and copy inventory; recommendations are incremental |

---

# Prioritised Improvements

## High Impact / Low Effort

1. **Tokenise semantic colours** — `--warning`, `--success`, `--info`; replace `text-amber-500` and ad-hoc notice styles
2. **Unify ReceiptPaper with theme** — use `bg-card`, `text-card-foreground`, token borders; preserve white receipt in light mode only via explicit `receipt` surface token
3. **Step-specific primary button labels** — “Scan receipt”, “Looks good”, “Start splitting”, etc. (same actions, better copy)
4. **Add compact step indicator** — “Step 2 of 6” text or dots under AppLayout title (no nav change)
5. **Demote Cancel** — link-style or footer placement; keep function, reduce visual weight
6. **Fix ShimmerButton focus-visible** — match `Button` ring for keyboard users
7. **Remove duplicate parse error toast** when inline error already shown on upload
8. **Upload zone accessible name** — `aria-label="Upload receipt photo"` on drop target
9. **People input label** — visible or `aria-label="Person name"`
10. **Standardise validation message component** — single `InlineNotice` (warning / success / error)

## High Impact / Medium Effort

1. **Progress bar or step dots** — subtle, non-interactive, tied to `STEP_META`
2. **Receipt processing state** — replace spinner-only with staged copy rotation (“Reading prices…”, “Checking discounts…”) without changing wait logic
3. **Assign step selected state** — stronger visual (check icon, fill, haptic hook point for future)
4. **Summary completion moment** — brief success pulse on grand total card; optional subtle confetti only on “Copy Summary” success (not on load)
5. **Typography scale pass** — tighten hierarchy: page title vs. card title vs. money display
6. **Thumb-zone layout** — sticky bottom action bar on mobile for primary CTA
7. **Review step density** — sticky total row while scrolling long item lists
8. **Motion guidelines doc in code** — shared durations/easing constants
9. **Dark mode receipt** — warm off-white paper token or forced light “paper island” with clear boundary

## High Impact / High Effort

1. **Design token refactor** — rename “Banking” palette to consumer-friendly semantics; optional 4px radius on cards/buttons (brand decision)
2. **Font evaluation** — trial Plus Jakarta Sans or Outfit; A/B against DM Sans for warmth
3. **Haptic feedback hooks** — assign toggle, copy success (Capacitor/PWA future)
4. **Skeleton loading for processing** — receipt-shaped placeholder instead of blank spinner card
5. **Legacy code cleanup** — remove or archive unused `receipt/*`, wire or delete `StepIndicator`

---

# Screen-by-Screen Audit

## Landing (pre-wizard)

### What works
- Immediate value prop: “Split receipts fairly”
- Logo + wordmark establish brand
- BorderBeam + ShimmerButton create premium CTA
- Theme toggle accessible

### What feels weak
- “Get Started” is generic
- No social proof or one-line trust cue (privacy: “No account needed”)
- Dot pattern + blur may feel busy on small screens

### Recommendations
- CTA: “Split a receipt”
- Add single trust line under typewriter: “Your photo stays in this session — nothing is saved.”
- Reduce DotPattern opacity 10% on mobile via media query
- Gate BorderBeam behind `prefers-reduced-motion`

---

## Step 1 — Upload Receipt

### What works
- Drag/drop + camera covers supermarket use cases
- Helper text for photo quality
- Rate-limit card + dino is human and on-brand
- Try again / countdown pattern

### What feels weak
- Drop zone lacks accessible name
- “Continue” before user knows what happens next
- Error toast duplicates inline error
- `Processing…` on button during upload is vague

### Recommendations
- Primary: “Read receipt” or “Scan receipt”
- Loading button: “Uploading…”
- `aria-label` on drop zone; describe relationship to Take Photo
- HEIC error: friendlier “iPhone photos — try a screenshot instead”
- Visual: subtle upload icon bounce on file select (150ms, once)

---

## Step 2 — Processing

### What works
- Model name display builds trust (“Processing with gemini_2_5_flash_lite”)
- Two-phase copy (finding model → processing)
- Cancel available if wait is long

### What feels weak
- Generic spinner — feels like “loading” not “reading your receipt”
- No time expectation after 5s
- Cancel mid-parse may confuse (same as abort)

### Recommendations
- Rotating subcopy every 3s (same API call, copy only):
  - “Reading line items…”
  - “Checking prices…”
  - “Almost there…”
- After 8s: “Still working — complex receipts take a little longer.”
- Receipt-outline skeleton behind spinner
- Consider renaming cancel to “Cancel scan” here only

---

## Step 3 — Review Items

### What works
- ReceiptPaper metaphor is the product’s hero moment
- Inline edit for names/prices/total
- Live items-sum vs. total validation
- Adjustment line for missed discounts
- Success notice when aligned

### What feels weak
- Hardcoded zinc/white breaks dark mode
- Long receipts: total scrolls away
- “Continue” doesn’t confirm review happened
- Column headers “ITEM / PRICE” feel receipt-accurate but cold

### Recommendations
- Introduce `--surface-receipt` token (light: white + shadow; dark: warm gray paper on sunken tray)
- Sticky footer on receipt: total + items sum always visible
- Primary: “Looks good” or “Confirm items”
- Softer headers: “Item” / “Amount”
- Micro-animation: success checkmark when totals align (200ms scale)

---

## Step 4 — Add People

### What works
- Badge chips with spring animation
- Enter key adds person
- Clear minimum-two rule

### What feels weak
- Typing names in a supermarket is friction
- “Add person” placeholder only — no label
- “Add” button small next to full-width input
- No duplicate-name feedback (handled silently in hook)

### Recommendations
- Input label: “Name”
- Primary: “Next — assign items”
- Helper: “First names are fine — e.g. Alex, Sam”
- On duplicate: inline “Already added” (copy only, same logic)
- Larger Add button min-width; 44px touch height confirmed
- Optional: autofocus input on step enter (mobile: opens keyboard — use sparingly)

---

## Step 5 — Assign Items

### What works
- Per-item cards scannable
- Badge toggle with tap scale
- Status line explains split logic clearly
- Price visible per item

### What feels weak
- Many items = long scroll; no progress sense
- Unassigned warning uses raw amber, not token
- Selected state relies on glow — subtle in sunlight
- “Continue” again

### Recommendations
- Token warning for unassigned message
- Selected badge: check icon + `aria-pressed`
- Primary: “See totals” or “Calculate split”
- Progress hint: “3 of 8 items assigned” (derived UI, no flow change)
- `whileTap` + brief colour flash on assign (already partial)

---

## Step 6 — Summary

### What works
- NumberTicker on amounts — satisfying reveal
- Per-person cards feel celebratory
- Copy Summary + Start New Split
- Grand total card

### What feels weak
- No “done” emotional beat
- “Copy Summary” is utilitarian
- Cancel on final step is rarely needed
- Clipboard format plain text only

### Recommendations
- Headline in AppLayout: “All sorted” or keep “Summary” with warmer subtitle
- Primary: “Share totals” (same copy action)
- Secondary: “Split another receipt”
- Hide or demote Cancel on summary
- On copy success: toast “Sent to clipboard — paste in your group chat”
- Subtle scale-in on grand total card (300ms, once)

---

# Design Tokens

## Colours

Keep hue ~262 (brand purple). Shift naming from “Banking” to consumer semantics.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--background` | oklch(0.99 0.004 250) | oklch(0.09 0.015 250) | Page |
| `--foreground` | oklch(0.12 0.03 250) | oklch(0.98 0.006 250) | Text |
| `--primary` | oklch(0.50 0.18 262) | oklch(0.62 0.19 262) | CTAs, links |
| `--primary-foreground` | oklch(0.99 0 0) | oklch(0.99 0 0) | On primary |
| `--surface-sunken` | oklch(0.965 0.01 250) | oklch(0.13 0.02 250) | Inputs, drop zones |
| `--surface-receipt` | oklch(1 0 0) | oklch(0.22 0.02 250) | Receipt paper |
| `--success` | oklch(0.55 0.14 155) | oklch(0.65 0.14 155) | Valid totals, confirmations |
| `--success-subtle` | oklch(0.55 0.14 155 / 12%) | oklch(0.65 0.14 155 / 15%) | Success notice bg |
| `--warning` | oklch(0.62 0.14 75) | oklch(0.72 0.12 75) | Mismatch, unassigned |
| `--warning-subtle` | oklch(0.62 0.14 75 / 12%) | oklch(0.72 0.12 75 / 15%) | Warning notice bg |
| `--info` | oklch(0.50 0.18 262) | oklch(0.62 0.19 262) | Informational notices |
| `--money` | `--foreground` | `--foreground` | Currency (existing) |
| `--destructive` | existing | existing | Errors |

**Interactive states**
- Hover: primary → 90% opacity (existing)
- Active: `translate-y-px` (existing on Button)
- Selected (assign): primary fill + `--success` check icon optional
- Disabled: 50% opacity (existing)
- Focus: `ring-3 ring-ring/50` — extend to ShimmerButton

## Spacing

Adopt consistent scale (align with Tailwind 4):

| Token | Value | Use |
|-------|-------|-----|
| `--space-page-x` | 20px (`px-5`) | Horizontal page padding |
| `--space-section` | 16px (`space-y-4`) | Between blocks within step |
| `--space-card` | 16px | Card internal (`--card-spacing`) |
| `--space-list` | 12px (`space-y-3`) | Item lists |
| `--space-action` | 12px (`gap-3`) | Between wizard buttons |

## Typography

**Current:** DM Sans 400–700 — neutral, readable, slightly corporate.

**Recommended alternative:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)  
**Why:** Rounded geometry, warm and modern, strong at display weights, excellent mobile legibility, widely used in consumer fintech and lifestyle apps. Pairs well with sharp layout if radius stays 0, or supports slight softening later.

**Scale (recommended)**

| Role | Size | Weight | Line height | Class |
|------|------|--------|-------------|-------|
| Display | 36px | 600 | 1.1 | `.text-display` |
| Page title | 24px | 600 | 1.2 | `.text-title` |
| Card title | 16px | 600 | 1.3 | `CardTitle` |
| Body | 14px | 400 | 1.5 | default |
| Body small | 12px | 400 | 1.4 | `text-xs` |
| Label | 12px | 500 | 1.3 | `.text-label` |
| Money large | 30px | 600 | 1.1 | Summary ticker |
| Money inline | 16px | 600 | 1.2 | `.text-money` |
| Button | 14px | 600 | 1 | `text-sm font-semibold` |

## Border radius

**Recommendation:** Keep `0` for brand distinction OR introduce **single radius token `--radius: 4px`** for cards/inputs only (not full pill). Decision gate in Phase 1 workshop. Until then, stay at 0 for consistency.

## Elevation

| Level | Token | Use |
|-------|-------|-----|
| 0 | none | Flat lists |
| 1 | `--shadow-card` | Cards, receipt |
| 2 | `--shadow-primary-glow` | Primary buttons, selected badges |
| 3 | drop-shadow on receipt | Paper lift (light mode) |

## Motion durations

| Token | Value | Use |
|-------|-------|-----|
| `--motion-fast` | 150ms | Tap feedback, toggles |
| `--motion-base` | 320ms | Step transitions |
| `--motion-slow` | 450ms | BlurFade entrance |
| `--motion-stagger` | 50–70ms | List item delays |
| `--ease-out` | cubic-bezier(0.22, 1, 0.36, 1) | Entrances (existing) |

---

# Motion Guidelines

All motion must communicate state — not decorate.

| Moment | Animation | Spec | Reduced motion |
|--------|-----------|------|----------------|
| Step change | Fade + slide + blur | `WizardStepTransition` 320ms | Opacity only ✓ |
| Section enter | BlurFade | y:8, blur 6px, 450ms | Opacity only ✓ |
| List stagger | BlurFade delay | index × 50–70ms | No stagger |
| Primary CTA | Shimmer sweep | Existing | Disable shimmer |
| Button press | scale 0.98 | ShimmerButton | Keep |
| Assign toggle | scale 0.94 | whileTap | Keep |
| People chip | spring in/out | stiffness 420 | Opacity only |
| Upload file selected | icon bounce | y:-4→0, 150ms, once | None |
| Totals aligned | check scale | scale 0→1, 200ms | Show static icon |
| Summary amounts | NumberTicker | spring | Instant value ✓ |
| Processing | skeleton pulse | opacity 0.5↔1, 1.5s loop | Static skeleton |
| Copy success | toast slide | Sonner default | Text only |

**Avoid:** confetti on load, parallax, infinite hero animations on every screen, motion on rate-limit dino (already interactive).

---

# Microcopy Rewrite

## App metadata
- **Title:** Divide — Split receipts fairly
- **Description:** Snap a receipt, assign items, see who owes what. No account needed.

## Landing
- **Headline:** Split receipts fairly *(keep)*
- **Sub:** Upload. Assign. Done. *(keep)*
- **Trust line (new):** No account needed — your receipt stays on this device.
- **CTA:** Split a receipt

## Step 0 — Upload
- **Title:** Upload receipt
- **Description:** Snap or upload a photo of your receipt.
- **Drop zone label (a11y):** Upload receipt photo
- **Drop primary text:** Tap to upload
- **Helper:** Flat, well-lit photos read best.
- **Take Photo:** Use camera
- **Primary (idle):** Read receipt
- **Primary (loading):** Uploading…
- **Primary (retry):** Try again
- **Primary (wait):** Wait {time}
- **Cancel:** Cancel

## Step 1 — Processing
- **Title:** Reading your receipt
- **Description (idle):** This usually takes a few seconds.
- **Description (model):** Reading with {model}
- **Description (finding model):** Finding the best reader…
- **Rotating (optional):** Reading line items… / Checking prices… / Almost there…
- **Cancel:** Cancel scan

## Step 2 — Review
- **Title:** Review items
- **Description:** Fix anything that looks off — tap to edit.
- **Mismatch (items):** Items add up to {sum}, but your total is {target}. Update prices or set the total below.
- **Mismatch (photo):** Your total ({target}) doesn’t match the receipt ({reference}). Take another look before continuing.
- **Success:** Items add up to {sum} — you’re good to go.
- **Primary:** Looks good
- **Cancel:** Cancel

## Step 3 — People
- **Title:** Who’s splitting?
- **Description:** Add everyone sharing this bill.
- **Input label:** Name
- **Placeholder:** e.g. Alex
- **Add button:** Add
- **Helper:** Add at least two people.
- **Duplicate (new):** Already added.
- **Primary:** Next — assign items
- **Cancel:** Cancel

## Step 4 — Assign
- **Title:** Assign items
- **Description:** Tap a name for each item. Tap multiple to split evenly.
- **Unassigned:** Assign every item to continue.
- **Status assigned:** {name}’s item
- **Status split:** Split {amount} · {n} ways
- **Status empty:** Tap to assign
- **Progress (new):** {done} of {total} items assigned
- **Primary:** See totals
- **Cancel:** Cancel

## Step 5 — Summary
- **Title:** All sorted
- **Description:** Here’s what everyone owes.
- **Person line:** {name} owes {amount}
- **Total label:** Total
- **Primary:** Share totals
- **Secondary:** Split another receipt
- **Toast (copy):** Copied — paste in your group chat.

## Errors (tone pass)
- **Quota daily:** You’ve hit today’s free scan limit. Try again tomorrow — quotas reset overnight (Pacific time).
- **Rate limit:** Busy moment — wait {seconds}s, then try again.
- **HEIC:** This photo format isn’t supported. Take a screenshot of the receipt instead.
- **Parse fail:** Couldn’t read this receipt. Try a clearer photo.
- **API key:** Receipt scanning isn’t set up yet. (Production admin message — keep technical detail in logs only.)

## Toasts
- **Copy success:** Copied — paste in your group chat.
- **Parse error:** Only when not shown inline (upload step exception).

---

# Component Improvements

| Component | Improvements |
|-----------|--------------|
| **AppLayout** | Add optional step indicator slot; reduce title/description gap on small screens |
| **WizardStepTransition** | Export shared motion constants; document back-skip (step 2→0) in dev comments only |
| **WizardAction / ShimmerButton** | Focus ring; optional `loading` prop with spinner + label swap |
| **WizardCancelButton** | Variant `link` or `ghost` sm; move below primary with lower contrast |
| **StepUpload** | Accessible drop zone; remove duplicate toast; file-select micro-animation |
| **StepProcessing** | Skeleton receipt; rotating subcopy; staged messaging |
| **StepPreview / ReceiptPaper** | `--surface-receipt` token; sticky total; themed notices via `InlineNotice` |
| **StepPeople** | Labelled input; duplicate feedback; button sizing |
| **StepAssign** | `aria-pressed`; token warning; assignment progress text |
| **StepSummary** | Warmer completion; demote cancel; share-focused CTA |
| **ReviewNotice** | Rename to `InlineNotice`; variants: success, warning, error, info |
| **Card** | Optional `variant="elevated"` using shadow-card consistently |
| **Badge** | Selected state: icon + aria; min 44px touch on assign |
| **Input** | Consistent h-11 in wizard contexts |
| **DinoGame** | Already themed; no change needed |
| **LandingPage** | Trust line; reduce motion on decorative elements |
| **ThemeToggle** | Fine as-is |
| **Sonner toasts** | Align duration + copy tone with microcopy doc |

### New shared components (thin wrappers, no flow change)

1. **`InlineNotice`** — success / warning / error variants
2. **`WizardProgress`** — “Step {n} of 6” or dot row (display only)
3. **`StickyWizardActions`** — optional mobile bottom bar for primary CTA

---

# Implementation Roadmap

Each phase is split into PR-sized tasks. **Do not change step order or navigation.**

## Phase 1 — Foundation (tokens, type, semantics)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 1.1 | Add semantic colour tokens (`success`, `warning`, `info`, `surface-receipt`) | `globals.css` | S |
| 1.2 | Replace ad-hoc amber/primary notice colours with tokens | `StepPreview`, `StepAssign`, `StepUpload` | S |
| 1.3 | Create `InlineNotice` component | `components/ui/inline-notice.tsx` | S |
| 1.4 | Extend ShimmerButton focus-visible ring | `magicui/shimmer-button.tsx` | S |
| 1.5 | Document spacing/motion constants | `lib/design-tokens.ts` or CSS vars | S |
| 1.6 | Evaluate Plus Jakarta Sans — load alongside DM Sans, compare | `layout.tsx` | M |
| 1.7 | Typography utility audit (display/title/money) | `globals.css`, components | M |

## Phase 2 — Wayfinding & actions (no flow change)

| # | Task | Files | Effort |
|---|------|-------|--------|
| 2.1 | Add `WizardProgress` (“Step 2 of 6”) under AppLayout title | `AppLayout`, `SplitWizard` | S |
| 2.2 | Step-specific primary button labels | All step components | S |
| 2.3 | Demote Cancel styling | `WizardCancelButton`, steps | S |
| 2.4 | Hide Cancel on Summary step | `StepSummary` | S |
| 2.5 | Sticky primary action bar (mobile) | `WizardActions` | M |

## Phase 3 — Microcopy & feedback

| # | Task | Files | Effort |
|---|------|-------|--------|
| 3.1 | Apply microcopy doc to `STEP_META` | `SplitWizard.tsx` | S |
| 3.2 | Apply microcopy to all step bodies | Step components | S |
| 3.3 | Error message tone pass | `parse-errors`, API route, upload | S |
| 3.4 | Toast dedup on upload; copy toast rewrite | `SplitWizard`, `StepSummary` | S |
| 3.5 | Processing rotating subcopy | `StepProcessing` | S |
| 3.6 | Assign progress text `{done}/{total}` | `StepAssign` | S |

## Phase 4 — Receipt & review polish

| # | Task | Files | Effort |
|---|------|-------|--------|
| 4.1 | ReceiptPaper `--surface-receipt` + dark mode tray | `ReceiptPaper.tsx` | M |
| 4.2 | Remove hardcoded zinc from StepPreview | `StepPreview.tsx` | M |
| 4.3 | Sticky total row on long receipts | `StepPreview.tsx` | M |
| 4.4 | Success micro-animation on totals aligned | `StepPreview.tsx` | S |

## Phase 5 — Motion & delight

| # | Task | Files | Effort |
|---|------|-------|--------|
| 5.1 | Processing skeleton receipt | `StepProcessing.tsx` | M |
| 5.2 | Upload file-selected bounce | `StepUpload.tsx` | S |
| 5.3 | Assign `aria-pressed` + selected check | `StepAssign.tsx` | S |
| 5.4 | Summary grand total entrance | `StepSummary.tsx` | S |
| 5.5 | Gate BorderBeam/Typewriter on reduced motion | `LandingPage.tsx` | S |
| 5.6 | Landing trust line | `LandingPage.tsx` | S |

## Phase 6 — Accessibility & cleanup

| # | Task | Files | Effort |
|---|------|-------|--------|
| 6.1 | Upload a11y labels | `StepUpload.tsx` | S |
| 6.2 | People input label | `StepPeople.tsx` | S |
| 6.3 | Touch target audit (44px min) | Assign, People, Upload | M |
| 6.4 | Archive or remove legacy `receipt/*`, unused Header | codebase | M |
| 6.5 | Contrast pass on warning/success tokens | manual QA | S |

---

# Accessibility Checklist (for QA)

- [ ] All interactive elements ≥ 44×44px touch target
- [ ] Focus visible on ShimmerButton and custom motion buttons
- [ ] Upload drop zone has accessible name
- [ ] Form inputs have labels or `aria-label`
- [ ] Assign badges expose `aria-pressed`
- [ ] Colour not sole indicator — icons on success/warning notices
- [ ] Contrast ≥ 4.5:1 body text, ≥ 3:1 large text/UI components
- [ ] Reduced motion disables shimmer, border beam, typewriter
- [ ] Receipt content readable in dark mode (paper island or themed)
- [ ] Screen reader announces step progress (“Step 3 of 6, Review items”)

---

# Success Metrics (post-implementation)

Track qualitatively in user tests (supermarket context, one-handed):

1. Time to complete flow (should not increase)
2. Error recovery rate on review step (misread totals)
3. Accidental cancel rate
4. Subjective “felt easy / felt trustworthy” (5-point)
5. Dark mode usability on review step

---

# What we are explicitly NOT doing

- Adding login, history, payments, or social features
- Reordering or merging wizard steps
- Adding bottom tab navigation or side nav
- Enterprise dashboard aesthetics
- Gimmicky gamification beyond existing dino wait state
- Heavy confetti or sound effects

---

*This document is the single source of truth for the next polish phase. Implement one PR at a time; validate on a real phone between phases.*
