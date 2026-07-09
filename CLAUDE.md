# CLAUDE.md — Jamal Bhola Portfolio (JB-OS overhaul)

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4 portfolio,
mid-overhaul into an eDEX-UI / dex-ui-style sci-fi terminal cockpit.

## Current mission

Execute the implementation plan **task by task, in order**:

- **Plan:** `docs/superpowers/plans/2026-07-09-edex-ui-overhaul.md` (start here; use checkboxes to track)
- **Spec:** `docs/superpowers/specs/2026-07-09-edex-ui-overhaul-design.md` (design authority; §-refs in the plan point here)
- **Reference facts:** `docs/design/REFERENCE-ANALYSIS.md` (extracted eDEX/dex-ui colors, timings, choreography — do NOT clone those repos)

## Commands

```bash
npm install        # first run (node_modules is not committed)
npm run dev        # dev server, http://localhost:3000
npm run build      # production build — must stay green at every task boundary
npm run test       # vitest (added in plan Task 1)
npx tsc --noEmit   # typecheck
```

## Hard rules

1. **Content is frozen.** All user-visible copy (bio, projects, contact) lives in `lib/content.ts`
   (plan Task 2) and is migrated verbatim from the old `app/page.tsx` / `app/projects/page.tsx`.
   Never rewrite, "improve", or trim it. `tests/content.test.ts` is the gate.
2. **License wall.** eDEX-UI is GPL-3.0: never copy its code, fonts, sounds, or vendor data into
   this repo. Re-implement from `docs/design/REFERENCE-ANALYSIS.md` only.
3. **Only approved runtime dep:** `augmented-ui`. No three.js, xterm.js, howler, or animation libs.
4. **Verify before claiming done:** tsc + tests + build green, plus the plan step's preview checks
   (run the dev server and actually look — screenshots/inspection, not vibes).
5. Animate only `transform` / `opacity` / `clip-path`; respect `prefers-reduced-motion`
   (`html[data-motion="reduced"]`); keep canvases inside `WidgetBoundary` with sr-only fallbacks.
6. Hydration safety: time/random/storage values render stable placeholders server-side;
   all storage access in try/catch.

## Conventions

- Colors: split-channel CSS vars — `rgb(var(--color-r) var(--color-g) var(--color-b) / 0.5)`;
  themes switch via `data-theme` on `<html>`. Tailwind tokens: `text-accent`, `bg-panel`, etc.
- Fonts: Rajdhani (display, always uppercase + tracked) and Fira Code (terminal) via `next/font`.
- Sizing: `vh`-based with px floors — `text-[max(1.5vh,13px)]`.
- Server components by default; `"use client"` only where state/effects live.
- Cross-component signals (open project modal, switch tab, matrix egg) go through `lib/bus.ts`.
- Commit per completed plan task, conventional commits.

## Known flags (do not "fix" silently)

- Contact links say `github.com/jamalbhola` / `linkedin.com/in/jamalbhola`, but the repo remote
  is `github.com/jambho` and Twitter is `@jambho`. Preserved as-is — the user must confirm.
- `public/Jamal_Bhola_resume.pdf` is the served resume; don't rename or move it.
