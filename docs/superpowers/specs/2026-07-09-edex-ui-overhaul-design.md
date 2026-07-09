# Design Spec: eDEX-UI / dex-ui Portfolio Overhaul

**Date:** 2026-07-09
**Status:** Approved for implementation
**Scope:** Visual/UX overhaul only. All existing content is preserved verbatim (see §12). No content rewrites, no new copy beyond UI chrome labels and terminal flavor text.

---

## 1. Goal

Rebuild the presentation layer of Jamal Bhola's portfolio (Next.js 15 / React 19 / Tailwind 4) as a fullscreen sci-fi terminal "cockpit" in the style of [eDEX-UI](https://github.com/GitSquared/edex-ui) and [dex-ui](https://github.com/seenaburns/dex-ui): a boot sequence, a three-column panel layout around a central interactive terminal, canvas-drawn instrument widgets, chamfered panel borders, CRT-flavored effects, staggered panel-entrance animations, and a multi-theme color system.

### Non-goals

- No content changes (bio, project data, contact links stay word-for-word).
- No backend, no real system monitoring, no PTY/xterm.
- No on-screen QWERTY keyboard (eDEX's bottom third). Cut deliberately: enormous effort, no web utility. A stretch-goal note exists in §15.
- No deployment work (CI, hosting) beyond keeping `npm run build` green.

## 2. Approaches considered

| | Approach | Verdict |
|---|---|---|
| **A** | **Full cockpit SPA** — fullscreen, no document scroll, three columns + bottom project browser, terminal-driven navigation, boot intro | **Chosen.** Truest to both references (neither scrolls). Matches "completely overhaul" + "most impressive possible." |
| B | Hybrid — cockpit chrome, scrollable content inside center panel | Rejected: scrolling content breaks the instrument-panel illusion; halfway result. |
| C | Reskin existing scrolling site with eDEX colors | Rejected: not an overhaul; fails the brief. |

Risk accepted with A: mobile needs a distinct layout (defined in §8) and content density is constrained (solved by modals + terminal paging).

## 3. Reference analysis (what makes them look the way they look)

Full extraction with exact values lives in [docs/design/REFERENCE-ANALYSIS.md](../../design/REFERENCE-ANALYSIS.md). Summary of the load-bearing signatures, all of which must appear in the final site:

1. **Boot ritual** — fast-scrolling fake kernel log → glitching title card → panels expand/stagger in. (eDEX `_renderer.js`)
2. **Panel language** — thin (≈2px) borders at 50% alpha with chamfered corners (augmented-ui), tiny two-part uppercase title bars with tick marks, near-black `#05080d` background with a faint grid.
3. **Split RGB theme variables** — colors stored as separate `r,g,b` channels so every alpha variant derives from one accent (`rgba(var(--color_r),var(--color_g),var(--color_b),0.3)`).
4. **vh-based sizing** — every eDEX dimension is in `vh`, so the cockpit scales like a rendered image.
5. **Instrument motion** — dex-ui's model: everything *draws itself in* (tick lines grow, text types on, elements flicker before settling) using eased 300–700ms animations, including a quintic ease that overshoots then settles.
6. **Trapezoid tabs** — `skewX(35deg)` parallelogram tabs, active tab filled + scaled.
7. **Sound as feedback** — short synthetic ticks for stdout/keys, whoosh for panel expansion.
8. **Fonts** — United Sans (squarish condensed techno) for UI; Fira Mono for terminal.

**Licensing constraint (hard rule):** eDEX-UI is **GPL-3.0** — its code, fonts, sounds, and the ENCOM globe vendor JS must NOT be copied into this repo. dex-ui is BSD (C++ anyway). Everything is **re-implemented from scratch**; the reference analysis doc records only facts (colors, timings, geometry), which is what agents work from.

## 4. Design language (tokens)

### 4.1 Color themes

Colors are split-channel CSS custom properties on `:root`, exactly the eDEX pattern:

```css
:root[data-theme="tron"] {
  --color-r: 170; --color-g: 207; --color-b: 209; /* accent #aacfd1 */
  --bg-black: #000000;       /* deepest layer, boot screen */
  --bg-panel: #05080d;       /* panel fill "light black" */
  --bg-grey:  #262828;       /* grid base */
}
/* usage */ color: rgb(var(--color-r), var(--color-g), var(--color-b));
/* alpha */ border-color: rgba(var(--color-r), var(--color-g), var(--color-b), 0.5);
```

Five themes, palettes lifted from eDEX theme JSONs (facts, not code):

| Theme | Accent RGB | bg-panel | bg-black | bg-grey | Notes |
|---|---|---|---|---|---|
| `tron` (default) | 170, 207, 209 | #05080d | #000000 | #262828 | Pale cyan; the canonical look |
| `matrix` | 0, 143, 17 | #090b0a | #0d0208 | #262827 | Phosphor green |
| `blade` | 204, 94, 55 | #090b0a | #000000 | #262827 | Burnt orange (nods to current site's `#ff6b35` accent) |
| `apollo` | 235, 235, 235 | #191919 | #000000 | #262827 | Monochrome white |
| `interstellar` | 3, 169, 244 | #dedede | #f3f3f3 | #bfbfbf | Light theme (accent-on-light; inverted text rules) |

Semantic derivations (same for all themes): `--accent` = rgb(channels); text = accent; muted text = accent @ 0.55; borders = accent @ 0.5; hairlines = accent @ 0.3; panel glow = accent @ 0.2. Status colors: ok = accent, warn = `#ffcc00`, error = `#ff4444` (constant across themes).

Theme is set via `data-theme` on `<html>`, persisted to `localStorage("theme")`, switchable from the status bar and the `theme <name>` terminal command. Default `tron` on first visit.

### 4.2 Typography

| Role | Font (next/font/google) | Reference equivalent | Usage |
|---|---|---|---|
| UI / display | **Rajdhani** (500, 700) | United Sans Medium/Light | Panel titles, tabs, big numerals, headings — always `text-transform: uppercase`, `letter-spacing: 0.05–0.15em` |
| Terminal / data | **Fira Code** (400, 500) | Fira Mono | Terminal, boot log, data readouts, labels |

Type scale (desktop, vh-derived like eDEX): boot log `1.4vh`; panel title `1.1vh`; body/terminal `1.6vh`; big clock `4vh`; title card `10vh`. Floor every size with `max(Xvh, Ypx)` so small windows stay legible (e.g. terminal `max(1.6vh, 13px)`).

### 4.3 Geometry & chrome

- **Chamfered corners:** `augmented-ui@2` (MIT, npm). Canonical panel: `data-augmented-ui="tl-clip br-clip both"`; main terminal: `bl-clip tr-clip both`; modals: `tl-clip tr-clip br-clip bl-clip border`. `--aug-border-all: 2px`, border color accent @ 0.5.
- **Panel title bars:** `<h3>` with two `<p>` (left = category, right = name), e.g. `PANEL // SYSTEM`, `1.1vh` uppercase, hairline bottom border with 4px end ticks (`::before/::after` vertical hairlines), exactly the eDEX title pattern.
- **Background:** `bg-grey` base with faint grid — two layered `linear-gradient`s of `bg-panel`, cell size `2vh` — behind everything; panels sit on `bg-panel` fill at 85% opacity so grid ghosts through.
- **Scrollbars (inside panels only):** 8px, track accent @ 0.4 bordered by `bg-panel`, thumb solid accent.
- **Scanline/CRT layer:** fixed, full-viewport, `pointer-events:none`: repeating horizontal 2px scanlines at 3% alpha + a slow 8s vertical "sweep" gradient + very subtle vignette. Pure CSS. Disabled under reduced motion (§10) and toggleable via `fx` command.

## 5. Layout architecture (desktop ≥1024px)

Fullscreen fixed cockpit, no document scroll (`html,body { overflow:hidden }`). CSS Grid:

```
┌────────────────────────────────────────────────────────────────┐
│ STATUS BAR (2.5vh): JB://PORTFOLIO · v2.0 │ THEME SND FX │ CLOCK│
├──────────────┬─────────────────────────────────┬───────────────┤
│ LEFT 17%     │ CENTER 66%                      │ RIGHT 17%     │
│ PANEL//SYSTEM│  TERMINAL // MAIN SHELL         │ PANEL//NETWORK│
│  ┌─ CLOCK    │  ┌ trapezoid tabs ──────────┐   │  ┌─ GLOBE     │
│  ├─ OPERATOR │  │ [ABOUT][PROJECTS][CONTACT]│   │  ├─ CONTACT   │
│  ├─ SKILLS   │  │ [SHELL]                   │   │  ├─ STATUS    │
│  ├─ PROC     │  │  terminal viewport        │   │  └─ ACTIVITY  │
│  └─ MEM      │  └───────────────────────────┘   │               │
├──────────────┴─────────────────────────────────┴───────────────┤
│ FILES // PROJECT_ARCHIVE (bottom strip ~22vh): project "files" │
└────────────────────────────────────────────────────────────────┘
```

- Grid: `grid-template-columns: 17% 1fr 17%`, rows `auto 1fr auto`, `0.75vh` gaps, `1vh` outer padding.
- Left/right columns: vertical flex of panel modules, `justify-content: space-between`.
- Center: terminal panel fills row 2 col 2.
- Bottom strip spans all columns.
- 1024–1279px: side columns narrow to 20ch minimum; bottom strip shrinks to `18vh`.

## 6. Component inventory

Each component = one file in `components/`, self-contained, props-typed, content injected from `lib/content.ts` (never hardcoded in components). "Draw-in" = the dex-ui entrance behavior defined in §9.3.

### Chrome
| Component | Purpose | Content source | Motion |
|---|---|---|---|
| `BootSequence` | Full-viewport overlay playing §7 timeline; unmounts when done | `lib/bootLog.ts` (85-line original fake log riffing on the real portfolio: "Mounting /dev/projects… OK") | §7 |
| `StatusBar` | Top strip: brand, theme cycler, sound toggle, fx toggle, live clock | static + `useClock` | Fades in with cockpit |
| `Panel` | Shared chamfered frame + title bar; carries the stagger entrance (`--i` index) | props | Expand-in (§9.3) |
| `PanelTitle` | Two-part `h3` title | props | Types on |
| `Modal` | augmented-ui framed dialog over dimmed backdrop, Esc/backdrop close, focus-trapped | props | Scale 0.96→1 + flicker-in 180ms |

### Left column — PANEL // SYSTEM
| Component | Maps from (eDEX) | Shows (preserved content) | Motion |
|---|---|---|---|
| `ClockPanel` | `mod_clock` | Local time `HH MM SS` big Rajdhani digits, date line | Colon separators blink 1s; digits flip with 120ms flicker on change |
| `OperatorPanel` | `mod_sysinfo`/`hardwareInspector` | NAME Jamal Bhola · ROLE Software Engineer & Web Developer · EDU B.S. Computer Engineering — SDSU · LOC Los Angeles, CA · STATUS ONLINE (pulsing dot) | Rows type on staggered 60ms |
| `SkillsPanel` | `mod_cpuinfo` graphs | 4 groups (Frontend/Backend/Database/Tools) from §12; each skill = label + segmented meter (10 segments, 70–95% lit, deterministic per skill name hash) | Segments fill left→right 400ms staggered; idle: random segment shimmers every ~4s |
| `ProcessPanel` | `mod_toplist` | Decorative process table: PID/NAME/CPU rows derived from project slugs (`dnd_app.rs`, `voice_bot.py`…) | CPU% values drift ±2% every 2s; rows type on |
| `MemoryPanel` | `mod_ramwatcher` | 8×24 dot matrix; lit ratio wanders 55–80%; label `HEAP://SKILL_CACHE` | Dots toggle in 200ms waves, canvas |

### Right column — PANEL // NETWORK
| Component | Maps from | Shows | Motion |
|---|---|---|---|
| `GlobePanel` | `mod_globe` (ENCOM) | **Hand-rolled canvas** orthographic dotted-sphere Earth, rotating 0.15 rad/s, LA marker pulsing, 2–3 great-circle arcs firing every ~5s to random cities. Landmass data: `lib/geo.ts` exports `WORLD_POINTS: [lat, lng][]` (~1200 entries) — generated **once** by sampling any public-domain equirectangular landmass dataset/image (Natural Earth is PD) and committed as a literal array; also `CITIES` (~10 majors incl. Los Angeles) for arc endpoints. Never copy eDEX's grid.json (GPL) | rAF; draw-in = points fade in radially 600ms |
| `ContactPanel` | `mod_conninfo` | UPLINKS: EMAIL / GITHUB / LINKEDIN / TWITTER / RESUME.PDF — each `▸ LABEL … ESTABLISHED` as real `<a>` (§12 URLs) | Rows type on; hover = flicker + arrow shift |
| `NetStatusPanel` | `mod_netstat` | LOCATION Los Angeles, CA · UPTIME (live since mount) · LATENCY 12ms (drifts) · MODE OPEN_TO_WORK | Types on |
| `ActivityPanel` | dex-ui `spikeGraph`/`noiseVisualization` | Decorative scrolling spike graph (canvas, value-noise driven), label `NET://TRAFFIC` | Continuous 30fps scroll; pauses when tab hidden |

### Center — TERMINAL // MAIN SHELL
| Component | Purpose |
|---|---|
| `TerminalPanel` | Frame + trapezoid `TabBar` (§6.1) + viewport routing to active tab |
| `TabBar` | `skewX(35deg)` tabs: ABOUT, PROJECTS, CONTACT, SHELL. Active = filled accent, text `bg-panel`, `scale(1.1)`. Syncs to `location.hash` (`#about` `#projects` `#contact` `#shell`). **Default active tab: ABOUT** (auto-plays its typed `cat about.md` on first activation); a hash present at load wins |
| `AboutTab` | Runs fake `cat about.md`: types §12 hero + about + education content as markdown-ish output with accent `<em>`s |
| `ProjectsTab` | Runs `ls -la ./projects`: table of 5 projects (NAME/STATUS/DATE); rows clickable → `ProjectModal`; footer hint `open <n> · resume.pdf` |
| `ContactTab` | Runs `./contact --list`: email, socials, location as link rows + `PING jamal.bhola… 32 bytes … time=0.4ms` flavor |
| `ShellTab` | The real fake shell: prompt `visitor@jamal-bhola:~$`, blinking block cursor, char-by-char input, history (↑↓), and commands: `help ls cat about projects open <n> contact resume theme <name> sound fx matrix whoami neofetch clear sudo exit` (`sudo` → `denied.` + red flash + error blip; `matrix` → 4s rain easter egg; `neofetch` → ASCII JB logo + site "specs"; `exit` → `nice try.`) |
| `ProjectModal` | Full project detail (all §12 fields: long description, role, date, features, challenges, results, tech chips, GitHub link when present). Tech chips = mini chamfered tags |

### Bottom — FILES // PROJECT_ARCHIVE
| Component | Maps from | Behavior |
|---|---|---|
| `ProjectBrowser` | eDEX `filesystem` | Horizontal row of chamfered "file" tiles: 5 projects (`.proj`, status LED green=Completed / amber=In Progress) + `about.md` + `contact.sh` + `resume.pdf`. Click: project→`ProjectModal`, about/contact→switch tab, resume→open PDF new tab. Tiles show name + tech-count + date. Hover: lift 2px + glow; tiles stagger-in 60ms L→R |

## 7. Boot sequence (first-load choreography)

Timing distilled from eDEX `_renderer.js` + `boot_screen.css`. Overlay `z-index` above all; cockpit mounts beneath at T4 so SSR content exists in DOM from the start (§11).

| Phase | What happens | Duration |
|---|---|---|
| T0 skip check | `sessionStorage("booted")` or `prefers-reduced-motion` → jump to T4 with simple 300ms fade; else play. `SKIP ▸` button (and any key) always visible, jumps to T4 | — |
| T1 boot log | Fake log types line-by-line, bottom-left, `1.4vh` Fira Code. Cadence: lines 1–2 500ms; 3–24 30ms; pause 400ms at 25; 26–42 25ms; pause 300ms; then accelerate `pow(1-(i/1000),3)*25`ms; final 2 lines 300ms. Each line = stdout blip (§9.4); auto-scroll pinned to bottom | ~4.5s |
| T2 title card | Screen blanks 400ms → `JAMAL BHOLA` (Rajdhani `10vh`, underline 5px accent) fades in 300ms → 100ms filled-block flash → border-only → **glitch 500ms**: text splits into top/bottom `clip-path` halves jittering ±1–5% horizontally at 50ms alternate-reverse (the derezzer) → stable 700ms → fade | ~2.2s |
| T3 cockpit build | Overlay lifts. Terminal panel expands from `height:0` center-out, 500ms `cubic-bezier(0.85,0.5,0.85,0.5)` + expand whoosh. Greeting `Welcome, visitor` fades in center 1s, fades out. Columns activate; **panels stagger left/right pairwise every 120ms**, each doing its §6 draw-in + panel blip. Bottom tiles stagger 60ms. StatusBar last | ~2.5s |
| T4 idle | Cockpit interactive. `sessionStorage("booted")=1`. ShellTab greets: `Welcome to JB-OS v2.0 — type "help"` | — |

Total ~9s full, ~1.5s revisit. During T1–T2 a `BOOTING… <pct>` readout sits bottom-right.

## 8. Responsive strategy

| Breakpoint | Layout |
|---|---|
| ≥1024px | Full cockpit (§5) |
| 768–1023px | Two columns: center terminal + right column merged under left (side panels compress to 2-col grid of mini-panels below terminal); document scroll **enabled**; bottom strip becomes horizontal-scroll row |
| <768px | Single column, document scroll: StatusBar (sticky) → Terminal (60vh, tabs intact) → ProjectBrowser (horizontal scroll) → panels stacked in accordion (`<details>` styled as panels, Clock+Operator open by default). Boot shortens to T2-only (~1.5s). Hover effects become active-states |

Mobile keeps every content byte — nothing hidden permanently. Touch targets ≥44px. The cockpit never letterboxes: between 768–1023 it degrades gracefully rather than shrinking text below floors (§4.2).

## 9. Animation system

### 9.1 Easing tokens (CSS vars)
- `--ease-panel: cubic-bezier(0.85, 0.5, 0.85, 0.5)` (eDEX panel expand)
- `--ease-fade: cubic-bezier(0.4, 0, 1, 1)` (eDEX fades)
- `--ease-overshoot` — the dex-ui quintic `f(t) = 14.0525t⁵ − 21.5575t⁴ − 0.69t³ + 9.195t²` (overshoots ≈1.04 then settles to 1). `lib/easing.ts` exports the JS function plus `QUINTIC_LINEAR`, a CSS `linear(…)` string built by sampling f(t) at 33 evenly spaced t values — computed once and pasted as a literal into `globals.css` (not runtime-generated). The value shown here is intentionally not written out; generating it is part of the easing task
- Durations: fast 150ms, standard 400ms, panel 500ms, dramatic 700ms

### 9.2 Primitives (`lib/animation/` + hooks)
- `useTypewriter(text, cps=40)` — char-reveal with 4-char burst jitter; returns text + done; skippable (render-all on click)
- `TickLine` — hairline that grows from center with end ticks, 400ms `--ease-overshoot` (dex-ui `AnimatedTickLine`)
- `flicker-in` — CSS keyframes: opacity `0→1→0.3→1→0.6→1` steps over 180ms (dex-ui `flicker()`), used on modals, hovers, panel titles
- Panel entrance orchestration — implemented as a **CSS-variable stagger system** (no JS hook): panels carry `class="stagger" style="--i: n"`; global CSS plays `panel-in` (clip-path inset reveal + fade) with `animation-delay: calc(var(--i) * 120ms)`, gated on `html:not([data-booting])`; panel titles use a matching `stagger-title` flicker. This replaces the earlier `useDrawIn(ref)` idea — same visual result, zero orchestration code, works for both boot and revisit entrances
- Central `useTicker` rAF hub: all canvases subscribe; pauses on `visibilitychange`; canvases also stop when `IntersectionObserver` reports offscreen (mobile scroll)

### 9.3 Panel entrance = the signature move
Every panel enters with: border draws (clip-path inset 50%→0 vertical then horizontal, 250ms) → title types (150ms) → hairline + ticks grow (200ms, overlapped) → content draw-in per component table. Stagger controlled by parent (120ms between panels).

### 9.4 Idle motion budget
Always-on: clock, globe rotation, activity graph, cursor blink, scanline sweep, LED pulses. Everything else animates only on entrance/interaction. CPU target: <5% on a mid laptop; verify via DevTools performance profile.

### 9.5 Reduced motion
`prefers-reduced-motion: reduce` → boot skipped (fade-in), typewriters render instantly, canvases render static first frame (globe still, graph frozen), scanlines/flicker off, transitions ≤150ms opacity only. Implemented centrally: `useReducedMotion()` gates the ticker + a `[data-motion="reduced"]` root attribute gates CSS.

## 10. Sound design (WebAudio, zero assets)

eDEX WAVs are GPL — **synthesize instead**, in `lib/audio.ts` (single `AudioContext`, master gain 0.25):
- `stdout` tick: 2ms square blip ~2200Hz, vol 0.08 (boot log lines, terminal output)
- `key`: 1ms noise burst ~1800Hz (terminal keystrokes)
- `granted`: two rising sines 880→1320Hz, 90ms (boot complete, command ok)
- `denied`: 140Hz sawtooth 120ms (errors, `sudo`)
- `expand`: filtered noise sweep 200→3000Hz, 350ms (panel expand)
- `panel`: 60ms triangle chirp 660Hz (each panel stagger-in)
- `theme`: 3-note arp (theme switch)

Muted by default until first user gesture (browser policy) — boot plays silent unless a prior visit set `localStorage("sound")="on"`. StatusBar toggle `SND ◉/○` + `sound` command. All calls behind `sfx.play(name)` no-op guard (SSR-safe, context-failure-safe).

## 11. Rendering, SEO, accessibility

- **SSR content:** the cockpit (all panels, all tabs' text, project data) renders server-side into the initial HTML — crawlers and no-JS users get full text. BootSequence overlay is client-mounted after hydration *only when it will play* (no flash: a `<script>` inline in `<head>` sets `data-booting` on `<html>` from sessionStorage before paint; CSS hides cockpit until lifted).
- **Metadata:** keep existing title/description; add OpenGraph + JSON-LD `Person` (name, SDSU alumniOf, sameAs GitHub/LinkedIn/Twitter, email) in `app/layout.tsx`.
- **Routes preserved:** `/` = cockpit. `/projects` = tiny server component that `redirect("/#projects")` (inbound links keep working). Resume stays at `/Jamal_Bhola_resume.pdf`.
- **A11y:** all text is real DOM text (canvases `aria-hidden` + visually-hidden text equivalents, e.g. globe → `<span class="sr-only">Located in Los Angeles, CA</span>`); tabs = WAI-ARIA `role="tablist"` with arrow-key nav; modal focus-trap + `aria-modal`; ProjectBrowser tiles = `<button>`s; contrast: all five themes' text-on-bg ≥ 4.5:1 (tron #aacfd1 on #05080d ≈ 12:1 ✓; verify others, adjust `interstellar` text weight if needed); skip-link "Skip boot / skip to content"; `Esc` closes modal; terminal input has `aria-live="polite"` output region.
- **Fonts:** `next/font` (self-hosted, `display: swap`), no CLS.

## 12. Content preservation map (single source of truth: `lib/content.ts`)

All strings below migrate **verbatim** from the current pages into typed data. Components render only from this module.

| Current location | Content | New home |
|---|---|---|
| `layout.tsx` metadata | title "Jamal Bhola - Software Engineer", description "Computer Engineering graduate from SDSU…" | unchanged in `layout.tsx` |
| Hero | JAMAL BHOLA · "Software Engineer & Web Developer" (typewriter) · SDSU grad line · specialization line | `content.identity` → OperatorPanel, AboutTab greeting |
| About: Education card | B.S. Computer Engineering, SDSU; Specialization; Focus Areas | `content.about.education` → AboutTab |
| About: Skills card | Frontend: React, Next.js, TypeScript, Tailwind CSS / Backend: Node.js, Python, Express.js, Django / Database: MongoDB, PostgreSQL, MySQL / Tools: Git, Docker, AWS, Linux | `content.skills` → SkillsPanel + AboutTab |
| `projects/page.tsx` **detailed** array (superset of home's) | 5 projects × {title, description, longDescription, tech[], status, date, role, features[], challenges, results} + SDSU Thrift GitHub URL | `content.projects` → ProjectsTab, ProjectModal, ProjectBrowser, ProcessPanel names |
| Contact | jamal.bhola@gmail.com · Los Angeles, CA · github.com/jamalbhola · linkedin.com/in/jamalbhola · twitter.com/jambho · CTA sentence | `content.contact` → ContactPanel, ContactTab |
| Resume | `/Jamal_Bhola_resume.pdf` | `content.resumeUrl` → browser tile, `resume` command, ContactPanel |
| Footer | © 2024 Jamal Bhola … Built with Next.js & Tailwind CSS | StatusBar right segment (year → dynamic) |

⚠️ Flag for the user (do not "fix" silently): GitHub link says `github.com/jamalbhola` but the repo remote is `github.com/jambho`. Preserved as-is; noted in plan's final report.

The old `terminal-glow`/retro-grid CSS, Orbitron font, and green/orange palette are **replaced entirely** (they are presentation, not content). The old home-page 5-project summary array is dropped in favor of the detailed superset.

## 13. Architecture & conventions

```
app/            layout.tsx (fonts, meta, JSON-LD, theme boot script)
                page.tsx (server: composes cockpit from components)
                projects/page.tsx (redirect → /#projects)
                globals.css (tokens, themes, grid bg, scanlines, keyframes, aug defaults)
components/     one file per §6 component (client components only where interactive)
lib/            content.ts (§12) · themes.ts · easing.ts · audio.ts · bootLog.ts ·
                geo.ts (globe points/cities) · terminal/commands.ts (command registry)
hooks/          useTicker.ts · useTypewriter.ts · useClock.ts ·
                useReducedMotion.ts · useLocalStorage.ts
```

- Server components by default; `"use client"` only where state/effects live (terminal, canvases, clock, boot).
- Canvas widgets: each an isolated client component wrapped in an `ErrorBoundary` (a dead globe must never kill the page) rendering its sr-only text fallback.
- No new runtime deps except `augmented-ui` (CSS-only). Anything else needs justification in PR notes.
- Command registry: `Record<string, { run(args, ctx): Line[] | Action }>` — adding a command = one entry; ctx exposes `setTab`, `openProject`, `setTheme`, content.
- Hydration safety: clock/uptime render `--:--:--` server-side, real values post-mount (`suppressHydrationWarning` on time nodes); all `localStorage` behind guards.

## 14. Error handling & performance budgets

- Error boundaries per canvas widget + per column; fallback = static panel with `MODULE OFFLINE` flavor text (on-brand failure).
- Audio: every call guarded; context creation lazy on first gesture; failure = permanent silent no-op.
- `localStorage`/`sessionStorage` in try/catch (Safari private mode).
- Budgets: added JS ≤ 120KB gzip (no three.js/xterm — hand-rolled canvas); Lighthouse desktop ≥ 90 perf / ≥ 95 a11y; idle CPU < 5%; 60fps entrance animations (transform/opacity/clip-path only — no layout-property animation).
- `npm run build` green at every task boundary; zero TS errors, zero console errors in browser.

## 15. Explicitly cut (stretch goals, do not build in v1)

1. On-screen animated QWERTY keyboard (eDEX bottom third) — cost/benefit fails on web.
2. Konami-code hidden theme (`disrupted` glitch theme).
3. Live GitHub activity feed in ActivityPanel (needs API, rate limits).
4. WebGL post-processing (bloom/curvature shader à la dex-ui) — CSS scanlines suffice for v1.

## 16. Verification strategy

Per-task checks live in the implementation plan. Global acceptance:
1. `npm run build` passes; `npx tsc --noEmit` clean.
2. Boot plays full on first visit, skips on revisit, skippable by key/click, absent under reduced motion.
3. Every §12 string reachable: about text, all 5 projects incl. modal fields, all contact links, resume link.
4. All 5 themes switch live and persist; contrast spot-checks pass.
5. 375px, 768px, 1440px layouts match §8; no horizontal overflow; no clipped text.
6. Keyboard-only walkthrough: tabs, browser tiles, modal open/close, terminal usable.
7. Lighthouse: perf ≥ 90 / a11y ≥ 95 (desktop preset) on production build.
