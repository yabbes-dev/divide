# Divide

AI-powered receipt splitting web app. Upload a receipt, review extracted items, assign them to people, and see who owes what.

## What it does

1. Upload a grocery or restaurant receipt image
2. AI extracts structured line items (store, date, items, prices)
3. Review and edit extracted data
4. Add people and assign items
5. Automatically calculate each person's share
6. Display a clean summary

This is a **receipt splitting tool**, not a full expense tracker. No auth, no database, no payments — everything lives in browser state.

## Tech stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Google Gemini API** (via `/api/parse-receipt`)
- **Vercel** deployment

## Getting started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Gemini API key to .env.local
# GEMINI_API_KEY=your_key_here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable         | Required | Description                          |
| ---------------- | -------- | ------------------------------------ |
| `GEMINI_API_KEY` | Yes      | Google Gemini API key (server-side)  |
| `GEMINI_MODEL`   | No       | Override default model (optional)    |

## Project structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/
│   │   └── parse-receipt/  # Receipt parsing endpoint (calls lib/ai)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main single-page flow
│   └── globals.css         # Global styles
├── components/
│   ├── layout/             # Header, Container
│   ├── receipt/            # Feature components (upload, editor, summary)
│   └── ui/                 # Reusable UI primitives (Button, Card, Input)
├── hooks/
│   └── useReceiptState.ts  # Central browser state for the splitting flow
├── lib/
│   ├── ai/                 # AI provider abstraction (Gemini, future: OpenAI)
│   ├── api/                # Client-side API helpers
│   ├── calculations/       # Pure split calculation logic
│   └── utils/              # Formatting, ID generation, normalization
└── types/                  # Shared TypeScript domain types
```

## Architecture principles

- **AI logic is isolated** in `lib/ai/` — components never call Gemini directly
- **Receipt parsing** goes through `/api/parse-receipt`
- **Business logic** lives outside UI components (`lib/calculations/`, `lib/utils/`)
- **Browser state only** — no persistence, no auth
- **Provider swappable** — Gemini today, OpenAI tomorrow via `lib/ai/`

## Development roadmap

- [ ] Implement Gemini receipt parsing in `lib/ai/gemini.ts`
- [ ] Wire `/api/parse-receipt` route
- [ ] Implement `useReceiptState` hook
- [ ] Connect upload → parse → review → people → assign → summary flow
- [ ] Implement split calculations in `lib/calculations/splits.ts`
- [ ] Add drag-and-drop upload
- [ ] Deploy to Vercel

## Deploy on Vercel

Push to GitHub and import the repo in [Vercel](https://vercel.com). Add `GEMINI_API_KEY` in project environment variables.
