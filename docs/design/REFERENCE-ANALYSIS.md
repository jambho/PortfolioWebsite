# Reference Analysis: eDEX-UI & dex-ui

Extracted facts from the two reference repos, recorded so implementing agents never need to
clone them. Analyzed at their default branches, 2026-07-09.

- [GitSquared/edex-ui](https://github.com/GitSquared/edex-ui) — Electron sci-fi terminal. **License: GPL-3.0 — do NOT copy code, fonts, sounds, or `assets/vendor/*` (encom-globe, grid.json) into this repo. Re-implement everything.** The numbers/timings below are extracted facts and safe to use.
- [seenaburns/dex-ui](https://github.com/seenaburns/dex-ui) — openFrameworks C++ art piece (the original; eDEX imitates it). License: BSD 3-clause. C++ source; concepts re-implemented anyway.

---

## 1. eDEX-UI

### 1.1 Theme system (from `src/assets/themes/*.json`)

Themes are JSON → injected as CSS custom properties. The accent color is stored as **separate
r/g/b channels** so all alpha variants derive from one value:

```css
color: rgb(var(--color_r), var(--color_g), var(--color_b));
border: 0.18vh solid rgba(var(--color_r), var(--color_g), var(--color_b), 0.5);
```

Palettes (colors.{r,g,b} / black / light_black / grey):

| Theme | accent | black | light_black | grey |
|---|---|---|---|---|
| tron (default) | 170, 207, 209 | #000000 | #05080d | #262828 |
| matrix | 0, 143, 17 | #0d0208 | #090b0a | #262827 |
| blade | 204, 94, 55 | #000000 | #090b0a | #262827 |
| apollo | 235, 235, 235 | #000000 | #191919 | #262827 |
| interstellar (light!) | 3, 169, 244 | #f3f3f3 | #dedede | #bfbfbf |

Terminal (xterm) colors mirror the accent: fg = accent hex, bg = light_black, cursor = accent,
selection = accent @ 0.3. Fonts per theme: `font_main: "United Sans Medium"`,
`font_main_light: "United Sans Light"`, terminal `Fira Mono`.

### 1.2 Global chrome (from `assets/css/main.css`)

- Body bg = **grid**: `linear-gradient(90deg, var(--color_light_black) 1.85vh, transparent 1%) center, linear-gradient(var(--color_light_black) 1.85vh, transparent 1%) center, var(--color_grey)` with `background-size: 2.04vh 2.04vh` — i.e. light_black cells with grey hairline gaps. Boot uses `body.solidBackground` (plain light_black).
- **Everything is sized in vh** (0.092vh hairlines, 0.18vh borders, 1.02vh title text…). The UI scales like an image with window height.
- Scrollbars: 8px; track accent @ 0.4 with 3px light_black border; thumb solid accent.
- Panel title bars: `h3.title` containing two `<p>` (left/right, each ~49.4% width, right-aligned second) — reads like `PANEL … SYSTEM`. 1.02vh font, bottom border 0.092vh accent @ 0.3, plus `::before/::after` vertical end-ticks (0.46vh tall hairlines poking below the border ends).

### 1.3 Layout (from `_renderer.js` initUI + module CSS)

```
left column 17% | main shell 65% × 60.3%h | right column 17%
                  bottom: filesystem + on-screen keyboard
```

- Columns: `position:absolute`, `top:2.5vh`, padding 1.39vh, flex column `justify-content:space-between`; left at `left:-0.555vh`, right mirrored.
- Main shell: `augmented-ui="bl-clip tr-clip exe"` (chamfered bottom-left & top-right), `--aug-border: 0.18vh`, accent @ 0.5; `transition: width .5s cubic-bezier(0.85,0.5,0.85,0.5), height .5s <same>`.
- Terminal tabs: `ul` of `li` with `transform: skewX(35deg)` (inner `<p>` counter-skewed −35deg); active tab = solid accent bg, light_black text, `skewX(35deg) scale(1.2)`, bold.
- Left column modules (top→bottom): clock, sysinfo, hardwareInspector, cpuinfo, ramwatcher, toplist. Right: netstat, globe (ENCOM three.js), conninfo.
- Clock: 4vh digits, United Sans Light, hairline top border with end ticks.

### 1.4 Boot sequence (from `_renderer.js` lines ~209–510 + `boot_screen.css`)

Phase 1 — boot log (`displayLine()`, 85-line `boot_log.txt`, fake kernel messages ending
"Boot Complete" then "Welcome"):
- Text: monospace 1.4vh, screen-anchored bottom-left, appended line by line (auto-scroll).
- Per-line sounds: `stdout.wav` tick each line; `granted.wav` on "Boot Complete".
- Cadence (i = line index): i=2 appends a version/date line; i≤4 → 500ms delay; 4<i<25 → 30ms;
  i=25 → 400ms; i=42 → 300ms; 42<i<82 → 25ms; last two lines → 300ms; otherwise
  `Math.pow(1 - (i/1000), 3) * 25` ms (slight accelerando).

Phase 2 — title screen (`displayTitleScreen()`):
- +0ms: clear screen, play `theme.wav`; +400ms: body → grid bg, boot screen centers, `<h1>` title
  fades in (300ms linear `fadeInTitle`), 10vh United Sans, 0.46vh accent underline;
- +200ms: body → solid bg; +100ms: title gets **solid accent background** (filled block);
- +300ms: background removed, full 5px accent border; +100ms: border removed, `.glitch` class on;
- glitch = "derezzer": `::before/::after` clones clipped to top 40% / bottom 60% via `clip-path`,
  translated ±2% horizontally, jittering between ±1% and ±5% at 50ms linear alternate-reverse
  infinite; runs ~500ms;
- then stable bordered title for 1000ms → boot screen removed.

Phase 3 — UI build (`initUI()`):
- Main shell injected at `height:0; width:0; opacity:0; margin-bottom:30vh` with title hidden;
  +10ms `expand.wav` plays, width animates in (0.5s bezier above); +500ms height animates, title
  bar fades (opacity .5s cubic-bezier(0.4,0,1,1)); +700ms shell blinks off (opacity 0),
  filesystem + keyboard injected; +10ms shell back on; +270ms greeting
  `Welcome back, <em>{user}</em>` (3.9vh) fades in, keyboard rows animate
  (`animation_state_1` → `_2` at +100ms) with `keyboard.wav`; +1000ms greeting fades;
  +400ms greeting removed, side modules constructed;
- columns get `.activated` (opacity 0→1, .5s cubic-bezier(0.4,0,1,1));
- each module `<div>` has `animation: fadeIn .5s cubic-bezier(0.4,0,1,1) paused forwards`;
  a 500ms `setInterval` flips left[i] & right[i] to `animation-play-state: running` pairwise,
  playing `panels.wav` per step — the signature stagger;
- terminal tabs+viewport injected, greeting written to term; filesystem fades in at +200ms.

### 1.5 Sounds (from `classes/audiofx.class.js`; howler.js)

stdout (0.4 vol, per boot line/output), stdin, keyboard (typing), folder (tab switch), granted,
denied, error, alarm, info, expand (panel grow), panels (module stagger), scan, theme (boot title).
All ~0.1–0.6s WAVs. **GPL — synthesize replacements with WebAudio.**

### 1.6 Misc signatures

- Modals: augmented-ui framed, same border language.
- `mod_ramwatcher`: grid of small dots (used/free) — dot-matrix panel.
- `mod_toplist`: 5-row process table (PID/NAME/CPU).
- `mod_cpuinfo`: per-core smoothie-charts line graphs + CPU stats readouts.
- `mod_globe`: three.js ENCOM globe, pin at geolocated IP, satellites orbiting.
- Filesystem: grid of icon tiles (folders/files) with name labels, click to navigate; list-view
  toggle; "tracking" indicator tied to terminal CWD.
- fuzzyFinder: command-palette overlay.

## 2. dex-ui

openFrameworks C++, fullscreen art piece under a real urxvt terminal (X11 layering trick).
Fonts: United Sans Medium (UI), Fira Mono (terminal). Layout: header bar, left panel
(box + wave visualizations), right panel (radar, spike graph), center terminal outline,
bottom hex-key on-screen keyboard.

### 2.1 Animation model (`animated.h/cpp`) — the important part

- Everything extends `Animated`: a component owns `vector<animation_event_t>` =
  `{delay, duration, id, nextID}`; time counts within current event; `nextID == id` ⇒ loop;
  `duration == -1` ⇒ infinite. Components chain intro → main loop states
  (e.g. boxVisualization: `newEvent(0, 300, INTRO, MAIN); newEvent(0, -1, MAIN, MAIN)`).
- **Primitives:** `AnimatedTickLine` — a horizontal line that grows open with tick marks
  (+ extra ticks at arbitrary offsets); `AnimatedText` — types on at `rate` chars/frame,
  optionally `fromRight`.
- Every UI element **draws itself in**: lines grow, text types, panels flicker on. Nothing
  simply appears.

### 2.2 Easing (`easing-utils.cpp`)

- `easeLinear/In/Out/InOut` + signature **`easeQuinticInOutBack`**:
  `f(t) = 14.0525t⁵ − 21.5575t⁴ − 0.689999999999991t³ + 9.195t²` for t∈[0,1] —
  overshoots ~1.04 around t≈0.8, settles at 1. Used for panel/line growth (mechanical snap).
- **`flicker(time, until, rate)`**: returns 1 if `time < 0` or `time > until`, else
  `(int)time % (int)rate == 0 ? 1 : 0` — i.e. element blinks on/off at `rate` until `until`,
  then stays on. The Ex-Machina "fluorescent tube warming up" entrance.

### 2.3 Shaders (`bin/data/shadersGL3/`)

noise.frag (per-pixel noise field), radialFade.frag, wave.frag/vert (waveform),
spike.frag, lines.geom (thick line rendering). Post look: subtle noise + radial fade
(vignette). CSS equivalents: film-grain/scanline overlay + vignette.

### 2.4 Components

radar (rotating sweep + blips), boxVisualization (wireframe cube, 300ms intro),
spikeGraph (scrolling spikes), noiseVisualization, header (title + tick lines),
keyboard (hex keys highlight on real keypresses via /dev/input), terminal outline drawn
by the UI with the real terminal window constrained inside.

## 3. Translation decisions for this project (why the site won't be 1:1)

| Reference feature | Web translation | Reason |
|---|---|---|
| xterm.js real PTY | Hand-rolled fake terminal, command registry | No backend; full control of typed output |
| three.js ENCOM globe | Canvas 2D orthographic dotted globe | ~150KB dep avoided; GPL vendor file; dex-ui minimalism |
| smoothie-charts CPU graphs | Canvas spike/scroll graph (dex-ui style) | dep-free, decorative |
| GPL WAV sounds | WebAudio-synthesized blips | license + autoplay policy + 0 bytes |
| United Sans (commercial) | Rajdhani (Google, OFL) | free lookalike, condensed techno |
| Fira Mono | Fira Code (Google, OFL) | same family, ligatures optional |
| vh-only sizing | vh with px floors via `max()` | small-window legibility |
| Electron fullscreen | `100dvh` fixed cockpit ≥1024px; scroll layouts below | web reality |
| Real sysinfo (CPU/RAM/procs) | Portfolio-flavored fakes (skills, projects, uptime) | it's a portfolio — decoration carries meaning |
