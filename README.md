# MolFECAM — Frontend

Next.js 15 client for the [MolFECAM API](https://github.com/butwhyamritansh/MolFECAM-Backend).
Paste SMILES strings, get clinical-toxicity and FDA-approval predictions with
calibrated confidence, and inspect how much the incremental training run forgot.

## Quick start

```bash
npm install
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Open <http://localhost:3000>.

You need the backend running too. For UI work it can serve synthetic data
without downloading the 2 GB encoder:

```bash
cd ../backend && MOLFECAM_DEMO_MODE=1 uvicorn app.main:app --port 8000
```

The header shows a live badge — **API ready**, **Demo mode**, **Model not
loaded** or **API offline** — so the backend's state is never a mystery.

> **Node version.** Use Node 18.18–22 (see `.nvmrc`). Next.js 15 crashes under
> Node 23+ because Node now exposes a partial `localStorage` global on the
> server, and `next dev` throws `localStorage.getItem is not a function`. This
> is a Next.js issue, not application code — the app's own storage access is
> feature-detected in `src/lib/storage.ts`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Configuration

| Variable | Default | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Read by the browser, so a deployed frontend needs a **public** backend URL |

## Layout

```
src/
  app/          layout (metadata, theme bootstrap), page, design tokens
  components/   InputForm, ResultsPanel, PredictionCard,
                ForgettingMetrics + ForgettingChart, ApiStatus, ThemeToggle, ui
  hooks/        useApiResource (fetch + backoff), useElementWidth
  lib/          api (typed client), smiles, molecules, format, export, storage
  types/        api.ts — mirrors backend/app/schemas.py
```

## What changed in the rewrite

The previous version was largely `create-next-app` scaffolding:

- **`src/lib/api.ts` was an empty file.** Components called
  `fetch('http://localhost:8000/...')` inline, so the app only worked on one
  machine and had no timeout, no typing and no error shaping. There is now one
  typed client with an abort timeout and a real `ApiError`.
- **Errors were invisible.** A failed prediction did `console.error` and left
  the button spinning back to idle with no feedback. Failures now render.
- **Two of the four fields could never return anything.** "Taste" and
  "Tox21 ID" were hard-coded checkboxes, but the served checkpoint has no such
  heads — they always came back `null`. The field list now comes from
  `GET /heads`, so the UI can only offer what the model answers.
- **Batch capacity was unreachable.** The backend always accepted a list; the
  form sent `[singleValue]` from a one-line input. It is now a batch editor
  that accepts newline-, comma-, space- or tab-separated input with `#`
  comments, deduplicates, and pre-validates before the round trip.
- **The metrics panel polled every 5 seconds forever**, including while the
  backend was down. It now refreshes slowly and stops after repeated failures,
  with a manual retry.
- **Metadata said "Create Next App".**

Added on top: dark mode with no first-paint flash, a validated colourblind-safe
chart palette, a responsive SVG chart with hover, direct labels and a table
view, CSV/JSON export, keyboard submit, example molecules, skeleton loading
states and visible focus rings.

## Deploying

Set `NEXT_PUBLIC_API_URL` to your deployed backend in the hosting project's
environment variables. It is inlined at build time, so the site must be rebuilt
after changing it. A browser cannot reach `http://localhost:8000`, and a
browser on HTTPS cannot call a plain-HTTP backend — the API needs to be served
over HTTPS too, with the site's origin listed in the backend's
`MOLFECAM_CORS_ORIGINS`.
