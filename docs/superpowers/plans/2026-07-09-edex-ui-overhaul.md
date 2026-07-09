# eDEX-UI Portfolio Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio's presentation layer as a fullscreen eDEX-UI/dex-ui-style sci-fi cockpit (boot sequence, panel columns, fake terminal, canvas instruments) while preserving all existing content verbatim.

**Architecture:** Next.js App Router stays. All content moves to `lib/content.ts` (single source of truth, guarded by tests). A CSS token layer (split-RGB theme vars, vh sizing, augmented-ui chamfers) drives five switchable themes. Panels are server-rendered for SEO; interactivity (terminal, canvases, boot) lives in focused client components. A CSS-variable stagger system choreographs entrances; a central rAF ticker drives canvases.

**Tech Stack:** Next.js 15.5, React 19.1, TypeScript 5, Tailwind CSS 4, augmented-ui 2 (only new runtime dep), Vitest + Testing Library (new dev deps), next/font (Rajdhani + Fira Code).

**Read first:**
- `docs/superpowers/specs/2026-07-09-edex-ui-overhaul-design.md` (the spec — §-references below point here)
- `docs/design/REFERENCE-ANALYSIS.md` (extracted eDEX/dex-ui facts: exact colors, timings, choreography)

## Global Constraints

- **Content is frozen.** Every user-visible string comes from `lib/content.ts`, migrated verbatim from the old pages (spec §12). Never rewrite bio/project/contact copy. The content test suite is the gate.
- **License wall:** never copy code, fonts, sounds, or data files from eDEX-UI (GPL-3.0). Re-implement from the analysis doc only.
- **Only new runtime dependency:** `augmented-ui@^2`. No three.js, no xterm.js, no howler, no animation libraries.
- **Modern rgb syntax everywhere:** `rgb(var(--color-r) var(--color-g) var(--color-b) / 0.5)` — never comma syntax.
- **Animate only** `transform`, `opacity`, `clip-path`, `background-position`. Never layout properties.
- **Hydration safety:** anything time/random/localStorage-dependent renders a stable placeholder server-side (clock: `--:--:--`) and goes live post-mount. All storage access wrapped in try/catch.
- **Reduced motion:** every animation must be disabled or reduced under `prefers-reduced-motion: reduce` / `html[data-motion="reduced"]` (spec §9.5).
- **Canvases** are `aria-hidden`, wrapped in `WidgetBoundary`, subscribe to the shared ticker (pause on hidden tab), and render an sr-only text equivalent.
- **Every task ends with:** `npx tsc --noEmit` clean → `npm run test` green → `npm run build` green → commit. (Steps say "Full check" to mean exactly this sequence.)
- **Commit messages:** conventional commits (`feat:`, `chore:`, `test:`, `fix:`).
- Node ≥ 20. Windows dev machine (PowerShell) — commands below are shell-neutral single commands.
- Fonts only via `next/font/google` (Rajdhani 500/700, Fira Code 400/500). Never a `<link>` to Google Fonts CDN (the old `globals.css` Orbitron @import gets deleted).

**Verification note for agents:** "Preview check" steps assume the Claude Code preview tools (`preview_start` against `npm run dev` on port 3000, then `preview_screenshot` / `preview_inspect` / `preview_console_logs`). If unavailable, run `npm run dev` and verify with the listed observations manually. Never mark a preview step done without having looked.

---

## Phase 0 — Foundation

### Task 1: Tooling — test runner, augmented-ui, scripts

**Files:**
- Modify: `package.json` (scripts + deps via npm commands)
- Create: `vitest.config.ts`
- Create: `tests/setup.smoke.test.ts`

**Interfaces:**
- Produces: `npm run test` (vitest run), `npm run test:watch`. All later tasks rely on these.

- [ ] **Step 1: Install dependencies**

```bash
npm install
npm install augmented-ui@^2
npm install -D vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/dom
```

Expected: lockfile updates, no peer-dep errors (React 19 + @testing-library/react@16 are compatible).

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block add (keep existing entries):

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname) }, // mirror tsconfig "@/*" so component tests resolve
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 4: Write the smoke test — `tests/setup.smoke.test.ts`**

```ts
import { describe, it, expect } from "vitest";

describe("test tooling", () => {
  it("runs TypeScript tests in jsdom", () => {
    const el = document.createElement("div");
    el.textContent = "ok";
    expect(el.textContent).toBe("ok");
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm run test`
Expected: 1 passed.

- [ ] **Step 6: Verify the untouched app still builds**

Run: `npm run build`
Expected: build succeeds (baseline before we start changing things).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.smoke.test.ts
git commit -m "chore: add vitest tooling and augmented-ui dependency"
```

---

### Task 2: `lib/content.ts` — verbatim content extraction (the preservation gate)

**Files:**
- Create: `lib/content.ts`
- Test: `tests/content.test.ts`

**Interfaces:**
- Produces (exact, consumed by nearly every later task):

```ts
export type Project = {
  id: number; slug: string; file: string;           // slug/file are NEW ui-chrome fields
  title: string; description: string; longDescription: string;
  tech: string[]; status: "In Progress" | "Completed";
  date: string; role: string; features: string[];
  challenges: string; results: string; github?: string;
};
export type SkillGroup = { label: string; skills: string[] };
export const content: {
  identity: { name: string; first: string; last: string; tagline: string;
    school: string; schoolLine: string; specialization: string; location: string };
  about: { education: { degree: string; school: string }[];
    specialization: string; focusAreas: string };
  skills: SkillGroup[];
  projects: Project[];
  contact: { email: string; cta: string; location: string;
    links: { label: string; href: string }[] };
  resumeUrl: string;
  footer: string;
};
```

- [ ] **Step 1: Write the failing test — `tests/content.test.ts`**

This test pins every preserved string from the old site (old `app/page.tsx` + `app/projects/page.tsx`). It is the contract that the overhaul lost nothing.

```ts
import { describe, it, expect } from "vitest";
import { content } from "../lib/content";

describe("content preservation (spec §12)", () => {
  it("keeps identity strings", () => {
    expect(content.identity.name).toBe("Jamal Bhola");
    expect(content.identity.tagline).toBe("Software Engineer & Web Developer");
    expect(content.identity.school).toBe("San Diego State University");
    expect(content.identity.specialization).toBe(
      "Specializing in software development, web technologies, and system architecture"
    );
    expect(content.identity.location).toBe("Los Angeles, CA");
  });

  it("keeps all four skill groups verbatim", () => {
    expect(content.skills).toEqual([
      { label: "Frontend", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
      { label: "Backend", skills: ["Node.js", "Python", "Express.js", "Django"] },
      { label: "Database", skills: ["MongoDB", "PostgreSQL", "MySQL"] },
      { label: "Tools", skills: ["Git", "Docker", "AWS", "Linux"] },
    ]);
  });

  it("keeps the five detailed projects with every field", () => {
    expect(content.projects).toHaveLength(5);
    const titles = content.projects.map(p => p.title);
    expect(titles).toEqual([
      "Discord AI Voice Cloning Bot",
      "Dungeons and Dragons Desktop App",
      "SDSU Thrift Website",
      "Music Box Cyberphysical System",
      "Portfolio Website",
    ]);
    for (const p of content.projects) {
      expect(p.description.length).toBeGreaterThan(20);
      expect(p.longDescription.length).toBeGreaterThan(80);
      expect(p.tech.length).toBeGreaterThanOrEqual(4);
      expect(["In Progress", "Completed"]).toContain(p.status);
      expect(p.date).toMatch(/20\d\d/);
      expect(p.role.length).toBeGreaterThan(5);
      expect(p.features.length).toBeGreaterThanOrEqual(4);
      expect(p.challenges.length).toBeGreaterThan(40);
      expect(p.results.length).toBeGreaterThan(40);
      expect(p.slug).toMatch(/^[a-z0-9_]+$/);
    }
    expect(content.projects[2].github).toBe("https://github.com/leanneallen/sdsuthrift");
  });

  it("keeps contact data verbatim", () => {
    expect(content.contact.email).toBe("jamal.bhola@gmail.com");
    expect(content.contact.cta).toBe(
      "Ready to collaborate on your next project? Let's build something amazing together."
    );
    const hrefs = content.contact.links.map(l => l.href);
    expect(hrefs).toContain("https://github.com/jamalbhola");
    expect(hrefs).toContain("https://linkedin.com/in/jamalbhola");
    expect(hrefs).toContain("https://twitter.com/jambho");
    expect(content.resumeUrl).toBe("/Jamal_Bhola_resume.pdf");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test`
Expected: FAIL — cannot resolve `../lib/content`.

- [ ] **Step 3: Create `lib/content.ts`**

Copy the strings **character-for-character from the old files** (`app/page.tsx` hero/about/contact; `app/projects/page.tsx` detailed projects array — it is the superset; ignore the home page's abbreviated project list). Full file:

```ts
export type Project = {
  id: number;
  slug: string;
  file: string;
  title: string;
  description: string;
  longDescription: string;
  tech: string[];
  status: "In Progress" | "Completed";
  date: string;
  role: string;
  features: string[];
  challenges: string;
  results: string;
  github?: string;
};

export type SkillGroup = { label: string; skills: string[] };

export const content = {
  identity: {
    name: "Jamal Bhola",
    first: "JAMAL",
    last: "BHOLA",
    tagline: "Software Engineer & Web Developer",
    school: "San Diego State University",
    schoolLine: "Computer Engineering Graduate from San Diego State University",
    specialization:
      "Specializing in software development, web technologies, and system architecture",
    location: "Los Angeles, CA",
  },
  about: {
    education: [
      {
        degree: "Bachelor of Science in Computer Engineering",
        school: "San Diego State University",
      },
    ],
    specialization: "Software Development, Web Technologies, System Design",
    focusAreas: "Full-stack development, Mobile applications, IoT systems",
  },
  skills: [
    { label: "Frontend", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
    { label: "Backend", skills: ["Node.js", "Python", "Express.js", "Django"] },
    { label: "Database", skills: ["MongoDB", "PostgreSQL", "MySQL"] },
    { label: "Tools", skills: ["Git", "Docker", "AWS", "Linux"] },
  ] satisfies SkillGroup[],
  projects: [
    {
      id: 1,
      slug: "voice_bot",
      file: "voice_bot.py",
      title: "Discord AI Voice Cloning Bot",
      description:
        "A Discord bot capable of streaming, recording, and cloning voices in real-time with AI-powered conversational capabilities.",
      longDescription:
        "Developed an innovative Discord bot that combines real-time voice processing with AI voice cloning technology. The bot can stream, record, and clone voices instantly, providing users with celebrity and video game character voices. Integrated advanced audio processing with AI conversation capabilities using fine-tuned language models.",
      tech: ["Python", "Discord.py", "FFmpeg", "Chatterbox.ai", "Mistral 7B", "LoRA", "Machine Learning"],
      status: "In Progress",
      date: "August 2024 - Present",
      role: "AI/ML Engineer & Full Stack Developer",
      features: [
        "Real-time voice streaming and recording using FFmpeg and discord.ext.recv",
        "Zero-shot voice cloning with 15 preset celebrity and video game character voices",
        "Fine-tuned Mistral 7B model using Low-Rank Adaptation (LoRA)",
        "Synchronized Discord data streams for seamless audio processing",
      ],
      challenges:
        "Resolving synchronization challenges between Discord's data streams and implementing efficient voice cloning with minimal latency for real-time interaction.",
      results:
        "Successfully deployed for testing with a group of 10 users, achieving real-time voice cloning with instant response times.",
    },
    {
      id: 2,
      slug: "dnd_app",
      file: "dnd_app.rs",
      title: "Dungeons and Dragons Desktop App",
      description:
        "A comprehensive desktop application built in Rust and TypeScript for playing Dungeons and Dragons with advanced token management.",
      longDescription:
        "Developed a full-featured desktop application for Dungeons and Dragons gameplay using Tauri framework. The app provides an extensible system for managing campaigns, players, and game entities with high-performance graphics rendering and data management.",
      tech: ["Rust", "TypeScript", "Tauri", "React", "SQLite", "Desktop Development"],
      status: "In Progress",
      date: "January 2024 - Present",
      role: "Full Stack Desktop Developer",
      features: [
        "Tauri backend with SQLite database for campaign and player data storage",
        "React frontend for graphics rendering and user interface",
        "Extensible system supporting 100+ entity tokens across 30+ maps",
        "Sub-50ms latency for real-time gameplay interactions",
      ],
      challenges:
        "Designing an extensible architecture that can handle large numbers of game entities while maintaining low latency for real-time gameplay.",
      results:
        "Achieved sub-50ms latency with support for 100+ tokens across 30+ maps, providing smooth gameplay experience.",
    },
    {
      id: 3,
      slug: "sdsu_thrift",
      file: "sdsu_thrift.tsx",
      title: "SDSU Thrift Website",
      description:
        "An e-commerce platform facilitating sales between SDSU students with scalable architecture and optimized performance.",
      longDescription:
        "Led the development of a student marketplace platform in a team of four. Spearheaded top-level design decisions, framework selection, and backend implementation. The platform connects SDSU students for buying and selling items with a focus on performance and scalability.",
      tech: ["React", "Vite", "Material UI", "Django", "PostgreSQL", "Full Stack Web Development"],
      status: "Completed",
      date: "January 2024 - June 2024",
      role: "Lead Full Stack Developer",
      features: [
        "Responsive e-commerce platform with Material UI design system",
        "Django backend with PostgreSQL database for data management",
        "Vite build system for optimized frontend performance",
        "Scalable architecture supporting 1000+ user accounts",
      ],
      challenges:
        "Optimizing page load times and designing a scalable architecture that could handle growing user base with minimal hardware resources.",
      results:
        "Reduced page load time by 50% and implemented 40% of webpages, creating a scalable system handling 1000+ user accounts efficiently.",
      github: "https://github.com/leanneallen/sdsuthrift",
    },
    {
      id: 4,
      slug: "music_box",
      file: "music_box.cpp",
      title: "Music Box Cyberphysical System",
      description:
        "An intelligent music box that automatically adjusts volume based on ambient noise using embedded systems and feedback control.",
      longDescription:
        "Designed and implemented a cyberphysical system combining hardware and software to create an intelligent music box. The system uses sensors to detect ambient noise and automatically adjusts volume accordingly, demonstrating principles of embedded systems, control theory, and hardware-software integration.",
      tech: ["C++", "Arduino", "Embedded Systems", "PCB Design", "Finite State Machine", "Control Systems"],
      status: "Completed",
      date: "January 2024 - June 2024",
      role: "Embedded Systems Engineer",
      features: [
        "PCB schematics design and breadboard proof of concept",
        "Finite state machine model for volume control feedback loop",
        "Arduino-based embedded system with SD card audio storage",
        "Volume adjustment proportional to ambient noise detection",
      ],
      challenges:
        "Implementing a reliable feedback control system that accurately responds to ambient noise while maintaining smooth audio playback.",
      results:
        "Successfully created a working prototype with automatic volume adjustment based on environmental conditions, documented with comprehensive LaTeX documentation.",
    },
    {
      id: 5,
      slug: "portfolio",
      file: "portfolio.tsx",
      title: "Portfolio Website",
      description:
        "Personal portfolio website showcasing projects and skills with retro terminal aesthetic",
      longDescription:
        "A modern portfolio website built with Next.js and TypeScript, featuring a unique retro terminal aesthetic. The site includes responsive design, interactive animations, and a dedicated projects page. Built to showcase software engineering projects and provide contact information in a visually striking format that reflects both technical skills and design sensibility.",
      tech: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Web Development"],
      status: "Completed",
      date: "December 2024 - Present",
      role: "Full Stack Developer",
      features: [
        "Retro terminal design aesthetic with glowing text effects",
        "Responsive mobile-first layout with Tailwind CSS",
        "Interactive typewriter animations and smooth transitions",
        "Dedicated projects showcase page with modal details",
        "Real-time clock display and live navigation",
        "Accessible design with proper semantic HTML",
      ],
      challenges:
        "Creating a cohesive retro design system while maintaining modern web performance and accessibility standards.",
      results:
        "A fully responsive portfolio website that effectively showcases technical projects and provides an engaging user experience.",
    },
  ] satisfies Project[],
  contact: {
    email: "jamal.bhola@gmail.com",
    cta: "Ready to collaborate on your next project? Let's build something amazing together.",
    location: "Los Angeles, CA",
    links: [
      { label: "GITHUB", href: "https://github.com/jamalbhola" },
      { label: "LINKEDIN", href: "https://linkedin.com/in/jamalbhola" },
      { label: "TWITTER", href: "https://twitter.com/jambho" },
    ],
  },
  resumeUrl: "/Jamal_Bhola_resume.pdf",
  footer: "Built with Next.js & Tailwind CSS",
};
```

- [ ] **Step 4: Run tests**

Run: `npm run test`
Expected: all content tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/content.ts tests/content.test.ts
git commit -m "feat: extract all site content into lib/content with preservation tests"
```

---

### Task 3: `lib/easing.ts` + `lib/themes.ts`

**Files:**
- Create: `lib/easing.ts`, `lib/themes.ts`
- Test: `tests/easing.test.ts`, `tests/themes.test.ts`

**Interfaces:**
- Produces:

```ts
// lib/easing.ts
export function quinticInOutBack(t: number): number;   // dex-ui overshoot ease, t∈[0,1]
export const QUINTIC_LINEAR: string;                   // "linear(0, …, 1)" 33 samples, for CSS
export const EASE_PANEL = "cubic-bezier(0.85, 0.5, 0.85, 0.5)";
export const EASE_FADE = "cubic-bezier(0.4, 0, 1, 1)";
// lib/themes.ts
export type ThemeName = "tron" | "matrix" | "blade" | "apollo" | "interstellar";
export const THEMES: Record<ThemeName, { r: number; g: number; b: number;
  bgBlack: string; bgPanel: string; bgGrey: string; light?: boolean }>;
export const THEME_NAMES: ThemeName[];
```

- [ ] **Step 1: Write failing tests**

`tests/easing.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { quinticInOutBack, QUINTIC_LINEAR } from "../lib/easing";

describe("quinticInOutBack (dex-ui f(t)=14.0525t⁵−21.5575t⁴−0.69t³+9.195t²)", () => {
  it("anchors at 0 and 1", () => {
    expect(quinticInOutBack(0)).toBeCloseTo(0, 6);
    expect(quinticInOutBack(1)).toBeCloseTo(1, 3);
  });
  it("overshoots past 1 near t=0.8 then settles", () => {
    expect(quinticInOutBack(0.8)).toBeGreaterThan(1.01);
  });
  it("emits a CSS linear() string with 33 samples", () => {
    expect(QUINTIC_LINEAR.startsWith("linear(")).toBe(true);
    expect(QUINTIC_LINEAR.endsWith(")")).toBe(true);
    expect(QUINTIC_LINEAR.split(",").length).toBe(33);
  });
});
```

`tests/themes.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { THEMES, THEME_NAMES } from "../lib/themes";

describe("themes (spec §4.1 / reference analysis §1.1)", () => {
  it("defines exactly the five spec themes", () => {
    expect(THEME_NAMES).toEqual(["tron", "matrix", "blade", "apollo", "interstellar"]);
  });
  it("uses the extracted eDEX palettes", () => {
    expect([THEMES.tron.r, THEMES.tron.g, THEMES.tron.b]).toEqual([170, 207, 209]);
    expect(THEMES.tron.bgPanel).toBe("#05080d");
    expect([THEMES.matrix.r, THEMES.matrix.g, THEMES.matrix.b]).toEqual([0, 143, 17]);
    expect([THEMES.blade.r, THEMES.blade.g, THEMES.blade.b]).toEqual([204, 94, 55]);
    expect([THEMES.apollo.r, THEMES.apollo.g, THEMES.apollo.b]).toEqual([235, 235, 235]);
    expect(THEMES.interstellar.light).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `lib/easing.ts`**

```ts
// dex-ui's signature ease (easing-utils.cpp): overshoots ~1.04 near t≈0.8, settles at 1.
export function quinticInOutBack(t: number): number {
  const ts = t * t;
  const tc = ts * t;
  return 14.0525 * tc * ts + -21.5575 * ts * ts + -0.689999999999991 * tc + 9.195 * ts;
}

// CSS `linear()` twin, sampled at 33 evenly spaced points, for use in globals.css.
export const QUINTIC_LINEAR = `linear(${Array.from({ length: 33 }, (_, i) => {
  const t = i / 32;
  return Number(quinticInOutBack(t).toFixed(4));
}).join(", ")})`;

export const EASE_PANEL = "cubic-bezier(0.85, 0.5, 0.85, 0.5)"; // eDEX shell expand
export const EASE_FADE = "cubic-bezier(0.4, 0, 1, 1)";          // eDEX fades
```

- [ ] **Step 4: Implement `lib/themes.ts`**

```ts
export type ThemeName = "tron" | "matrix" | "blade" | "apollo" | "interstellar";

export type Theme = {
  r: number; g: number; b: number;
  bgBlack: string; bgPanel: string; bgGrey: string;
  light?: boolean;
};

// Palettes extracted from eDEX-UI theme JSONs (facts only — see docs/design/REFERENCE-ANALYSIS.md §1.1)
export const THEMES: Record<ThemeName, Theme> = {
  tron:         { r: 170, g: 207, b: 209, bgBlack: "#000000", bgPanel: "#05080d", bgGrey: "#262828" },
  matrix:       { r: 0,   g: 143, b: 17,  bgBlack: "#0d0208", bgPanel: "#090b0a", bgGrey: "#262827" },
  blade:        { r: 204, g: 94,  b: 55,  bgBlack: "#000000", bgPanel: "#090b0a", bgGrey: "#262827" },
  apollo:       { r: 235, g: 235, b: 235, bgBlack: "#000000", bgPanel: "#191919", bgGrey: "#262827" },
  interstellar: { r: 3,   g: 169, b: 244, bgBlack: "#f3f3f3", bgPanel: "#dedede", bgGrey: "#bfbfbf", light: true },
};

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];

export function isTheme(x: string): x is ThemeName {
  return (THEME_NAMES as string[]).includes(x);
}
```

- [ ] **Step 5: Run tests**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 6: Print `QUINTIC_LINEAR` for the next task**

Temporarily add `console.log(QUINTIC_LINEAR);` as the first line inside the "emits a CSS linear() string" test, run `npm run test`, copy the printed `linear(0, …, 1)` string from the output, then remove the log line and re-run to confirm green. Save the string — Task 4 pastes it into `globals.css`.

- [ ] **Step 7: Commit**

```bash
git add lib/easing.ts lib/themes.ts tests/easing.test.ts tests/themes.test.ts
git commit -m "feat: add dex-ui easing math and eDEX theme palettes"
```

---

### Task 4: Design-token CSS layer + root layout (fonts, meta, theme boot script)

**Files:**
- Modify: `app/globals.css` (full rewrite — delete everything, replace with below)
- Modify: `app/layout.tsx` (full rewrite)

**Interfaces:**
- Produces CSS classes/attrs every later task uses: theme vars (`--color-r/g/b`, `--bg-*`), Tailwind tokens (`text-accent`, `bg-panel`, `bg-cockpit`, `font-display`, `font-term`, `text-warn`, `text-error`), `.grid-bg`, `.scanlines`, `.panel-frame`, `.hairline`, `.stagger` system (`--i`), keyframes (`fade-in`, `flicker-in`, `panel-in`, `blink`, `pulse-dot`, `tick-grow`, `sweep`), boot gating (`html[data-booting] .cockpit-root`), fonts via `--font-rajdhani`/`--font-fira`.
- Consumes: `QUINTIC_LINEAR` string printed in Task 3 Step 6.

- [ ] **Step 1: Rewrite `app/globals.css`**

Replace the entire file. Where you see `/* PASTE QUINTIC_LINEAR HERE */`, paste the exact string from Task 3 Step 6.

```css
@import "tailwindcss";

/* ================= THEMES (spec §4.1) ================= */
:root, html[data-theme="tron"] {
  --color-r: 170; --color-g: 207; --color-b: 209;
  --bg-black: #000000; --bg-panel: #05080d; --bg-grey: #262828;
}
html[data-theme="matrix"] {
  --color-r: 0; --color-g: 143; --color-b: 17;
  --bg-black: #0d0208; --bg-panel: #090b0a; --bg-grey: #262827;
}
html[data-theme="blade"] {
  --color-r: 204; --color-g: 94; --color-b: 55;
  --bg-black: #000000; --bg-panel: #090b0a; --bg-grey: #262827;
}
html[data-theme="apollo"] {
  --color-r: 235; --color-g: 235; --color-b: 235;
  --bg-black: #000000; --bg-panel: #191919; --bg-grey: #262827;
}
html[data-theme="interstellar"] {
  --color-r: 3; --color-g: 169; --color-b: 244;
  --bg-black: #f3f3f3; --bg-panel: #dedede; --bg-grey: #bfbfbf;
}

:root {
  --accent: rgb(var(--color-r) var(--color-g) var(--color-b));
  --accent-50: rgb(var(--color-r) var(--color-g) var(--color-b) / 0.5);
  --accent-30: rgb(var(--color-r) var(--color-g) var(--color-b) / 0.3);
  --ease-panel: cubic-bezier(0.85, 0.5, 0.85, 0.5);
  --ease-fade: cubic-bezier(0.4, 0, 1, 1);
  --ease-overshoot: /* PASTE QUINTIC_LINEAR HERE */;
}

/* ============ TAILWIND TOKEN BRIDGE (v4) ============ */
@theme inline {
  --color-accent: rgb(var(--color-r) var(--color-g) var(--color-b));
  --color-panel: var(--bg-panel);
  --color-cockpit: var(--bg-grey);
  --color-abyss: var(--bg-black);
  --color-warn: #ffcc00;
  --color-error: #ff4444;
  --font-display: var(--font-rajdhani), sans-serif;
  --font-term: var(--font-fira), monospace;
}

/* ================= BASE ================= */
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; padding: 0; }
body {
  background: var(--bg-panel);
  color: var(--accent);
  font-family: var(--font-fira), monospace;
  font-size: max(1.6vh, 13px);
}
::selection { background: var(--accent-30); }

/* eDEX grid backdrop (reference analysis §1.2) */
.grid-bg {
  background:
    linear-gradient(90deg, var(--bg-panel) calc(2vh - 1px), transparent 1%) center,
    linear-gradient(var(--bg-panel) calc(2vh - 1px), transparent 1%) center,
    var(--bg-grey);
  background-size: 2vh 2vh;
}

/* Panel-interior scrollbars */
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-track { background: var(--accent-30); border: 3px solid var(--bg-panel); }
*::-webkit-scrollbar-thumb { background: var(--accent); }

/* ================= PANEL CHROME ================= */
.panel-frame {
  --aug-border-all: 2px;
  --aug-border-bg: var(--accent-50);
  --aug-tl: 10px; --aug-br: 10px; --aug-tr: 10px; --aug-bl: 10px;
  background: rgb(from var(--bg-panel) r g b / 0.85);
}
.hairline { border-bottom: 1px solid var(--accent-30); position: relative; }
.hairline::before, .hairline::after {
  content: ""; position: absolute; bottom: -4px; width: 1px; height: 4px;
  background: var(--accent-30);
}
.hairline::before { left: 0; }
.hairline::after { right: 0; }

/* ================= KEYFRAMES ================= */
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes flicker-in {
  0% { opacity: 0; } 20% { opacity: 1; } 35% { opacity: 0.3; }
  55% { opacity: 1; } 70% { opacity: 0.6; } 100% { opacity: 1; }
}
@keyframes panel-in {
  0% { opacity: 0; clip-path: inset(50% 0 50% 0); }
  40% { opacity: 1; clip-path: inset(50% 0 50% 0); }
  70% { clip-path: inset(0 0 0 0); }
  100% { opacity: 1; clip-path: inset(0 0 0 0); }
}
@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
@keyframes tick-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes sweep { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
@keyframes derezz-top {
  from { transform: translateY(100%) translateX(-1%); }
  to { transform: translateY(100%) translateX(-5%); }
}
@keyframes derezz-bottom {
  from { transform: translateY(-100%) translateX(1%); }
  to { transform: translateY(-100%) translateX(3%); }
}

/* ================= ENTRANCE STAGGER (spec §9.3) ================= */
/* Panels set style="--i: n". Entrance plays once the boot overlay lifts. */
html[data-booting="1"] .cockpit-root { visibility: hidden; }
html:not([data-booting]) .stagger {
  animation: panel-in 0.5s var(--ease-fade) both;
  animation-delay: calc(var(--i, 0) * 120ms);
}
html:not([data-booting]) .stagger-title {
  animation: flicker-in 0.18s linear both;
  animation-delay: calc(var(--i, 0) * 120ms + 250ms);
}

/* ================= CRT LAYER (spec §4.3) ================= */
.scanlines { position: fixed; inset: 0; pointer-events: none; z-index: 60; }
.scanlines::before {
  content: ""; position: absolute; inset: 0;
  background: repeating-linear-gradient(
    to bottom, rgb(0 0 0 / 0.03) 0 1px, transparent 1px 3px);
}
.scanlines::after {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 18vh;
  background: linear-gradient(to bottom, transparent, rgb(var(--color-r) var(--color-g) var(--color-b) / 0.02), transparent);
  animation: sweep 8s linear infinite;
}
html[data-fx="off"] .scanlines { display: none; }

/* ================= REDUCED MOTION (spec §9.5) ================= */
@media (prefers-reduced-motion: reduce) {
  html { --reduced: 1; }
}
html[data-motion="reduced"] *, html[data-motion="reduced"] *::before, html[data-motion="reduced"] *::after,
:root:has([data-force-reduced]) * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
html[data-motion="reduced"] .scanlines { display: none; }
```

Note: `rgb(from var(--bg-panel) r g b / 0.85)` uses relative color syntax (Chrome/FF/Safari ≥ 2024). If the build's Lightning CSS rejects it, replace with `color-mix(in srgb, var(--bg-panel) 85%, transparent)`.

- [ ] **Step 2: Rewrite `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Rajdhani, Fira_Code } from "next/font/google";
import "augmented-ui/augmented-ui.min.css";
import "./globals.css";
import { content } from "@/lib/content";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-fira",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jamal Bhola - Software Engineer",
  description:
    "Computer Engineering graduate from SDSU specializing in software and web development",
  openGraph: {
    title: "Jamal Bhola - Software Engineer",
    description:
      "Computer Engineering graduate from SDSU specializing in software and web development",
    type: "website",
  },
};

// Runs before paint: restores theme, decides whether the boot intro plays,
// respects prefers-reduced-motion. Kept inline to avoid any flash (spec §11).
const bootScript = `(function(){try{
var d=document.documentElement;
var t=localStorage.getItem('jb-theme');if(t)d.setAttribute('data-theme',t);
var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(rm)d.setAttribute('data-motion','reduced');
if(!rm&&!sessionStorage.getItem('jb-booted'))d.setAttribute('data-booting','1');
if(localStorage.getItem('jb-fx')==='off')d.setAttribute('data-fx','off');
}catch(e){}})()`;

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: content.identity.name,
  jobTitle: content.identity.tagline,
  email: `mailto:${content.contact.email}`,
  alumniOf: content.identity.school,
  address: { "@type": "PostalAddress", addressLocality: "Los Angeles", addressRegion: "CA" },
  sameAs: content.contact.links.map((l) => l.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </head>
      <body className={`${rajdhani.variable} ${firaCode.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

Add the `@/*` path alias check: `tsconfig.json` already maps `@/*` in create-next-app defaults — verify `"paths": { "@/*": ["./*"] }` exists in `tsconfig.json`; add it if missing.

- [ ] **Step 3: Full check**

Run: `npx tsc --noEmit` then `npm run test` then `npm run build`
Expected: all green. Old pages still compile because they don't use removed CSS classes at build time (CSS classes are strings). The site will look broken/plain — fine until Task 8.

- [ ] **Step 4: Preview check**

Start dev server (preview tools or `npm run dev`). Observe `/`:
- Page background near-black `#05080d` (inspect body background-color = `rgb(5, 8, 13)`).
- No Orbitron anywhere; computed font-family of body includes Fira Code.
- No console errors (a hydration warning from old page's clock is acceptable this task only).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx tsconfig.json
git commit -m "feat: eDEX design-token CSS layer, themes, fonts, boot gating script"
```

---

## Phase 1 — Primitives

### Task 5: Hooks — ticker, reduced motion, storage, clock, typewriter

**Files:**
- Create: `hooks/useTicker.ts`, `hooks/useReducedMotion.ts`, `hooks/useLocalStorage.ts`, `hooks/useClock.ts`, `hooks/useTypewriter.ts`
- Test: `tests/hooks.test.tsx`

**Interfaces:**
- Produces (exact signatures later tasks import):

```ts
useTicker(cb: (dt: number, t: number) => void, active?: boolean): void  // shared rAF, pauses on hidden tab
useReducedMotion(): boolean
useLocalStorage(key: string): [string | null, (v: string) => void]     // guarded, null on SSR/error
useClock(): { h: string; m: string; s: string; date: string } | null   // null until mounted
useTypewriter(text: string, cps?: number): { out: string; done: boolean; skip: () => void }
```

- [ ] **Step 1: Write failing tests — `tests/hooks.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useTypewriter } from "../hooks/useTypewriter";
import { useLocalStorage } from "../hooks/useLocalStorage";

afterEach(cleanup);

describe("useTypewriter", () => {
  it("reveals text progressively and reports done", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTypewriter("HELLO WORLD", 40));
    expect(result.current.out).toBe("");
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current.out.length).toBeGreaterThan(0);
    expect(result.current.out.length).toBeLessThan(11);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.out).toBe("HELLO WORLD");
    expect(result.current.done).toBe(true);
    vi.useRealTimers();
  });
  it("skip() reveals everything at once", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTypewriter("HELLO", 10));
    act(() => { result.current.skip(); });
    expect(result.current.out).toBe("HELLO");
    expect(result.current.done).toBe(true);
    vi.useRealTimers();
  });
});

describe("useLocalStorage", () => {
  it("reads and writes", () => {
    const { result } = renderHook(() => useLocalStorage("jb-test"));
    act(() => { result.current[1]("abc"); });
    expect(result.current[0]).toBe("abc");
    expect(localStorage.getItem("jb-test")).toBe("abc");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test`
Expected: FAIL — hooks not found.

- [ ] **Step 3: Implement the five hooks**

`hooks/useTicker.ts`:

```ts
"use client";
import { useEffect, useRef } from "react";

type TickFn = (dt: number, t: number) => void;

const subs = new Set<TickFn>();
let raf = 0;
let last = 0;
let running = false;

function loop(now: number) {
  const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
  last = now;
  subs.forEach((fn) => fn(dt, now / 1000));
  raf = requestAnimationFrame(loop);
}

function start() {
  if (!running && subs.size > 0 && !document.hidden) {
    running = true;
    last = 0;
    raf = requestAnimationFrame(loop);
  }
}
function stop() {
  running = false;
  cancelAnimationFrame(raf);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
}

/** Shared rAF hub (spec §9.2): one loop for all canvases; pauses when tab hidden. */
export function useTicker(cb: TickFn, active = true) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!active) return;
    const fn: TickFn = (dt, t) => ref.current(dt, t);
    subs.add(fn);
    start();
    return () => {
      subs.delete(fn);
      if (subs.size === 0) stop();
    };
  }, [active]);
}
```

`hooks/useReducedMotion.ts`:

```ts
"use client";
import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}
```

`hooks/useLocalStorage.ts`:

```ts
"use client";
import { useCallback, useState } from "react";

/** Guarded localStorage (Safari private mode etc. — spec §14). */
export function useLocalStorage(key: string): [string | null, (v: string) => void] {
  const [value, setValue] = useState<string | null>(() => {
    try {
      return typeof window === "undefined" ? null : localStorage.getItem(key);
    } catch {
      return null;
    }
  });
  const set = useCallback(
    (v: string) => {
      setValue(v);
      try {
        localStorage.setItem(key, v);
      } catch {}
    },
    [key]
  );
  return [value, set];
}
```

`hooks/useClock.ts`:

```ts
"use client";
import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Returns null until mounted (hydration safety — spec §13). */
export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  return {
    h: pad(now.getHours()),
    m: pad(now.getMinutes()),
    s: pad(now.getSeconds()),
    date: now
      .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
      .toUpperCase(),
  };
}
```

`hooks/useTypewriter.ts`:

```ts
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Char-by-char reveal with a small burst jitter (dex-ui AnimatedText).
 * cps = characters per second. skip() completes instantly.
 */
export function useTypewriter(text: string, cps = 40) {
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    const step = Math.max(1000 / cps, 8);
    timer.current = setInterval(() => {
      setCount((c) => {
        const burst = 1 + (Math.random() < 0.2 ? 2 : 0); // occasional 3-char burst
        const next = Math.min(c + burst, text.length);
        if (next >= text.length && timer.current) clearInterval(timer.current);
        return next;
      });
    }, step);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [text, cps]);

  const skip = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    setCount(text.length);
  }, [text]);

  return { out: text.slice(0, count), done: count >= text.length, skip };
}
```

- [ ] **Step 4: Run tests**

Run: `npm run test`
Expected: PASS (typewriter + storage suites green).

- [ ] **Step 5: Full check, then commit**

```bash
git add hooks tests/hooks.test.tsx
git commit -m "feat: animation/state hooks (ticker, typewriter, clock, storage, reduced-motion)"
```

---

### Task 6: `lib/audio.ts` — WebAudio-synthesized SFX

**Files:**
- Create: `lib/audio.ts`
- Test: `tests/audio.test.ts`

**Interfaces:**
- Produces:

```ts
export type SfxName = "stdout" | "key" | "granted" | "denied" | "expand" | "panel" | "theme";
export const sfx: {
  enabled: boolean;
  setEnabled(on: boolean): void;   // persists to localStorage "jb-sound"
  init(): void;                    // call on first user gesture; safe to call repeatedly
  play(name: SfxName): void;       // no-op unless enabled + initialized
};
```

- [ ] **Step 1: Write failing test — `tests/audio.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { sfx } from "../lib/audio";

describe("sfx guards (spec §10, §14)", () => {
  it("play() is a safe no-op before init and without AudioContext (jsdom)", () => {
    expect(() => sfx.play("stdout")).not.toThrow();
    expect(() => sfx.init()).not.toThrow(); // jsdom has no AudioContext — must swallow
    expect(() => sfx.play("granted")).not.toThrow();
  });
  it("setEnabled persists", () => {
    sfx.setEnabled(true);
    expect(localStorage.getItem("jb-sound")).toBe("on");
    sfx.setEnabled(false);
    expect(localStorage.getItem("jb-sound")).toBe("off");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run test` — FAIL, module not found.

- [ ] **Step 3: Implement `lib/audio.ts`**

All sounds are synthesized (eDEX WAVs are GPL — spec §10). Recipes from spec §10.

```ts
export type SfxName = "stdout" | "key" | "granted" | "denied" | "expand" | "panel" | "theme";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensureCtx() {
  if (ctx) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.25;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
    master = null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType, vol = 1, sweepTo?: number) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur);
}

function noiseBurst(dur: number, from: number, to: number, vol = 0.5) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t0);
}

const recipes: Record<SfxName, () => void> = {
  stdout: () => tone(2200, 0.02, "square", 0.08),
  key: () => noiseBurst(0.015, 1400, 2200, 0.15),
  granted: () => { tone(880, 0.05, "sine", 0.3); setTimeout(() => tone(1320, 0.07, "sine", 0.3), 45); },
  denied: () => tone(140, 0.12, "sawtooth", 0.35),
  expand: () => noiseBurst(0.35, 200, 3000, 0.25),
  panel: () => tone(660, 0.06, "triangle", 0.2),
  theme: () => { tone(660, 0.06, "sine", 0.25); setTimeout(() => tone(880, 0.06, "sine", 0.25), 70); setTimeout(() => tone(1100, 0.09, "sine", 0.25), 140); },
};

function readEnabled(): boolean {
  try {
    return localStorage.getItem("jb-sound") === "on";
  } catch {
    return false;
  }
}

export const sfx = {
  get enabled() {
    return readEnabled();
  },
  setEnabled(on: boolean) {
    try {
      localStorage.setItem("jb-sound", on ? "on" : "off");
    } catch {}
    if (on) ensureCtx();
  },
  init() {
    if (readEnabled()) ensureCtx();
    if (ctx?.state === "suspended") ctx.resume().catch(() => {});
  },
  play(name: SfxName) {
    if (!readEnabled() || !ctx || !master) return;
    try {
      recipes[name]();
    } catch {}
  },
};
```

- [ ] **Step 4: Run tests, full check, commit**

Run: `npm run test` — PASS.

```bash
git add lib/audio.ts tests/audio.test.ts
git commit -m "feat: WebAudio-synthesized sfx with hard guards"
```

---

### Task 7: `Panel`, `PanelTitle`, `TickLine`, `WidgetBoundary`

**Files:**
- Create: `components/Panel.tsx`, `components/TickLine.tsx`, `components/WidgetBoundary.tsx`
- Test: `tests/panel.test.tsx`

**Interfaces:**
- Produces:

```tsx
<Panel index={n} titleLeft="PANEL" titleRight="SYSTEM" aug="tl-clip br-clip border"
       className="..." bodyClassName="...">{children}</Panel>
// index → style={{ "--i": n }} + class "stagger"; title uses class "stagger-title"
<TickLine className="..." delayMs={0} />           // grows via tick-grow + --ease-overshoot
<WidgetBoundary fallbackLabel="MODULE OFFLINE">…</WidgetBoundary>  // error boundary per canvas
```

- [ ] **Step 1: Write failing test — `tests/panel.test.tsx`**

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Panel } from "../components/Panel";
import { WidgetBoundary } from "../components/WidgetBoundary";

afterEach(cleanup);

function Bomb(): never {
  throw new Error("boom");
}

describe("Panel", () => {
  it("renders two-part title and children with stagger index", () => {
    const { container } = render(
      <Panel index={3} titleLeft="PANEL" titleRight="SYSTEM">
        <p>body</p>
      </Panel>
    );
    expect(screen.getByText("PANEL")).toBeTruthy();
    expect(screen.getByText("SYSTEM")).toBeTruthy();
    expect(screen.getByText("body")).toBeTruthy();
    const root = container.querySelector("section")!;
    expect(root.getAttribute("style")).toContain("--i: 3");
    expect(root.getAttribute("data-augmented-ui")).toBeTruthy();
  });
});

describe("WidgetBoundary", () => {
  it("catches render errors and shows on-brand fallback", () => {
    render(
      <WidgetBoundary fallbackLabel="GLOBE OFFLINE">
        <Bomb />
      </WidgetBoundary>
    );
    expect(screen.getByText("GLOBE OFFLINE")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm run test` FAILs (components missing).

- [ ] **Step 3: Implement `components/Panel.tsx`**

```tsx
import type { ReactNode } from "react";

type PanelProps = {
  index?: number;
  titleLeft: string;
  titleRight?: string;
  aug?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

/**
 * eDEX panel chrome (spec §4.3): chamfered aug frame, two-part uppercase
 * title bar with end-ticked hairline, staggered entrance via --i.
 */
export function Panel({
  index = 0,
  titleLeft,
  titleRight,
  aug = "tl-clip br-clip border",
  className = "",
  bodyClassName = "",
  children,
}: PanelProps) {
  return (
    <section
      data-augmented-ui={aug}
      className={`panel-frame stagger relative flex min-h-0 flex-col p-[0.9vh] ${className}`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <h3 className="hairline stagger-title mb-[0.7vh] flex justify-between gap-2 pb-[0.3vh] font-display text-[max(1.1vh,10px)] font-bold uppercase tracking-[0.15em]">
        <p className="m-0">{titleLeft}</p>
        {titleRight ? <p className="m-0 text-right opacity-70">{titleRight}</p> : null}
      </h3>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
```

- [ ] **Step 4: Implement `components/TickLine.tsx`**

```tsx
type TickLineProps = { className?: string; delayMs?: number };

/** dex-ui AnimatedTickLine: hairline that grows open with end ticks (spec §9.2). */
export function TickLine({ className = "", delayMs = 0 }: TickLineProps) {
  return (
    <div
      aria-hidden
      className={`hairline h-px origin-center ${className}`}
      style={{
        animation: `tick-grow 0.4s var(--ease-overshoot) both`,
        animationDelay: `${delayMs}ms`,
      }}
    />
  );
}
```

- [ ] **Step 5: Implement `components/WidgetBoundary.tsx`**

```tsx
"use client";
import { Component, type ReactNode } from "react";

type Props = { fallbackLabel: string; children: ReactNode };
type State = { failed: boolean };

/** A dead widget must never kill the cockpit (spec §14). */
export class WidgetBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full min-h-[6vh] items-center justify-center border border-dashed border-accent/30 font-term text-[max(1.1vh,10px)] tracking-widest text-accent/50">
          {this.props.fallbackLabel}
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 6: Run tests, full check, commit**

Run: `npm run test` — PASS. Then `npx tsc --noEmit` && `npm run build`.

```bash
git add components/Panel.tsx components/TickLine.tsx components/WidgetBoundary.tsx tests/panel.test.tsx
git commit -m "feat: panel chrome, tick line, widget error boundary"
```

---

## Phase 2 — Cockpit shell & boot

### Task 8: Cockpit grid + StatusBar (final page structure with standby panels)

**Files:**
- Create: `components/StatusBar.tsx`
- Modify: `app/page.tsx` (full rewrite)

**Interfaces:**
- Produces: the final grid skeleton. Later tasks only swap a `<Panel>STANDBY</Panel>` for a real panel component — the grid never changes again. Panel stagger indices are assigned here (left column 1,3,5,7,9 / right column 2,4,6,8 / terminal 0 / browser 10 — pairwise left/right like eDEX).
- Consumes: `Panel` (Task 7), theme/audio libs (Tasks 3, 6), `useClock`, `useLocalStorage` (Task 5).

- [ ] **Step 1: Create `components/StatusBar.tsx`**

```tsx
"use client";
import { useCallback, useEffect } from "react";
import { useClock } from "@/hooks/useClock";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { THEME_NAMES, isTheme } from "@/lib/themes";
import { sfx } from "@/lib/audio";

/** Top strip: brand · theme/sound/fx controls · live clock (spec §5, §6). */
export function StatusBar() {
  const clock = useClock();
  const [theme, setTheme] = useLocalStorage("jb-theme");
  const [sound, setSound] = useLocalStorage("jb-sound");
  const [fx, setFx] = useLocalStorage("jb-fx");

  useEffect(() => {
    const t = theme && isTheme(theme) ? theme : "tron";
    document.documentElement.setAttribute("data-theme", t);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-fx", fx === "off" ? "off" : "on");
  }, [fx]);

  const cycleTheme = useCallback(() => {
    const current = theme && isTheme(theme) ? theme : "tron";
    const next = THEME_NAMES[(THEME_NAMES.indexOf(current) + 1) % THEME_NAMES.length];
    setTheme(next);
    sfx.init();
    sfx.play("theme");
  }, [theme, setTheme]);

  const toggleSound = useCallback(() => {
    const on = sound !== "on";
    setSound(on ? "on" : "off");
    sfx.setEnabled(on);
    sfx.init();
    if (on) sfx.play("granted");
  }, [sound, setSound]);

  const btn =
    "cursor-pointer bg-transparent border-0 p-0 font-term text-[max(1.2vh,11px)] uppercase tracking-[0.12em] text-accent/70 hover:text-accent transition-colors";

  return (
    <header className="stagger flex items-center justify-between px-[1vh] font-term text-[max(1.2vh,11px)] uppercase tracking-[0.12em]" style={{ "--i": 0 } as React.CSSProperties}>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[max(1.6vh,13px)] font-bold tracking-[0.2em]">
          JB://PORTFOLIO
        </span>
        <span className="text-accent/50">v2.0</span>
      </div>
      <div className="flex items-center gap-[2vh]">
        <button type="button" className={btn} onClick={cycleTheme} aria-label="Cycle color theme">
          THM◇{theme && isTheme(theme) ? theme : "tron"}
        </button>
        <button type="button" className={btn} onClick={toggleSound} aria-pressed={sound === "on"} aria-label="Toggle sound">
          SND {sound === "on" ? "◉" : "○"}
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => setFx(fx === "off" ? "on" : "off")}
          aria-pressed={fx !== "off"}
          aria-label="Toggle CRT effects"
        >
          FX {fx === "off" ? "○" : "◉"}
        </button>
        <span suppressHydrationWarning className="tabular-nums text-accent">
          {clock ? `${clock.h}:${clock.m}:${clock.s}` : "--:--:--"}
        </span>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Rewrite `app/page.tsx` (grid skeleton, standby panels)**

```tsx
import { Panel } from "@/components/Panel";
import { StatusBar } from "@/components/StatusBar";

function Standby() {
  return (
    <div className="flex h-full items-center justify-center py-[2vh] font-term text-[max(1.1vh,10px)] tracking-[0.3em] text-accent/40">
      STANDBY
    </div>
  );
}

export default function Home() {
  return (
    <div className="cockpit-root grid-bg fixed inset-0 grid grid-rows-[3vh_1fr_22vh] gap-[0.75vh] p-[1vh] max-lg:static max-lg:min-h-screen max-lg:grid-rows-none max-lg:grid-cols-1 max-lg:overflow-auto">
      <a
        href="#terminal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:bg-panel focus:p-2 focus:text-accent"
      >
        Skip to content
      </a>
      <StatusBar />

      <div className="grid min-h-0 grid-cols-[17%_1fr_17%] gap-[0.75vh] max-lg:grid-cols-1">
        {/* LEFT — PANEL // SYSTEM */}
        <div className="flex min-h-0 flex-col justify-between gap-[0.75vh] max-lg:order-2">
          <Panel index={1} titleLeft="CLOCK" titleRight="LOCAL"><Standby /></Panel>
          <Panel index={3} titleLeft="OPERATOR" titleRight="ID"><Standby /></Panel>
          <Panel index={5} titleLeft="SKILLS" titleRight="PROF"><Standby /></Panel>
          <Panel index={7} titleLeft="PROC" titleRight="TOP"><Standby /></Panel>
          <Panel index={9} titleLeft="MEM" titleRight="HEAP"><Standby /></Panel>
        </div>

        {/* CENTER — TERMINAL */}
        <Panel
          index={0}
          titleLeft="TERMINAL"
          titleRight="MAIN SHELL"
          aug="bl-clip tr-clip border"
          className="min-h-[40vh]"
        >
          <div id="terminal" className="h-full">
            <Standby />
          </div>
        </Panel>

        {/* RIGHT — PANEL // NETWORK */}
        <div className="flex min-h-0 flex-col justify-between gap-[0.75vh] max-lg:order-3">
          <Panel index={2} titleLeft="WORLD" titleRight="GEO"><Standby /></Panel>
          <Panel index={4} titleLeft="UPLINKS" titleRight="CONN"><Standby /></Panel>
          <Panel index={6} titleLeft="NETSTAT" titleRight="LIVE"><Standby /></Panel>
          <Panel index={8} titleLeft="TRAFFIC" titleRight="NET"><Standby /></Panel>
        </div>
      </div>

      {/* BOTTOM — PROJECT ARCHIVE */}
      <Panel index={10} titleLeft="FILES" titleRight="PROJECT_ARCHIVE" className="max-lg:order-4">
        <Standby />
      </Panel>

      <div className="scanlines" aria-hidden />
    </div>
  );
}
```

- [ ] **Step 3: Full check** (`npx tsc --noEmit`, `npm run test`, `npm run build`) — all green.

- [ ] **Step 4: Preview check**

- Fullscreen cockpit, no page scroll at desktop width; faint grid visible between panels.
- 10 chamfered panels + terminal + bottom strip, each with two-part uppercase title + hairline w/ end ticks.
- Panels play the staggered `panel-in` entrance on load (clip reveal, 120ms apart) — because no boot overlay exists yet, entrance runs immediately.
- StatusBar: clock ticks each second; THM button cycles themes **live** (background/accent change, persists on reload); SND/FX toggle symbols.
- `preview_console_logs`: no errors, no hydration warnings.
- Resize to 375px: single column, panels stack in order terminal→left→right→files, page scrolls.

- [ ] **Step 5: Commit**

```bash
git add components/StatusBar.tsx app/page.tsx
git commit -m "feat: fullscreen cockpit grid, status bar, theme cycling, stagger entrances"
```

---

### Task 9: Boot sequence — log, title card, lift

**Files:**
- Create: `lib/bootLog.ts`, `components/BootSequence.tsx`
- Modify: `app/page.tsx` (add `<BootSequence />` as first child of `.cockpit-root`)
- Test: `tests/bootlog.test.ts`

**Interfaces:**
- Produces: `buildBootLog(): string[]` (~80 lines, deterministic, from content); `<BootSequence />` — plays spec §7 T1→T3, then removes `data-booting` from `<html>`, sets `sessionStorage("jb-booted")`, unmounts. Skippable via any key / click on SKIP.
- Consumes: `content` (Task 2), `sfx` (Task 6).

- [ ] **Step 1: Write failing test — `tests/bootlog.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { buildBootLog } from "../lib/bootLog";

describe("boot log (spec §7 T1)", () => {
  it("is a 70-90 line original log ending with Boot Complete + Welcome", () => {
    const log = buildBootLog();
    expect(log.length).toBeGreaterThanOrEqual(70);
    expect(log.length).toBeLessThanOrEqual(90);
    expect(log[log.length - 2]).toBe("Boot Complete");
    expect(log[log.length - 1]).toBe("Welcome to JB-OS");
    // personal flavor: every project module gets mounted
    const joined = log.join("\n");
    expect(joined).toContain("voice_bot.py");
    expect(joined).toContain("portfolio.tsx");
    // license wall: no eDEX strings
    expect(joined).not.toMatch(/eDEX/i);
  });
});
```

- [ ] **Step 2: Run to verify failure** — module not found.

- [ ] **Step 3: Implement `lib/bootLog.ts`**

Original text (never copy eDEX's `boot_log.txt` — GPL). Mixes kernel pastiche with real portfolio data:

```ts
import { content } from "./content";

/** Deterministic ~80-line fake boot log, personalized from site content (spec §7 T1). */
export function buildBootLog(): string[] {
  const lines: string[] = [
    "JB-OS v2.0.0 — initializing kernel",
    `boot at ${"2026-01-01T00:00:00Z"} on node jamal-bhola.dev; root:jbos-2.0.0/RELEASE_WEB_X64`,
    "vm_page_bootstrap: 262144 free pages and 4096 wired pages",
    "standard timeslicing quantum is 10000 us",
    "JBACPICPU: ProcessorId=1 LocalApicId=0 Enabled",
    "JBACPICPU: ProcessorId=2 LocalApicId=2 Enabled",
    "JBACPICPU: ProcessorId=3 LocalApicId=4 Enabled",
    "JBACPICPU: ProcessorId=4 LocalApicId=6 Enabled",
    "calling mpo_policy_init for CreativityGuard",
    "Security policy loaded: caffeine containment (CreativityGuard)",
    "Copyright (c) 2024-2026 Jamal Bhola. All rights reserved.",
    "MAC Framework successfully initialized",
    "using 16384 buffer headers and 10240 cluster IO buffer headers",
    "IOAPIC: Version 0x20 Vectors 64:87",
    "ACPI: System State [S0 S3 S4 S5] (S3)",
    "[ PCI configuration begin ]",
    "PCI configuration changed (bridge=1 device=4 cardbus=0)",
    "[ PCI configuration end, bridges 4, devices 42 ]",
    "mbinit: done [96 MB total pool size, (64/32) split]",
    "Pthread support ABORTS when sync kernel primitives misused",
    "com.jamal.driver.CoffeeIntake kext loaded",
    "rooting via boot-uuid from /chosen: 4D3C2B1A-JB05-BH0L-A379-PORTFOLIO01",
    "Waiting on <dict ID=\"0\"><key>IOProviderClass</key><string>IOResources</string></dict>",
    "com.jamal.launchd 1 == com.jamal.launchd.portfolio",
    "BSD root: disk0s2, major 1, minor 2",
    "jbfs: mounted /dev/skills (read-only)",
    "jbfs: mounted /dev/projects (read-write)",
    "SDSU degree module verified: B.S. Computer Engineering [OK]",
  ];

  for (const group of content.skills) {
    lines.push(
      `loading skill cluster ${group.label.toLowerCase()}: ${group.skills.join(", ")} [OK]`
    );
  }

  for (const p of content.projects) {
    lines.push(`mounting /dev/projects/${p.file} ... OK`);
    lines.push(`  ${p.title} :: status=${p.status.replace(" ", "_").toUpperCase()}`);
  }

  lines.push(
    "en0: Ethernet address de:ad:be:ef:ca:fe",
    "airport: Link Up on en1",
    `geo_locate: ${content.contact.location} [34.05N 118.24W]`,
    `uplink registered: mailto:${content.contact.email}`,
    ...content.contact.links.map((l) => `uplink registered: ${l.href}`),
    "resume.pdf checksum verified [OK]",
    "IOThinkTank: idle inspiration at 0x00ff41",
    "systemShell: registering /bin/visitor",
    "termdisp: 24-bit color, 60Hz, scanlines ENABLED",
    "audio: WebAudio synth bank armed (7 voices)",
    "theme daemon: tron matrix blade apollo interstellar [5 loaded]",
    "entropy harvested from cosmic background",
    "checking root filesystem for style violations... none found",
    "warming up phosphor layer",
    "aligning chamfered corners",
    "calibrating typewriters to 40cps",
    "spawning panel supervisors (10 workers)",
    "handshake with visitor pending...",
    "all subsystems nominal",
    "Boot Complete",
    "Welcome to JB-OS"
  );

  return lines;
}
```

- [ ] **Step 4: Run test** — `npm run test` PASS (adjust nothing else; if count drifts outside 70–90, add/remove pastiche lines, not content lines).

- [ ] **Step 5: Implement `components/BootSequence.tsx`**

The full §7 choreography. Timings from the reference analysis (§1.4).

```tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildBootLog } from "@/lib/bootLog";
import { content } from "@/lib/content";
import { sfx } from "@/lib/audio";

type Phase = "log" | "title-in" | "title-fill" | "title-border" | "title-glitch" | "title-hold" | "greet" | "done";

function lineDelay(i: number, total: number): number {
  // eDEX displayLine cadence (reference analysis §1.4)
  if (i <= 2) return 500;
  if (i === 25) return 400;
  if (i === 42) return 300;
  if (i >= total - 2) return 300;
  if (i > 4 && i < 25) return 30;
  if (i > 42 && i < 82) return 25;
  return Math.pow(1 - i / 1000, 3) * 25;
}

export function BootSequence() {
  const [active, setActive] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("log");
  const [pct, setPct] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);
  const log = useRef<string[]>([]);

  const finish = useCallback(() => {
    if (cancelled.current) return;
    cancelled.current = true;
    try {
      sessionStorage.setItem("jb-booted", "1");
    } catch {}
    document.documentElement.removeAttribute("data-booting");
    setPhase("done");
  }, []);

  // Only play when the head script armed it (first visit, motion OK).
  useEffect(() => {
    if (document.documentElement.getAttribute("data-booting") === "1") {
      log.current = buildBootLog();
      sfx.init();
      setActive(true);
    }
  }, []);

  // Skip on any key or click of the SKIP control.
  useEffect(() => {
    if (!active) return;
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  // Phase 1: the log.
  useEffect(() => {
    if (!active || phase !== "log") return;
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      if (cancelled.current) return;
      const all = log.current;
      if (i >= all.length) {
        setTimeout(() => setPhase("title-in"), 300);
        return;
      }
      setLines((prev) => [...prev, all[i]]);
      setPct(Math.round(((i + 1) / all.length) * 100));
      sfx.play(all[i] === "Boot Complete" ? "granted" : "stdout");
      i += 1;
      t = setTimeout(step, lineDelay(i, all.length));
    };
    step();
    return () => clearTimeout(t);
  }, [active, phase]);

  // Autoscroll the log.
  useEffect(() => {
    scroller.current?.scrollTo(0, scroller.current.scrollHeight);
  }, [lines]);

  // Phase 2: title card choreography (400 blank → fade-in → fill → border → glitch → hold).
  useEffect(() => {
    if (!active) return;
    if (phase === "title-in") {
      const t1 = setTimeout(() => setPhase("title-fill"), 400 + 300 + 200);
      return () => clearTimeout(t1);
    }
    if (phase === "title-fill") {
      const t = setTimeout(() => setPhase("title-border"), 300);
      return () => clearTimeout(t);
    }
    if (phase === "title-border") {
      const t = setTimeout(() => setPhase("title-glitch"), 100);
      return () => clearTimeout(t);
    }
    if (phase === "title-glitch") {
      const t = setTimeout(() => setPhase("title-hold"), 500);
      return () => clearTimeout(t);
    }
    if (phase === "title-hold") {
      const t = setTimeout(() => setPhase("greet"), 700);
      return () => clearTimeout(t);
    }
    if (phase === "greet") {
      // Lift the overlay so the cockpit entrance staggers play beneath the greeting.
      try {
        sessionStorage.setItem("jb-booted", "1");
      } catch {}
      document.documentElement.removeAttribute("data-booting");
      sfx.play("expand");
      const t = setTimeout(() => finish(), 1400);
      return () => clearTimeout(t);
    }
  }, [active, phase, finish]);

  if (!active || phase === "done") return null;

  const name = `${content.identity.first} ${content.identity.last}`;
  const isTitle = phase.startsWith("title");

  return (
    <div
      className={`fixed inset-0 z-[90] bg-abyss font-term text-[max(1.4vh,12px)] leading-[1.35] text-accent ${
        phase === "greet" ? "pointer-events-none bg-transparent" : ""
      }`}
      aria-label="Boot animation"
    >
      {phase === "log" && (
        <>
          <div ref={scroller} className="h-full overflow-hidden p-[1vh] flex flex-col justify-end">
            <div>
              {lines.map((l, n) => (
                <div key={n} className={l.startsWith("  ") ? "text-accent/60" : undefined}>
                  {l}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-[1vh] right-[1.5vh] tracking-[0.2em] text-accent/70">
            BOOTING… {pct}%
          </div>
        </>
      )}

      {isTitle && (
        <div className="flex h-full items-center justify-center">
          <h1
            className={`relative m-0 select-none px-[2vh] pt-[1vh] text-center font-display text-[10vh] font-bold uppercase tracking-[0.08em] ${
              phase === "title-in" ? "animate-[fade-in_300ms_linear_400ms_both]" : "" /* 400ms blank beat, then fade */
            } ${phase === "title-fill" ? "bg-accent text-abyss" : ""} ${
              phase === "title-border" || phase === "title-hold" ? "border-[5px] border-accent" : ""
            } ${phase === "title-glitch" ? "text-transparent" : "border-b-[0.46vh] border-b-accent"}`}
            data-text={name}
          >
            {name}
            {phase === "title-glitch" && (
              <>
                <span aria-hidden className="absolute inset-0 block text-accent/80 [clip-path:polygon(100%_0%,100%_40%,0%_40%,0%_0%)] animate-[derezz-top_50ms_linear_infinite_alternate-reverse]">
                  {name}
                </span>
                <span aria-hidden className="absolute inset-0 block text-accent/90 [clip-path:polygon(100%_40%,100%_100%,0%_100%,0%_40%)] animate-[derezz-bottom_50ms_linear_infinite_alternate-reverse]">
                  {name}
                </span>
              </>
            )}
          </h1>
        </div>
      )}

      {phase === "greet" && (
        <div className="flex h-full items-center justify-center">
          <p className="animate-[flicker-in_400ms_linear_both] font-display text-[3.9vh]">
            Welcome, <em className="not-italic font-bold">visitor</em>
          </p>
        </div>
      )}

      {phase !== "greet" && (
        <button
          type="button"
          onClick={finish}
          className="absolute bottom-[1vh] left-[1.5vh] cursor-pointer border border-accent/50 bg-transparent px-3 py-1 font-term text-[max(1.2vh,11px)] uppercase tracking-[0.2em] text-accent/80 hover:bg-accent hover:text-abyss"
        >
          SKIP ▸
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Wire into `app/page.tsx`**

Add import and render as the first child inside `.cockpit-root`:

```tsx
import { BootSequence } from "@/components/BootSequence";
// …inside the root div, first line:
      <BootSequence />
```

- [ ] **Step 7: Full check** — tsc/test/build green.

- [ ] **Step 8: Preview check (do all of these)**

1. Clear state: `preview_eval` → `sessionStorage.clear(); localStorage.clear(); location.reload()`.
2. Boot log types bottom-anchored with variable rhythm; `BOOTING… n%` climbs bottom-right.
3. Title card: JAMAL BHOLA appears 10vh, flashes filled → border → **glitch** (two clipped halves jitter horizontally) → holds with border.
4. Overlay lifts; panels stagger in beneath the centered "Welcome, visitor"; greeting fades; cockpit interactive.
5. Reload → **no boot** (sessionStorage), panels still stagger in.
6. Clear again, reload, press any key mid-log → boot ends immediately, cockpit fine.
7. `preview_eval` → `document.documentElement.setAttribute('data-motion','reduced')` + clear storage + reload: boot skipped entirely.
8. Console: zero errors.

- [ ] **Step 9: Commit**

```bash
git add lib/bootLog.ts components/BootSequence.tsx app/page.tsx tests/bootlog.test.ts
git commit -m "feat: eDEX boot sequence (log cadence, glitch title card, skip, session gating)"
```

---

## Phase 3 — Left column (PANEL // SYSTEM)

### Task 10: ClockPanel, OperatorPanel, SkillsPanel

**Files:**
- Create: `components/panels/ClockPanel.tsx`, `components/panels/OperatorPanel.tsx`, `components/panels/SkillsPanel.tsx`
- Modify: `app/page.tsx` (swap three Standbys)
- Test: `tests/panels.test.tsx`

**Interfaces:**
- Consumes: `useClock`, `content`, `Panel` stays in page (these components are panel *bodies* — page keeps `<Panel>` wrappers so stagger indices stay in one place).
- Produces: `<ClockPanel />`, `<OperatorPanel />`, `<SkillsPanel />` (no props).

- [ ] **Step 1: Write failing test — `tests/panels.test.tsx`**

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { OperatorPanel } from "../components/panels/OperatorPanel";
import { SkillsPanel } from "../components/panels/SkillsPanel";

afterEach(cleanup);

describe("OperatorPanel", () => {
  it("shows preserved identity fields", () => {
    render(<OperatorPanel />);
    expect(screen.getByText("Jamal Bhola")).toBeTruthy();
    expect(screen.getByText("Software Engineer & Web Developer")).toBeTruthy();
    expect(screen.getByText(/San Diego State University/)).toBeTruthy();
    expect(screen.getByText("Los Angeles, CA")).toBeTruthy();
  });
});

describe("SkillsPanel", () => {
  it("renders every skill from every group", () => {
    render(<SkillsPanel />);
    for (const s of ["React", "Django", "PostgreSQL", "Docker"]) {
      expect(screen.getByText(s)).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run to verify failure** — components missing.

- [ ] **Step 3: Implement `components/panels/ClockPanel.tsx`**

```tsx
"use client";
import { useClock } from "@/hooks/useClock";

/** eDEX mod_clock: big digits, blinking colons, date line (spec §6). */
export function ClockPanel() {
  const c = useClock();
  return (
    <div className="flex flex-col items-center py-[0.5vh]">
      <div
        suppressHydrationWarning
        className="font-display text-[max(4vh,26px)] font-medium tabular-nums tracking-[0.08em]"
        aria-live="off"
      >
        {c ? (
          <>
            {c.h}
            <span className="animate-[blink_1s_linear_infinite]">:</span>
            {c.m}
            <span className="animate-[blink_1s_linear_infinite]">:</span>
            {c.s}
          </>
        ) : (
          "--:--:--"
        )}
      </div>
      <div suppressHydrationWarning className="font-term text-[max(1.1vh,10px)] tracking-[0.3em] text-accent/60">
        {c ? c.date : "LOADING"}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `components/panels/OperatorPanel.tsx`**

Server component (no interactivity — SEO text!).

```tsx
import { content } from "@/lib/content";

const rows: [string, string][] = [
  ["NAME", content.identity.name],
  ["ROLE", content.identity.tagline],
  ["EDU", `B.S. Computer Engineering — ${content.identity.school}`],
  ["LOC", content.identity.location],
];

export function OperatorPanel() {
  return (
    <dl className="m-0 flex flex-col gap-[0.5vh] font-term text-[max(1.25vh,11px)] leading-snug">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-[1vh]">
          <dt className="w-[5ch] shrink-0 text-accent/50">{k}</dt>
          <dd className="m-0">{v}</dd>
        </div>
      ))}
      <div className="flex gap-[1vh]">
        <dt className="w-[5ch] shrink-0 text-accent/50">STAT</dt>
        <dd className="m-0 flex items-center gap-2">
          <span aria-hidden className="inline-block h-[0.9vh] w-[0.9vh] rounded-full bg-accent animate-[pulse-dot_2s_ease-in-out_infinite]" />
          ONLINE
        </dd>
      </div>
    </dl>
  );
}
```

- [ ] **Step 5: Implement `components/panels/SkillsPanel.tsx`**

Deterministic meters (spec §6): hash the skill name → 70–95%.

```tsx
import { content } from "@/lib/content";

function level(name: string): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 70 + (h % 26); // 70–95
}

const SEGMENTS = 10;

export function SkillsPanel() {
  return (
    <div className="flex flex-col gap-[0.8vh]">
      {content.skills.map((group) => (
        <div key={group.label}>
          <div className="mb-[0.3vh] font-display text-[max(1.1vh,10px)] font-bold uppercase tracking-[0.2em] text-accent/60">
            {group.label}
          </div>
          <ul className="m-0 flex list-none flex-col gap-[0.25vh] p-0 font-term text-[max(1.15vh,10px)]">
            {group.skills.map((skill) => {
              const lit = Math.round((level(skill) / 100) * SEGMENTS);
              return (
                <li key={skill} className="flex items-center justify-between gap-[1vh]">
                  <span>{skill}</span>
                  <span
                    className="flex gap-[2px]"
                    role="meter"
                    aria-valuenow={level(skill)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${skill} proficiency`}
                  >
                    {Array.from({ length: SEGMENTS }, (_, i) => (
                      <span
                        key={i}
                        aria-hidden
                        className={`inline-block h-[1vh] w-[0.45vh] min-h-[7px] min-w-[3px] ${
                          i < lit ? "bg-accent" : "bg-accent/20"
                        }`}
                      />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Swap into `app/page.tsx`**

```tsx
import { ClockPanel } from "@/components/panels/ClockPanel";
import { OperatorPanel } from "@/components/panels/OperatorPanel";
import { SkillsPanel } from "@/components/panels/SkillsPanel";
// …
<Panel index={1} titleLeft="CLOCK" titleRight="LOCAL"><ClockPanel /></Panel>
<Panel index={3} titleLeft="OPERATOR" titleRight="ID"><OperatorPanel /></Panel>
<Panel index={5} titleLeft="SKILLS" titleRight="PROF"><SkillsPanel /></Panel>
```

- [ ] **Step 7: Full check + preview check**

Tests pass; preview: clock ticks with blinking colons; operator rows show real identity; every skill has a segmented meter (mostly-lit); left column no longer says STANDBY in those three slots.

- [ ] **Step 8: Commit**

```bash
git add components/panels tests/panels.test.tsx app/page.tsx
git commit -m "feat: clock, operator, skills panels"
```

---

### Task 11: ProcessPanel + MemoryPanel

**Files:**
- Create: `components/panels/ProcessPanel.tsx`, `components/panels/MemoryPanel.tsx`
- Modify: `app/page.tsx` (swap two Standbys)

**Interfaces:**
- Consumes: `content.projects` (file names), `useTicker`, `WidgetBoundary`.
- Produces: `<ProcessPanel />`, `<MemoryPanel />`.

- [ ] **Step 1: Implement `components/panels/ProcessPanel.tsx`**

eDEX mod_toplist flavor: fake process table from project files; CPU drifts.

```tsx
"use client";
import { useEffect, useState } from "react";
import { content } from "@/lib/content";

type Proc = { pid: number; name: string; cpu: number };

const seed: Proc[] = content.projects.map((p, i) => ({
  pid: 1000 + i * 137,
  name: p.file,
  cpu: 2 + ((i * 7) % 9),
}));

export function ProcessPanel() {
  const [procs, setProcs] = useState(seed);
  useEffect(() => {
    const id = setInterval(() => {
      setProcs((ps) =>
        ps.map((p) => ({
          ...p,
          cpu: Math.max(0.4, Math.min(24, p.cpu + (Math.random() - 0.5) * 4)),
        }))
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <table className="w-full border-collapse font-term text-[max(1.1vh,10px)] leading-relaxed">
      <thead>
        <tr className="text-left text-accent/50">
          <th className="font-normal">PID</th>
          <th className="font-normal">NAME</th>
          <th className="text-right font-normal">CPU%</th>
        </tr>
      </thead>
      <tbody suppressHydrationWarning>
        {procs.map((p) => (
          <tr key={p.pid}>
            <td className="text-accent/60">{p.pid}</td>
            <td>{p.name}</td>
            <td className="text-right tabular-nums">{p.cpu.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Implement `components/panels/MemoryPanel.tsx`**

eDEX mod_ramwatcher: dot-matrix canvas, lit ratio wanders 55–80% (spec §6).

```tsx
"use client";
import { useEffect, useRef } from "react";
import { useTicker } from "@/hooks/useTicker";

const COLS = 24;
const ROWS = 8;

export function MemoryPanel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cells = useRef<Float32Array>(new Float32Array(COLS * ROWS));
  const target = useRef(0.65);

  useEffect(() => {
    const c = cells.current;
    for (let i = 0; i < c.length; i++) c[i] = Math.random() < 0.65 ? 1 : 0;
  }, []);

  useTicker((dt, t) => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    target.current = 0.675 + Math.sin(t * 0.23) * 0.125; // wanders 55–80%
    const c = cells.current;
    // toggle a few random cells toward the target ratio each frame
    for (let n = 0; n < 3; n++) {
      const i = Math.floor(Math.random() * c.length);
      const lit = c.reduce((a, v) => a + (v > 0.5 ? 1 : 0), 0) / c.length;
      c[i] = lit < target.current ? 1 : 0;
    }

    const w = (el.width = el.clientWidth * devicePixelRatio);
    const h = (el.height = el.clientHeight * devicePixelRatio);
    const cw = w / COLS;
    const ch = h / ROWS;
    const style = getComputedStyle(document.documentElement);
    const rgb = `${style.getPropertyValue("--color-r")} ${style.getPropertyValue("--color-g")} ${style.getPropertyValue("--color-b")}`;
    ctx.clearRect(0, 0, w, h);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const v = c[y * COLS + x];
        ctx.fillStyle = `rgb(${rgb} / ${v > 0.5 ? 0.9 : 0.15})`;
        ctx.fillRect(x * cw + cw * 0.25, y * ch + ch * 0.25, cw * 0.5, ch * 0.5);
      }
    }
  });

  return (
    <div>
      <canvas ref={canvas} aria-hidden className="h-[7vh] min-h-[48px] w-full" />
      <div className="mt-[0.3vh] flex justify-between font-term text-[max(1vh,9px)] tracking-[0.2em] text-accent/50">
        <span>HEAP://SKILL_CACHE</span>
        <span className="sr-only">Decorative memory visualization</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Swap into `app/page.tsx`** (wrap canvas widget in boundary)

```tsx
import { ProcessPanel } from "@/components/panels/ProcessPanel";
import { MemoryPanel } from "@/components/panels/MemoryPanel";
import { WidgetBoundary } from "@/components/WidgetBoundary";
// …
<Panel index={7} titleLeft="PROC" titleRight="TOP"><ProcessPanel /></Panel>
<Panel index={9} titleLeft="MEM" titleRight="HEAP">
  <WidgetBoundary fallbackLabel="MEM OFFLINE"><MemoryPanel /></WidgetBoundary>
</Panel>
```

- [ ] **Step 4: Full check + preview check**

Process table lists the five project files with drifting CPU numbers; dot matrix shimmers; switch theme → dots recolor live (they read CSS vars each frame). Hide the tab 5s, return — no burst of queued animation (ticker paused).

- [ ] **Step 5: Commit**

```bash
git add components/panels/ProcessPanel.tsx components/panels/MemoryPanel.tsx app/page.tsx
git commit -m "feat: process toplist and dot-matrix memory panels"
```

---

## Phase 4 — Right column (PANEL // NETWORK)

### Task 12: `lib/geo.ts` — continents as polygons → dotted-globe points

**Files:**
- Create: `lib/geo.ts`
- Test: `tests/geo.test.ts`

**Interfaces:**
- Produces:

```ts
export const WORLD_POINTS: [number, number][]; // [lat, lng] land points, ~800–2000
export const CITIES: { name: string; lat: number; lng: number }[]; // LA first
export const LA: { lat: number; lng: number };
```

- [ ] **Step 1: Write failing test — `tests/geo.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { WORLD_POINTS, CITIES, LA } from "../lib/geo";

describe("geo dataset (spec §6 GlobePanel)", () => {
  it("has a sane land point count", () => {
    expect(WORLD_POINTS.length).toBeGreaterThan(800);
    expect(WORLD_POINTS.length).toBeLessThan(2400);
  });
  it("covers Los Angeles but not the mid-Pacific", () => {
    const near = (lat: number, lng: number, d = 4) =>
      WORLD_POINTS.some(([a, o]) => Math.abs(a - lat) < d && Math.abs(o - lng) < d);
    expect(near(34, -118)).toBe(true);   // LA on land
    expect(near(0, -140, 6)).toBe(false); // open Pacific empty
    expect(near(-25, 135)).toBe(true);   // Australia
    expect(near(10, 20)).toBe(true);     // Africa
  });
  it("lists LA as the home city", () => {
    expect(CITIES[0].name).toBe("Los Angeles");
    expect(LA.lat).toBeCloseTo(34.05, 1);
  });
});
```

- [ ] **Step 2: Run to verify failure** — module missing.

- [ ] **Step 3: Implement `lib/geo.ts`**

Continent outlines as coarse polygons (original, hand-authored — dotted-globe fidelity only), ray-cast point-in-polygon, sampled on a cos-corrected grid. **Do not** use eDEX's `grid.json` (GPL).

```ts
// [lat, lng] vertex rings. Coarse on purpose — rendered as ~2px dots on a small sphere.
const CONTINENTS: [number, number][][] = [
  // North America
  [[70,-165],[72,-130],[70,-95],[64,-78],[58,-62],[48,-55],[40,-74],[32,-80],[26,-80],[29,-90],[26,-97],[20,-97],[21,-89],[14,-87],[8,-80],[10,-85],[17,-101],[23,-110],[28,-115],[34,-120],[40,-124],[48,-125],[57,-135],[60,-150],[58,-158],[65,-166]],
  // Greenland
  [[83,-40],[81,-20],[75,-20],[68,-25],[60,-43],[65,-53],[76,-58],[80,-55]],
  // South America
  [[12,-72],[5,-52],[-5,-35],[-15,-39],[-25,-48],[-35,-57],[-41,-63],[-50,-68],[-55,-70],[-50,-74],[-37,-73],[-18,-70],[-5,-81],[2,-78],[8,-77]],
  // Africa
  [[35,-6],[37,10],[31,20],[31,32],[27,34],[15,40],[11,44],[11,51],[0,42],[-5,39],[-15,40],[-26,33],[-34,20],[-30,17],[-15,12],[-5,9],[4,9],[5,-5],[7,-13],[15,-17],[21,-17],[28,-13],[32,-9]],
  // Eurasia
  [[38,-9],[43,-8],[47,-2],[51,3],[54,8],[58,5],[63,10],[70,25],[73,60],[76,105],[72,140],[66,178],[62,163],[52,157],[59,142],[45,135],[35,127],[30,121],[23,114],[10,107],[2,103],[13,100],[16,95],[22,91],[13,80],[8,77],[19,72],[24,67],[25,60],[22,59],[13,45],[15,42],[28,34],[36,36],[36,28],[39,23],[42,16],[44,9],[43,4],[39,0],[36,-5]],
  // UK
  [[58,-5],[53,0],[51,1],[50,-5],[54,-4]],
  // Japan
  [[44,142],[41,140],[35,140],[33,131],[38,138]],
  // Sumatra/Java arc
  [[5,96],[-4,102],[-8,114],[-9,119],[-6,107],[1,99]],
  // Borneo
  [[5,110],[0,117],[-3,112],[2,109]],
  // New Guinea
  [[-2,132],[-4,141],[-8,147],[-6,138]],
  // Australia
  [[-11,132],[-12,137],[-17,140],[-11,142],[-19,146],[-27,153],[-37,150],[-39,146],[-35,138],[-32,133],[-33,124],[-33,115],[-26,113],[-20,119],[-18,122],[-14,126]],
  // Antarctica (ring closed through the pole)
  [[-70,-180],[-72,-150],[-68,-120],[-73,-90],[-70,-60],[-69,-30],[-71,0],[-68,30],[-70,60],[-67,90],[-71,120],[-69,150],[-70,180],[-90,180],[-90,-180]],
];

function inRing(lat: number, lng: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i];
    const [yj, xj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function isLand(lat: number, lng: number): boolean {
  return CONTINENTS.some((ring) => inRing(lat, lng, ring));
}

function buildPoints(): [number, number][] {
  const pts: [number, number][] = [];
  for (let lat = -85; lat <= 85; lat += 3) {
    const step = 3 / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
    for (let lng = -180; lng < 180; lng += step) {
      if (isLand(lat, lng)) pts.push([lat, Math.round(lng * 100) / 100]);
    }
  }
  return pts;
}

export const WORLD_POINTS: [number, number][] = buildPoints();

export const LA = { lat: 34.05, lng: -118.24 };

export const CITIES = [
  { name: "Los Angeles", ...LA },
  { name: "New York", lat: 40.71, lng: -74.01 },
  { name: "London", lat: 51.51, lng: -0.13 },
  { name: "Tokyo", lat: 35.68, lng: 139.69 },
  { name: "Sydney", lat: -33.87, lng: 151.21 },
  { name: "São Paulo", lat: -23.55, lng: -46.63 },
  { name: "Berlin", lat: 52.52, lng: 13.41 },
  { name: "Singapore", lat: 1.35, lng: 103.82 },
  { name: "San Diego", lat: 32.72, lng: -117.16 },
];
```

- [ ] **Step 4: Run tests** — PASS. If the LA assertion fails, the North America west-coast polygon edge is off: nudge the `[34,-120]`/`[28,-115]` vertices west by 2° and re-run.

- [ ] **Step 5: Commit**

```bash
git add lib/geo.ts tests/geo.test.ts
git commit -m "feat: hand-authored continent polygons and dotted-globe point dataset"
```

---

### Task 13: GlobePanel — rotating dotted Earth with arcs

**Files:**
- Create: `components/panels/GlobePanel.tsx`
- Modify: `app/page.tsx` (swap Standby, wrap in `WidgetBoundary`)

**Interfaces:**
- Consumes: `WORLD_POINTS`, `CITIES`, `LA`, `useTicker`, `useReducedMotion`.
- Produces: `<GlobePanel />`.

- [ ] **Step 1: Implement `components/panels/GlobePanel.tsx`**

Orthographic projection: lat/lng → unit sphere → rotate around Y by `t*0.15` → draw points with `z > 0`. Arcs: slerp between city vectors, animated head with fading trail, new arc every ~5s from/to LA.

```tsx
"use client";
import { useRef } from "react";
import { useTicker } from "@/hooks/useTicker";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { WORLD_POINTS, CITIES, LA } from "@/lib/geo";
import { content } from "@/lib/content";

type V3 = { x: number; y: number; z: number };

function toV3(lat: number, lng: number): V3 {
  const la = (lat * Math.PI) / 180;
  const lo = (lng * Math.PI) / 180;
  return { x: Math.cos(la) * Math.cos(lo), y: Math.sin(la), z: Math.cos(la) * Math.sin(lo) };
}
function rotY(v: V3, a: number): V3 {
  return { x: v.x * Math.cos(a) + v.z * Math.sin(a), y: v.y, z: -v.x * Math.sin(a) + v.z * Math.cos(a) };
}
function slerp(a: V3, b: V3, t: number): V3 {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const th = Math.acos(dot) || 0.0001;
  const s = Math.sin(th);
  const p = Math.sin((1 - t) * th) / s;
  const q = Math.sin(t * th) / s;
  return { x: a.x * p + b.x * q, y: a.y * p + b.y * q, z: a.z * p + b.z * q };
}

const SPHERE = WORLD_POINTS.map(([lat, lng]) => toV3(lat, lng));
const LA_V = toV3(LA.lat, LA.lng);

export function GlobePanel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const arc = useRef({ to: toV3(CITIES[1].lat, CITIES[1].lng), start: 0 });

  useTicker((_dt, t) => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const dpr = devicePixelRatio || 1;
    const w = (el.width = el.clientWidth * dpr);
    const h = (el.height = el.clientHeight * dpr);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.42;
    const a = reduced ? 0.6 : t * 0.15;

    const style = getComputedStyle(document.documentElement);
    const rgb = `${style.getPropertyValue("--color-r")} ${style.getPropertyValue("--color-g")} ${style.getPropertyValue("--color-b")}`;

    ctx.clearRect(0, 0, w, h);
    // sphere outline
    ctx.strokeStyle = `rgb(${rgb} / 0.25)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    // land dots
    for (const v of SPHERE) {
      const r = rotY(v, a);
      if (r.z <= 0) continue;
      ctx.fillStyle = `rgb(${rgb} / ${0.25 + r.z * 0.65})`;
      ctx.fillRect(cx + r.x * R, cy - r.y * R, Math.max(1.2, dpr), Math.max(1.2, dpr));
    }
    // LA marker
    const laR = rotY(LA_V, a);
    if (laR.z > 0) {
      const px = cx + laR.x * R;
      const py = cy - laR.y * R;
      const pulse = 2 + Math.sin(t * 4) * 1.5;
      ctx.strokeStyle = `rgb(${rgb} / 0.9)`;
      ctx.beginPath();
      ctx.arc(px, py, (3 + pulse) * dpr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.beginPath();
      ctx.arc(px, py, 2 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    // arc: LA → city, 3s flight, retarget every 5s
    if (!reduced) {
      if (t - arc.current.start > 5) {
        const city = CITIES[1 + Math.floor(Math.random() * (CITIES.length - 1))];
        arc.current = { to: toV3(city.lat, city.lng), start: t };
      }
      const prog = Math.min((t - arc.current.start) / 3, 1);
      ctx.strokeStyle = `rgb(${rgb} / 0.7)`;
      ctx.beginPath();
      let started = false;
      for (let s = 0; s <= prog; s += 0.02) {
        const p = slerp(LA_V, arc.current.to, s);
        const lift = 1 + Math.sin(s * Math.PI) * 0.18; // altitude bulge
        const r = rotY({ x: p.x * lift, y: p.y * lift, z: p.z * lift }, a);
        if (r.z <= 0) { started = false; continue; }
        const px = cx + r.x * R;
        const py = cy - r.y * R;
        if (started) ctx.lineTo(px, py);
        else { ctx.moveTo(px, py); started = true; }
      }
      ctx.stroke();
    }
  });

  return (
    <div className="relative">
      <canvas ref={canvas} aria-hidden className="aspect-square w-full" />
      <span className="sr-only">Rotating globe marking {content.identity.location}</span>
      <div className="mt-[0.2vh] text-center font-term text-[max(1vh,9px)] tracking-[0.25em] text-accent/50">
        GEO://34.05N 118.24W
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Swap into `app/page.tsx`**

```tsx
import { GlobePanel } from "@/components/panels/GlobePanel";
// …
<Panel index={2} titleLeft="WORLD" titleRight="GEO">
  <WidgetBoundary fallbackLabel="GLOBE OFFLINE"><GlobePanel /></WidgetBoundary>
</Panel>
```

- [ ] **Step 3: Full check + preview check (hard visual gate)**

Screenshot the globe. **Continents must be recognizable** (Americas, Africa/Eurasia mass, Australia). If land looks scrambled: check rotation math (lng sign) before touching polygons. LA marker pulses on the US west coast; an arc fires ~every 5s toward another city; theme switch recolors globe next frame.

- [ ] **Step 4: Commit**

```bash
git add components/panels/GlobePanel.tsx app/page.tsx
git commit -m "feat: hand-rolled orthographic dotted globe with LA marker and arcs"
```

---

### Task 14: ContactPanel, NetStatusPanel, ActivityPanel

**Files:**
- Create: `components/panels/ContactPanel.tsx`, `components/panels/NetStatusPanel.tsx`, `components/panels/ActivityPanel.tsx`
- Modify: `app/page.tsx` (swap three Standbys)
- Test: append to `tests/panels.test.tsx`

**Interfaces:**
- Consumes: `content.contact`, `content.resumeUrl`, `useTicker`.
- Produces: `<ContactPanel />`, `<NetStatusPanel />`, `<ActivityPanel />`.

- [ ] **Step 1: Append failing test to `tests/panels.test.tsx`**

```tsx
import { ContactPanel } from "../components/panels/ContactPanel";

describe("ContactPanel", () => {
  it("renders every uplink as a real link", () => {
    render(<ContactPanel />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("mailto:jamal.bhola@gmail.com");
    expect(hrefs).toContain("https://github.com/jamalbhola");
    expect(hrefs).toContain("https://linkedin.com/in/jamalbhola");
    expect(hrefs).toContain("https://twitter.com/jambho");
    expect(hrefs).toContain("/Jamal_Bhola_resume.pdf");
  });
});
```

- [ ] **Step 2: Run to verify failure**, then implement `components/panels/ContactPanel.tsx`

Server component — real anchors (SEO + a11y).

```tsx
import { content } from "@/lib/content";

const uplinks = [
  { label: "EMAIL", href: `mailto:${content.contact.email}` },
  ...content.contact.links.map((l) => ({ label: l.label, href: l.href })),
  { label: "RESUME.PDF", href: content.resumeUrl },
];

export function ContactPanel() {
  return (
    <ul className="m-0 flex list-none flex-col gap-[0.45vh] p-0 font-term text-[max(1.2vh,11px)]">
      {uplinks.map((u) => (
        <li key={u.label}>
          <a
            href={u.href}
            target={u.href.startsWith("/") || u.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="group flex items-baseline justify-between gap-[1vh] text-accent no-underline hover:bg-accent/10"
          >
            <span>
              <span className="text-accent/50 transition-transform group-hover:translate-x-[2px]">▸ </span>
              {u.label}
            </span>
            <span className="text-[max(1vh,9px)] tracking-[0.15em] text-accent/40 group-hover:text-accent/80 group-hover:animate-[flicker-in_180ms_linear]">
              ESTABLISHED
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Implement `components/panels/NetStatusPanel.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { content } from "@/lib/content";

export function NetStatusPanel() {
  const [uptime, setUptime] = useState(0);
  const [ping, setPing] = useState(12);
  useEffect(() => {
    const id = setInterval(() => {
      setUptime((u) => u + 1);
      setPing(10 + Math.round(Math.random() * 6));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(uptime / 3600)).padStart(2, "0");
  const mm = String(Math.floor((uptime % 3600) / 60)).padStart(2, "0");
  const ss = String(uptime % 60).padStart(2, "0");

  const rows: [string, string][] = [
    ["LOC", content.contact.location],
    ["UPTIME", `${hh}:${mm}:${ss}`],
    ["LATENCY", `${ping}ms`],
    ["MODE", "OPEN_TO_WORK"],
  ];
  return (
    <dl className="m-0 flex flex-col gap-[0.45vh] font-term text-[max(1.2vh,11px)]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-[1vh]">
          <dt className="text-accent/50">{k}</dt>
          <dd suppressHydrationWarning className="m-0 tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 4: Implement `components/panels/ActivityPanel.tsx`**

dex-ui spikeGraph: scrolling spikes from a smoothed random walk.

```tsx
"use client";
import { useRef } from "react";
import { useTicker } from "@/hooks/useTicker";

const N = 64;

export function ActivityPanel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const values = useRef<number[]>(Array.from({ length: N }, () => 0.2));
  const acc = useRef(0);

  useTicker((dt) => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    acc.current += dt;
    if (acc.current > 0.1) {
      acc.current = 0;
      const v = values.current;
      const last = v[v.length - 1];
      const next = Math.max(0.05, Math.min(1, last + (Math.random() - 0.48) * 0.3));
      v.push(Math.random() < 0.06 ? Math.min(1, next + 0.5) : next); // occasional spike
      v.shift();
    }
    const dpr = devicePixelRatio || 1;
    const w = (el.width = el.clientWidth * dpr);
    const h = (el.height = el.clientHeight * dpr);
    const style = getComputedStyle(document.documentElement);
    const rgb = `${style.getPropertyValue("--color-r")} ${style.getPropertyValue("--color-g")} ${style.getPropertyValue("--color-b")}`;
    ctx.clearRect(0, 0, w, h);
    const bw = w / N;
    for (let i = 0; i < N; i++) {
      const v = values.current[i];
      ctx.fillStyle = `rgb(${rgb} / ${0.3 + v * 0.6})`;
      ctx.fillRect(i * bw, h - v * h, Math.max(1, bw - dpr), v * h);
    }
    ctx.strokeStyle = `rgb(${rgb} / 0.3)`;
    ctx.strokeRect(0, 0, w, h);
  });

  return (
    <div>
      <canvas ref={canvas} aria-hidden className="h-[6vh] min-h-[40px] w-full" />
      <div className="mt-[0.3vh] font-term text-[max(1vh,9px)] tracking-[0.25em] text-accent/50">
        NET://TRAFFIC
        <span className="sr-only">Decorative network activity graph</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Swap into `app/page.tsx`**

```tsx
import { ContactPanel } from "@/components/panels/ContactPanel";
import { NetStatusPanel } from "@/components/panels/NetStatusPanel";
import { ActivityPanel } from "@/components/panels/ActivityPanel";
// …
<Panel index={4} titleLeft="UPLINKS" titleRight="CONN"><ContactPanel /></Panel>
<Panel index={6} titleLeft="NETSTAT" titleRight="LIVE"><NetStatusPanel /></Panel>
<Panel index={8} titleLeft="TRAFFIC" titleRight="NET">
  <WidgetBoundary fallbackLabel="NET OFFLINE"><ActivityPanel /></WidgetBoundary>
</Panel>
```

- [ ] **Step 6: Full check + preview check**

All uplinks clickable (email opens mail client, socials new tab, resume opens PDF); uptime counts; spikes scroll. **No STANDBY remains in either column.**

- [ ] **Step 7: Commit**

```bash
git add components/panels tests/panels.test.tsx app/page.tsx
git commit -m "feat: contact uplinks, net status, traffic spike graph"
```

---

## Phase 5 — Terminal (center stage)

### Task 15: Event bus + command registry (pure logic, fully tested)

**Files:**
- Create: `lib/bus.ts`, `lib/terminal/commands.ts`
- Test: `tests/commands.test.ts`

**Interfaces:**
- Produces (exact — Tasks 16–20 import these):

```ts
// lib/bus.ts
export type TabId = "about" | "projects" | "contact" | "shell";
export function emit(name: "openProject", detail: number): void;
export function emit(name: "setTab", detail: TabId): void;
export function emit(name: "matrix"): void;
export function onBus(name: "openProject", cb: (n: number) => void): () => void;
export function onBus(name: "setTab", cb: (t: TabId) => void): () => void;
export function onBus(name: "matrix", cb: () => void): () => void;

// lib/terminal/commands.ts
export type TermLine = { text: string; kind?: "out" | "ok" | "err" | "dim" | "head"; href?: string };
export type TermAction =
  | { type: "tab"; tab: TabId }
  | { type: "openProject"; index: number }   // 0-based
  | { type: "theme"; theme: ThemeName }
  | { type: "matrix" } | { type: "clear" }
  | { type: "sound" } | { type: "fx" } | { type: "resume" };
export type CmdResult = { lines: TermLine[]; actions?: TermAction[] };
export const PROMPT = "visitor@jamal-bhola:~$";
export function runCommand(input: string): CmdResult;
```

- [ ] **Step 1: Write failing tests — `tests/commands.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { runCommand } from "../lib/terminal/commands";

const text = (r: { lines: { text: string }[] }) => r.lines.map((l) => l.text).join("\n");

describe("terminal commands (spec §6 ShellTab)", () => {
  it("help lists every command", () => {
    const out = text(runCommand("help"));
    for (const c of ["about", "projects", "open", "contact", "resume", "theme", "sound", "fx", "clear", "whoami", "neofetch", "matrix"]) {
      expect(out).toContain(c);
    }
  });
  it("about prints preserved identity copy", () => {
    const out = text(runCommand("about"));
    expect(out).toContain("Jamal Bhola");
    expect(out).toContain("Software Engineer & Web Developer");
    expect(out).toContain("San Diego State University");
  });
  it("projects lists all five titles", () => {
    const out = text(runCommand("projects"));
    expect(out).toContain("Discord AI Voice Cloning Bot");
    expect(out).toContain("Portfolio Website");
  });
  it("open 2 emits a 0-based openProject action", () => {
    const r = runCommand("open 2");
    expect(r.actions).toContainEqual({ type: "openProject", index: 1 });
  });
  it("open 99 errors", () => {
    const r = runCommand("open 99");
    expect(r.lines.some((l) => l.kind === "err")).toBe(true);
  });
  it("theme matrix acts; theme bogus errors and lists themes", () => {
    expect(runCommand("theme matrix").actions).toContainEqual({ type: "theme", theme: "matrix" });
    const bad = text(runCommand("theme bogus"));
    expect(bad).toContain("tron");
    expect(bad).toContain("interstellar");
  });
  it("sudo is denied", () => {
    const r = runCommand("sudo rm -rf /");
    expect(r.lines.some((l) => l.kind === "err" && /denied/i.test(l.text))).toBe(true);
  });
  it("unknown command suggests help", () => {
    const out = text(runCommand("frobnicate"));
    expect(out).toContain("help");
  });
  it("contact prints the email", () => {
    expect(text(runCommand("contact"))).toContain("jamal.bhola@gmail.com");
  });
  it("clear returns a clear action", () => {
    expect(runCommand("clear").actions).toContainEqual({ type: "clear" });
  });
  it("cat about.md works, cat resume.pdf refuses", () => {
    expect(text(runCommand("cat about.md"))).toContain("Jamal");
    expect(text(runCommand("cat resume.pdf"))).toMatch(/binary/i);
  });
});
```

- [ ] **Step 2: Run to verify failure**, then implement `lib/bus.ts`

```ts
"use client";

type Handler = (detail?: unknown) => void;
const PREFIX = "jb:";

export type TabId = "about" | "projects" | "contact" | "shell";

export function emit(name: "openProject", detail: number): void;
export function emit(name: "setTab", detail: TabId): void;
export function emit(name: "matrix"): void;
export function emit(name: string, detail?: unknown): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PREFIX + name, { detail }));
}

export function onBus(name: "openProject", cb: (n: number) => void): () => void;
export function onBus(name: "setTab", cb: (t: TabId) => void): () => void;
export function onBus(name: "matrix", cb: () => void): () => void;
export function onBus(name: string, cb: Handler): () => void {
  if (typeof window === "undefined") return () => {};
  const h = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener(PREFIX + name, h);
  return () => window.removeEventListener(PREFIX + name, h);
}
```

- [ ] **Step 3: Implement `lib/terminal/commands.ts`**

```ts
import { content } from "../content";
import { THEME_NAMES, isTheme, type ThemeName } from "../themes";
import type { TabId } from "../bus";

export type TermLine = { text: string; kind?: "out" | "ok" | "err" | "dim" | "head"; href?: string };
export type TermAction =
  | { type: "tab"; tab: TabId }
  | { type: "openProject"; index: number }
  | { type: "theme"; theme: ThemeName }
  | { type: "matrix" }
  | { type: "clear" }
  | { type: "sound" }
  | { type: "fx" }
  | { type: "resume" };
export type CmdResult = { lines: TermLine[]; actions?: TermAction[] };

export const PROMPT = "visitor@jamal-bhola:~$";

const t = (text: string, kind?: TermLine["kind"]): TermLine => ({ text, kind });

const FILES = ["about.md", "contact.sh", "resume.pdf", ...content.projects.map((p) => p.file)];

function aboutLines(): TermLine[] {
  return [
    t(`# ${content.identity.name}`, "head"),
    t(content.identity.tagline, "ok"),
    t(""),
    t(content.identity.schoolLine),
    t(content.identity.specialization),
    t(""),
    t(`EDUCATION  ${content.about.education[0].degree} — ${content.about.education[0].school}`),
    t(`SPECIALTY  ${content.about.specialization}`),
    t(`FOCUS      ${content.about.focusAreas}`),
    t(""),
    ...content.skills.map((g) => t(`${g.label.toUpperCase().padEnd(9)} ${g.skills.join(", ")}`, "dim")),
  ];
}

function projectLines(): TermLine[] {
  const rows = content.projects.map((p, i) =>
    t(`${String(i + 1).padStart(2)}  ${p.file.padEnd(18)} ${p.status.padEnd(12)} ${p.date}`)
  );
  return [
    t(`total ${content.projects.length}`, "dim"),
    ...rows,
    t(""),
    ...content.projects.map((p, i) => t(`    [${i + 1}] ${p.title}`, "dim")),
    t(""),
    t(`hint: open <n> for full dossier · resume for the PDF`, "dim"),
  ];
}

function contactLines(): TermLine[] {
  return [
    t(content.contact.cta, "ok"),
    t(""),
    t(`EMAIL     ${content.contact.email}`),
    ...content.contact.links.map((l) => t(`${l.label.padEnd(9)} ${l.href}`)),
    t(`LOCATION  ${content.contact.location}`),
    t(""),
    t(`PING jamal.bhola (${content.contact.location}): 32 bytes, time=0.4ms — reachable.`, "dim"),
  ];
}

const NEOFETCH = [
  "     ██╗██████╗ ",
  "     ██║██╔══██╗",
  "     ██║██████╔╝",
  "██   ██║██╔══██╗",
  "╚█████╔╝██████╔╝",
  " ╚════╝ ╚═════╝ ",
];

function neofetchLines(): TermLine[] {
  const info = [
    `${content.identity.name}@portfolio`,
    "----------------------",
    `OS: JB-OS v2.0 (web)`,
    `Host: ${content.identity.school}`,
    `Kernel: next-15.5 / react-19`,
    `Shell: /bin/visitor`,
    `Theme: run \`theme\` to change`,
    `Uptime: since December 2024`,
  ];
  const n = Math.max(NEOFETCH.length, info.length);
  return Array.from({ length: n }, (_, i) =>
    t(`${NEOFETCH[i] ?? " ".repeat(16)}  ${info[i] ?? ""}`, i === 0 ? "ok" : "out")
  );
}

const HELP: [string, string][] = [
  ["help", "this list"],
  ["about", "operator dossier (cat about.md)"],
  ["projects", "list project archive (ls)"],
  ["open <n>", "open project dossier n"],
  ["contact", "uplink directory (./contact.sh)"],
  ["resume", "open resume.pdf"],
  ["theme <name>", `switch theme: ${THEME_NAMES.join(" | ")}`],
  ["sound", "toggle sfx"],
  ["fx", "toggle scanlines"],
  ["neofetch", "system info"],
  ["whoami", "who are you?"],
  ["matrix", "?"],
  ["clear", "clear terminal"],
];

export function runCommand(raw: string): CmdResult {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const [cmd, ...args] = input.split(/\s+/);

  switch (cmd.toLowerCase()) {
    case "help":
      return {
        lines: [
          t("JB-OS shell — available programs:", "head"),
          ...HELP.map(([c, d]) => t(`  ${c.padEnd(14)} ${d}`)),
        ],
      };
    case "about":
      return { lines: aboutLines() };
    case "ls":
    case "projects":
      return { lines: projectLines() };
    case "open": {
      const n = Number(args[0]);
      if (!Number.isInteger(n) || n < 1 || n > content.projects.length) {
        return { lines: [t(`open: expected 1-${content.projects.length}, got "${args[0] ?? ""}"`, "err")] };
      }
      return {
        lines: [t(`decrypting dossier ${content.projects[n - 1].file} ... OK`, "ok")],
        actions: [{ type: "openProject", index: n - 1 }],
      };
    }
    case "contact":
      return { lines: contactLines() };
    case "resume":
      return { lines: [t("opening resume.pdf ...", "ok")], actions: [{ type: "resume" }] };
    case "cat": {
      const f = args[0] ?? "";
      if (f === "about.md") return { lines: aboutLines() };
      if (f === "contact.sh") return { lines: contactLines() };
      if (f === "resume.pdf") return { lines: [t("cat: resume.pdf: binary file — try `resume`", "err")] };
      const proj = content.projects.findIndex((p) => p.file === f);
      if (proj >= 0) return { lines: [t(`use \`open ${proj + 1}\` for the full dossier`, "dim")] };
      return { lines: [t(`cat: ${f}: no such file`, "err")] };
    }
    case "theme": {
      const name = (args[0] ?? "").toLowerCase();
      if (isTheme(name)) {
        return { lines: [t(`theme set: ${name}`, "ok")], actions: [{ type: "theme", theme: name }] };
      }
      return { lines: [t(`theme: unknown "${args[0] ?? ""}" — themes: ${THEME_NAMES.join(", ")}`, "err")] };
    }
    case "sound":
      return { lines: [t("toggling sfx", "ok")], actions: [{ type: "sound" }] };
    case "fx":
      return { lines: [t("toggling scanlines", "ok")], actions: [{ type: "fx" }] };
    case "whoami":
      return { lines: [t("visitor — but the operator is:"), ...aboutLines().slice(0, 2)] };
    case "neofetch":
      return { lines: neofetchLines() };
    case "matrix":
      return { lines: [t("wake up...", "ok")], actions: [{ type: "matrix" }] };
    case "sudo":
      return { lines: [t("sudo: permission denied — this incident will be reported to nobody.", "err")] };
    case "exit":
      return { lines: [t("nice try. there is no escape from the portfolio.", "dim")] };
    case "clear":
      return { lines: [], actions: [{ type: "clear" }] };
    default:
      return { lines: [t(`${cmd}: command not found — try \`help\``, "err")] };
  }
}
```

Note: `ls` output includes hidden hint lines; keep `projects` and `ls` identical (aliases).

- [ ] **Step 4: Run tests** — all command tests PASS. Full check.

- [ ] **Step 5: Commit**

```bash
git add lib/bus.ts lib/terminal/commands.ts tests/commands.test.ts
git commit -m "feat: typed event bus and fully-tested terminal command registry"
```

---

### Task 16: TerminalPanel + trapezoid TabBar with hash sync

**Files:**
- Create: `components/terminal/TerminalPanel.tsx`, `components/terminal/TabBar.tsx`
- Modify: `app/globals.css` (append tab skew classes), `app/page.tsx` (swap terminal Standby)

**Interfaces:**
- Produces: `<TerminalPanel about={<AboutTab/>} projects={…} contact={…} shell={…} />` — but Tasks 17–18 build those tabs, so this task renders temporary `<div>SECTION LOADING</div>` placeholders **inside page.tsx props**, swapped next tasks.
- Consumes: `TabId`, `onBus`/`emit` (Task 15).

- [ ] **Step 1: Append to `app/globals.css`**

```css
/* eDEX trapezoid tabs (reference analysis §1.3) */
.tab-skew { transform: skewX(35deg); }
.tab-skew > * { transform: skewX(-35deg); }
```

- [ ] **Step 2: Implement `components/terminal/TabBar.tsx`**

```tsx
"use client";
import type { TabId } from "@/lib/bus";

const TABS: { id: TabId; label: string }[] = [
  { id: "about", label: "ABOUT" },
  { id: "projects", label: "PROJECTS" },
  { id: "contact", label: "CONTACT" },
  { id: "shell", label: "SHELL" },
];

export function TabBar({ active, onSelect }: { active: TabId; onSelect: (t: TabId) => void }) {
  return (
    <ul
      role="tablist"
      aria-label="Terminal sections"
      className="m-0 flex list-none overflow-hidden border-b-2 border-accent/50 p-0 px-[2vh]"
      onKeyDown={(e) => {
        const i = TABS.findIndex((t) => t.id === active);
        if (e.key === "ArrowRight") onSelect(TABS[(i + 1) % TABS.length].id);
        if (e.key === "ArrowLeft") onSelect(TABS[(i + TABS.length - 1) % TABS.length].id);
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <li key={tab.id} className="flex-1">
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              className={`tab-skew block w-full cursor-pointer border-0 border-l border-accent/30 py-[0.6vh] text-center font-display text-[max(1.3vh,11px)] font-bold uppercase tracking-[0.15em] transition-transform first:border-l-0 ${
                isActive ? "z-10 scale-110 bg-accent text-panel" : "bg-panel/80 text-accent/70 hover:text-accent"
              }`}
            >
              <span className="block">{tab.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 3: Implement `components/terminal/TerminalPanel.tsx`**

```tsx
"use client";
import { useEffect, useState, type ReactNode } from "react";
import { TabBar } from "./TabBar";
import { onBus, type TabId } from "@/lib/bus";
import { sfx } from "@/lib/audio";

const VALID: TabId[] = ["about", "projects", "contact", "shell"];

function tabFromHash(): TabId {
  if (typeof window === "undefined") return "about";
  const h = window.location.hash.replace("#", "");
  return (VALID as string[]).includes(h) ? (h as TabId) : "about";
}

type Props = { about: ReactNode; projects: ReactNode; contact: ReactNode; shell: ReactNode };

/** Center stage: trapezoid tabs + routed tab panels, hash-synced (spec §6). */
export function TerminalPanel(props: Props) {
  const [active, setActive] = useState<TabId>("about");

  useEffect(() => {
    setActive(tabFromHash());
    const onHash = () => setActive(tabFromHash());
    window.addEventListener("hashchange", onHash);
    const off = onBus("setTab", (t) => select(t));
    return () => {
      window.removeEventListener("hashchange", onHash);
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (t: TabId) => {
    setActive(t);
    try {
      history.replaceState(null, "", `#${t}`);
    } catch {}
    sfx.init();
    sfx.play("panel");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TabBar active={active} onSelect={select} />
      {VALID.map((id) => (
        <div
          key={id}
          role="tabpanel"
          id={`tabpanel-${id}`}
          hidden={active !== id}
          className="min-h-0 flex-1 overflow-y-auto p-[1vh] font-term text-[max(1.5vh,13px)] leading-[1.5]"
        >
          {props[id]}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Swap into `app/page.tsx`**

```tsx
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
// … replace the terminal Panel body:
<Panel index={0} titleLeft="TERMINAL" titleRight="MAIN SHELL" aug="bl-clip tr-clip border" className="min-h-[40vh]">
  <div id="terminal" className="h-full">
    <TerminalPanel
      about={<div>SECTION LOADING</div>}
      projects={<div>SECTION LOADING</div>}
      contact={<div>SECTION LOADING</div>}
      shell={<div>SECTION LOADING</div>}
    />
  </div>
</Panel>
```

- [ ] **Step 5: Full check + preview check**

Tabs render as slanted parallelograms; active = filled + slightly larger; click switches panels and updates `#hash`; visiting `/#contact` directly opens CONTACT; Left/Right arrows move tabs when focused. All four panes show SECTION LOADING.

- [ ] **Step 6: Commit**

```bash
git add components/terminal app/globals.css app/page.tsx
git commit -m "feat: terminal shell with trapezoid tab bar and hash routing"
```

---

### Task 17: AboutTab, ProjectsTab, ContactTab

**Files:**
- Create: `components/terminal/AboutTab.tsx`, `components/terminal/ProjectsTab.tsx`, `components/terminal/ContactTab.tsx`, `components/terminal/TermOutput.tsx`
- Modify: `app/page.tsx` (pass real tabs)

**Interfaces:**
- Produces: `<TermOutput lines={TermLine[]} typed?>` renderer shared by all tabs + shell.
- Consumes: `runCommand` output shapes (`aboutLines` etc. come through `runCommand("about"|"projects"|"contact")`), `useTypewriter`, `emit`.

- [ ] **Step 1: Implement `components/terminal/TermOutput.tsx`**

```tsx
import type { TermLine } from "@/lib/terminal/commands";

const KIND_CLASS: Record<NonNullable<TermLine["kind"]>, string> = {
  out: "",
  ok: "text-accent font-bold",
  err: "text-error",
  dim: "text-accent/50",
  head: "font-display text-[max(2vh,16px)] font-bold uppercase tracking-[0.1em]",
};

export function TermOutput({ lines }: { lines: TermLine[] }) {
  return (
    <div className="whitespace-pre-wrap break-words">
      {lines.map((l, i) => (
        <div key={i} className={l.kind ? KIND_CLASS[l.kind] : ""}>
          {l.text || " "}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Implement `components/terminal/AboutTab.tsx`**

Fake command header types on; body reveals when done. Server-renders full text under a client typewriter gate — to keep SEO text in HTML, render everything and only *animate* the reveal via CSS when motion allowed:

```tsx
"use client";
import { useMemo } from "react";
import { runCommand, PROMPT } from "@/lib/terminal/commands";
import { TermOutput } from "./TermOutput";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AboutTab() {
  const lines = useMemo(() => runCommand("about").lines, []);
  const reduced = useReducedMotion();
  const { out, done } = useTypewriter(reduced ? "" : "cat about.md", 25);

  return (
    <div>
      <div className="text-accent/60">
        <span className="text-accent/40">{PROMPT} </span>
        {reduced ? "cat about.md" : out}
        {!done && !reduced ? <span className="animate-[blink_1s_linear_infinite]">▊</span> : null}
      </div>
      <div className={done || reduced ? "animate-[fade-in_300ms_both]" : "invisible h-0 overflow-hidden"} aria-hidden={!(done || reduced)}>
        <TermOutput lines={lines} />
      </div>
      {/* Always-present crawlable copy of the text while animation gates visibility */}
      {!(done || reduced) ? <div className="sr-only"><TermOutput lines={lines} /></div> : null}
    </div>
  );
}
```

- [ ] **Step 3: Implement `components/terminal/ProjectsTab.tsx`**

```tsx
"use client";
import { content } from "@/lib/content";
import { emit } from "@/lib/bus";
import { PROMPT } from "@/lib/terminal/commands";

export function ProjectsTab() {
  return (
    <div>
      <div className="text-accent/60">
        <span className="text-accent/40">{PROMPT} </span>ls -la ./projects
      </div>
      <div className="text-accent/50">total {content.projects.length}</div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-accent/50">
            <th className="font-normal">#</th>
            <th className="font-normal">FILE</th>
            <th className="font-normal max-md:hidden">STATUS</th>
            <th className="font-normal max-md:hidden">DATE</th>
          </tr>
        </thead>
        <tbody>
          {content.projects.map((p, i) => (
            <tr
              key={p.id}
              className="cursor-pointer hover:bg-accent/10"
              onClick={() => emit("openProject", i)}
            >
              <td className="pr-2 text-accent/60">{i + 1}</td>
              <td className="pr-2">
                <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-term text-[inherit] text-accent underline-offset-4 hover:underline">
                  {p.file}
                </button>
                <span className="block text-accent/50">{p.title}</span>
              </td>
              <td className={`pr-2 max-md:hidden ${p.status === "Completed" ? "text-accent" : "text-warn"}`}>
                {p.status.toUpperCase().replace(" ", "_")}
              </td>
              <td className="text-accent/60 max-md:hidden">{p.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-[1vh] text-accent/50">hint: click a file — or switch to SHELL and `open <n>`</div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `components/terminal/ContactTab.tsx`**

```tsx
import { content } from "@/lib/content";
import { PROMPT } from "@/lib/terminal/commands";

const rows = [
  { label: "EMAIL", href: `mailto:${content.contact.email}`, text: content.contact.email },
  ...content.contact.links.map((l) => ({ label: l.label, href: l.href, text: l.href })),
  { label: "RESUME", href: content.resumeUrl, text: "Jamal_Bhola_resume.pdf" },
];

export function ContactTab() {
  return (
    <div>
      <div className="text-accent/60">
        <span className="text-accent/40">{PROMPT} </span>./contact.sh --list
      </div>
      <p className="my-[1vh] font-bold text-accent">{content.contact.cta}</p>
      <dl className="m-0">
        {rows.map((r) => (
          <div key={r.label} className="flex gap-[2vh]">
            <dt className="w-[9ch] shrink-0 text-accent/50">{r.label}</dt>
            <dd className="m-0">
              <a className="text-accent underline-offset-4 hover:underline" href={r.href}
                 target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                {r.text}
              </a>
            </dd>
          </div>
        ))}
        <div className="flex gap-[2vh]">
          <dt className="w-[9ch] shrink-0 text-accent/50">LOCATION</dt>
          <dd className="m-0">{content.contact.location}</dd>
        </div>
      </dl>
      <div className="mt-[1vh] text-accent/50">
        PING jamal.bhola ({content.contact.location}): 32 bytes, time=0.4ms — reachable.
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Pass real tabs in `app/page.tsx`**

```tsx
import { AboutTab } from "@/components/terminal/AboutTab";
import { ProjectsTab } from "@/components/terminal/ProjectsTab";
import { ContactTab } from "@/components/terminal/ContactTab";
// …
    <TerminalPanel
      about={<AboutTab />}
      projects={<ProjectsTab />}
      contact={<ContactTab />}
      shell={<div>SECTION LOADING</div>}
    />
```

- [ ] **Step 6: Full check + preview check**

ABOUT types `cat about.md` then reveals the dossier (instant under reduced motion); PROJECTS table lists 5 rows (click does nothing visible yet — modal comes in Task 19; verify the bus event fires via `preview_eval` adding a temporary listener); CONTACT shows CTA + all links clickable.

- [ ] **Step 7: Commit**

```bash
git add components/terminal app/page.tsx
git commit -m "feat: about/projects/contact terminal tabs"
```

---

### Task 18: ShellTab — the interactive fake shell (+ MatrixRain)

**Files:**
- Create: `components/terminal/ShellTab.tsx`, `components/MatrixRain.tsx`
- Modify: `app/page.tsx` (pass `<ShellTab />`, mount `<MatrixRain />` at root)

**Interfaces:**
- Consumes: `runCommand`, `PROMPT`, `TermOutput`, `emit`/`onBus`, `sfx`, `content.resumeUrl`, theme/localStorage patterns from StatusBar.
- Produces: working shell executing every `TermAction`.

- [ ] **Step 1: Implement `components/terminal/ShellTab.tsx`**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { runCommand, PROMPT, type TermLine, type TermAction } from "@/lib/terminal/commands";
import { TermOutput } from "./TermOutput";
import { emit } from "@/lib/bus";
import { sfx } from "@/lib/audio";
import { content } from "@/lib/content";

const GREETING: TermLine[] = [
  { text: "Welcome to JB-OS v2.0 — portfolio shell", kind: "ok" },
  { text: 'type "help" to list programs', kind: "dim" },
];

const MAX_LINES = 300;

export function ShellTab() {
  const [lines, setLines] = useState<TermLine[]>(GREETING);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  function execute(action: TermAction) {
    switch (action.type) {
      case "tab": emit("setTab", action.tab); break;
      case "openProject": emit("openProject", action.index); break;
      case "matrix": emit("matrix"); break;
      case "theme":
        try { localStorage.setItem("jb-theme", action.theme); } catch {}
        document.documentElement.setAttribute("data-theme", action.theme);
        sfx.play("theme");
        break;
      case "sound": {
        const on = !(sfx.enabled);
        sfx.setEnabled(on);
        if (on) { sfx.init(); sfx.play("granted"); }
        break;
      }
      case "fx": {
        const off = document.documentElement.getAttribute("data-fx") === "off";
        document.documentElement.setAttribute("data-fx", off ? "on" : "off");
        try { localStorage.setItem("jb-fx", off ? "on" : "off"); } catch {}
        break;
      }
      case "resume": window.open(content.resumeUrl, "_blank", "noopener"); break;
      case "clear": setLines([]); break;
    }
  }

  function submit() {
    const cmd = input;
    setInput("");
    setHistIdx(-1);
    if (cmd.trim()) setHistory((h) => [...h, cmd]);
    const echo: TermLine = { text: `${PROMPT} ${cmd}`, kind: "dim" };
    const result = runCommand(cmd);
    const hasErr = result.lines.some((l) => l.kind === "err");
    sfx.init();
    sfx.play(hasErr ? "denied" : "stdout");
    if (result.actions?.some((a) => a.type === "clear")) {
      setLines([]);
    } else {
      setLines((prev) => [...prev, echo, ...result.lines].slice(-MAX_LINES));
    }
    result.actions?.filter((a) => a.type !== "clear").forEach(execute);
    if (hasErr) {
      document.documentElement.animate?.(
        [{ filter: "none" }, { filter: "hue-rotate(140deg)" }, { filter: "none" }],
        { duration: 120 }
      );
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    sfx.play("key");
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistIdx((i) => {
        const next = i < 0 ? history.length - 1 : Math.max(0, i - 1);
        setInput(history[next] ?? "");
        return next;
      });
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistIdx((i) => {
        const next = i + 1;
        if (next >= history.length) { setInput(""); return -1; }
        setInput(history[next]);
        return next;
      });
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div className="flex h-full min-h-0 flex-col" onClick={() => inputRef.current?.focus()}>
      <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        <TermOutput lines={lines} />
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-accent/20 pt-[0.5vh]">
        <label htmlFor="shell-input" className="whitespace-nowrap text-accent/50">
          {PROMPT}
        </label>
        <input
          id="shell-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal command input"
          className="w-full border-0 bg-transparent font-term text-[inherit] text-accent outline-none [caret-color:var(--accent)]"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `components/MatrixRain.tsx`**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { onBus } from "@/lib/bus";

/** 4s digital-rain overlay for the `matrix` easter egg (spec §6). */
export function MatrixRain() {
  const [active, setActive] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => onBus("matrix", () => setActive(true)), []);

  useEffect(() => {
    if (!active) return;
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const dpr = devicePixelRatio || 1;
    el.width = innerWidth * dpr;
    el.height = innerHeight * dpr;
    const fs = 16 * dpr;
    const cols = Math.floor(el.width / fs);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789JBJAMALBHOLA";
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgb(0 0 0 / 0.08)";
      ctx.fillRect(0, 0, el.width, el.height);
      ctx.font = `${fs}px monospace`;
      const style = getComputedStyle(document.documentElement);
      ctx.fillStyle = `rgb(${style.getPropertyValue("--color-r")} ${style.getPropertyValue("--color-g")} ${style.getPropertyValue("--color-b")})`;
      drops.forEach((y, i) => {
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fs, y * fs);
        drops[i] = y * fs > el.height && Math.random() > 0.98 ? 0 : y + 1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => setActive(false), 4000);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvas} aria-hidden className="fixed inset-0 z-[80] h-full w-full bg-abyss/80" />;
}
```

- [ ] **Step 3: Wire into `app/page.tsx`**

```tsx
import { ShellTab } from "@/components/terminal/ShellTab";
import { MatrixRain } from "@/components/MatrixRain";
// … shell={<ShellTab />} in TerminalPanel; and next to <div className="scanlines">:
      <MatrixRain />
```

- [ ] **Step 4: Full check + preview check**

In SHELL tab: `help` lists programs; `about` prints dossier; `theme matrix` recolors site green live; `sudo x` prints red denial; `matrix` rains for 4s; `neofetch` shows JB art; ↑ recalls history; `clear` empties; `open 3` fires openProject event (modal next task); every keystroke ticks when sound on.

- [ ] **Step 5: Commit**

```bash
git add components/terminal/ShellTab.tsx components/MatrixRain.tsx app/page.tsx
git commit -m "feat: interactive shell with actions, history, easter eggs"
```

---

### Task 19: Modal + ProjectModal (dossier view)

**Files:**
- Create: `components/Modal.tsx`, `components/ProjectModalHost.tsx`
- Modify: `app/page.tsx` (mount `<ProjectModalHost />`)
- Test: `tests/modal.test.tsx`

**Interfaces:**
- Consumes: `onBus("openProject")`, `content.projects`, `sfx`.
- Produces: global modal host — any component can `emit("openProject", i)`.

- [ ] **Step 1: Write failing test — `tests/modal.test.tsx`**

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { ProjectModalHost } from "../components/ProjectModalHost";
import { emit } from "../lib/bus";

afterEach(cleanup);

describe("ProjectModalHost", () => {
  it("opens the full dossier on bus event and closes on Escape", () => {
    render(<ProjectModalHost />);
    act(() => { emit("openProject", 2); });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("SDSU Thrift Website")).toBeTruthy();
    expect(screen.getByText(/Led the development of a student marketplace/)).toBeTruthy();
    expect(screen.getByText(/Reduced page load time by 50%/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /view code/i }).getAttribute("href")).toBe(
      "https://github.com/leanneallen/sdsuthrift"
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**, then implement `components/Modal.tsx`

```tsx
"use client";
import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = { title: string; onClose: () => void; children: ReactNode };

/** augmented-ui framed dialog: focus-trapped, Esc/backdrop close (spec §6). */
export function Modal({ title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const focusables = ref.current.querySelectorAll<HTMLElement>(
          'a[href], button, input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-abyss/70 p-[2vh] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
        className="panel-frame max-h-[86vh] w-full max-w-[90ch] overflow-y-auto p-[2.5vh] outline-none animate-[flicker-in_180ms_linear_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hairline mb-[1.5vh] flex items-start justify-between pb-[0.5vh]">
          <h2 className="m-0 font-display text-[max(2.4vh,18px)] font-bold uppercase tracking-[0.1em]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer border border-accent/50 bg-transparent px-2 font-term text-accent hover:bg-accent hover:text-panel"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement `components/ProjectModalHost.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { onBus } from "@/lib/bus";
import { content } from "@/lib/content";
import { Modal } from "./Modal";
import { sfx } from "@/lib/audio";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-[1.5vh]">
      <h3 className="m-0 mb-[0.4vh] font-display text-[max(1.4vh,12px)] font-bold uppercase tracking-[0.2em] text-accent/60">
        {label}
      </h3>
      <div className="font-term text-[max(1.5vh,13px)] leading-relaxed">{children}</div>
    </section>
  );
}

export function ProjectModalHost() {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(
    () =>
      onBus("openProject", (i) => {
        if (i >= 0 && i < content.projects.length) {
          setIndex(i);
          sfx.init();
          sfx.play("expand");
        }
      }),
    []
  );

  if (index === null) return null;
  const p = content.projects[index];

  return (
    <Modal title={p.title} onClose={() => setIndex(null)}>
      <div className="mb-[1.5vh] flex flex-wrap gap-x-[2vh] gap-y-1 font-term text-[max(1.2vh,11px)] text-accent/60">
        <span>STATUS: <span className={p.status === "Completed" ? "text-accent" : "text-warn"}>{p.status.toUpperCase().replace(" ", "_")}</span></span>
        <span>DATE: {p.date}</span>
        <span>ROLE: {p.role}</span>
      </div>

      <Section label="Dossier">{p.longDescription}</Section>

      <Section label="Key Features">
        <ul className="m-0 list-none p-0">
          {p.features.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden className="text-accent">→</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Challenges">{p.challenges}</Section>
      <Section label="Results">{p.results}</Section>

      <Section label="Stack">
        <ul className="m-0 flex list-none flex-wrap gap-[0.6vh] p-0">
          {p.tech.map((tch) => (
            <li key={tch} data-augmented-ui="tl-clip br-clip border"
                className="px-2 py-0.5 font-term text-[max(1.2vh,11px)] [--aug-border-all:1px] [--aug-border-bg:var(--accent-30)] [--aug-tl:5px] [--aug-br:5px]">
              {tch}
            </li>
          ))}
        </ul>
      </Section>

      {p.github ? (
        <a
          href={p.github}
          target="_blank"
          rel="noopener noreferrer"
          data-augmented-ui="tl-clip br-clip border"
          className="inline-block px-4 py-2 font-display font-bold uppercase tracking-[0.15em] text-accent no-underline [--aug-border-all:2px] [--aug-border-bg:var(--accent-50)] hover:bg-accent hover:text-panel"
        >
          View Code ▸
        </a>
      ) : (
        <span className="font-term text-[max(1.2vh,11px)] text-accent/40">
          SOURCE: PRIVATE ARCHIVE
        </span>
      )}
    </Modal>
  );
}
```

- [ ] **Step 4: Mount in `app/page.tsx`** next to `<MatrixRain />`:

```tsx
import { ProjectModalHost } from "@/components/ProjectModalHost";
// …
      <ProjectModalHost />
```

- [ ] **Step 5: Run tests (modal test passes), full check + preview check**

Click a row in PROJECTS tab → dossier modal flickers in with every §12 field; Esc / × / backdrop closes and focus returns; `open 1` in SHELL opens it too; SDSU Thrift shows working View Code link; others show SOURCE: PRIVATE ARCHIVE (never a dead button — old site had one, this replaces it honestly).

- [ ] **Step 6: Commit**

```bash
git add components/Modal.tsx components/ProjectModalHost.tsx tests/modal.test.tsx app/page.tsx
git commit -m "feat: focus-trapped augmented modal with full project dossiers"
```

---

## Phase 6 — Bottom strip, routes, polish

### Task 20: ProjectBrowser (filesystem strip) + `/projects` redirect + footer credit

**Files:**
- Create: `components/ProjectBrowser.tsx`
- Modify: `app/projects/page.tsx` (full rewrite → redirect), `app/page.tsx` (swap FILES Standby), `components/StatusBar.tsx` (footer credit)

**Interfaces:**
- Consumes: `content.projects`, `emit("openProject"|"setTab")`, `content.resumeUrl`, `content.footer`.

- [ ] **Step 1: Implement `components/ProjectBrowser.tsx`**

eDEX filesystem: a row of chamfered file tiles (spec §6). 5 projects + `about.md` + `contact.sh` + `resume.pdf`.

```tsx
"use client";
import { content } from "@/lib/content";
import { emit } from "@/lib/bus";
import { sfx } from "@/lib/audio";

const tileClass =
  "panel-frame stagger group flex h-full min-w-[13ch] cursor-pointer flex-col justify-between gap-[0.5vh] border-0 bg-transparent p-[0.8vh] text-left font-term text-accent transition-transform hover:-translate-y-[2px] [--aug-border-all:1px] [--aug-tl:7px] [--aug-br:7px]";

function ext(file: string) {
  return file.slice(file.lastIndexOf(".") + 1).toUpperCase();
}

export function ProjectBrowser() {
  const open = (i: number) => {
    sfx.init();
    sfx.play("panel");
    emit("openProject", i);
  };

  return (
    <div className="flex h-full items-stretch gap-[0.75vh] overflow-x-auto pb-[0.3vh]">
      {content.projects.map((p, i) => (
        <button
          key={p.id}
          type="button"
          data-augmented-ui="tl-clip br-clip border"
          className={tileClass}
          style={{ "--i": i } as React.CSSProperties}
          onClick={() => open(i)}
          aria-label={`Open project: ${p.title}`}
        >
          <span className="font-display text-[max(2vh,15px)] font-bold tracking-[0.1em]">
            .{ext(p.file)}
          </span>
          <span className="text-[max(1.15vh,10px)] leading-tight">
            {p.file}
            <span className="mt-[0.2vh] block text-accent/50">{p.title}</span>
          </span>
          <span className="flex items-center gap-2 text-[max(1vh,9px)] tracking-[0.15em]">
            <span
              aria-hidden
              className={`inline-block h-[0.8vh] w-[0.8vh] min-h-[5px] min-w-[5px] rounded-full ${
                p.status === "Completed" ? "bg-accent" : "bg-warn animate-[pulse-dot_1.5s_ease-in-out_infinite]"
              }`}
            />
            {p.status.toUpperCase().replace(" ", "_")}
          </span>
        </button>
      ))}

      <button type="button" data-augmented-ui="tl-clip br-clip border" className={tileClass}
        style={{ "--i": 5 } as React.CSSProperties}
        onClick={() => { emit("setTab", "about"); }} aria-label="Open about section">
        <span className="font-display text-[max(2vh,15px)] font-bold tracking-[0.1em]">.MD</span>
        <span className="text-[max(1.15vh,10px)]">about.md</span>
        <span className="text-[max(1vh,9px)] tracking-[0.15em] text-accent/50">DOC</span>
      </button>

      <button type="button" data-augmented-ui="tl-clip br-clip border" className={tileClass}
        style={{ "--i": 6 } as React.CSSProperties}
        onClick={() => { emit("setTab", "contact"); }} aria-label="Open contact section">
        <span className="font-display text-[max(2vh,15px)] font-bold tracking-[0.1em]">.SH</span>
        <span className="text-[max(1.15vh,10px)]">contact.sh</span>
        <span className="text-[max(1vh,9px)] tracking-[0.15em] text-accent/50">EXEC</span>
      </button>

      <a href={content.resumeUrl} target="_blank" rel="noopener noreferrer"
        data-augmented-ui="tl-clip br-clip border" className={`${tileClass} no-underline`}
        style={{ "--i": 7 } as React.CSSProperties} aria-label="Open resume PDF">
        <span className="font-display text-[max(2vh,15px)] font-bold tracking-[0.1em]">.PDF</span>
        <span className="text-[max(1.15vh,10px)]">Jamal_Bhola_resume.pdf</span>
        <span className="text-[max(1vh,9px)] tracking-[0.15em] text-accent/50">PDF ▸ OPEN</span>
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `app/projects/page.tsx`** (preserve inbound links — spec §11)

```tsx
import { redirect } from "next/navigation";

export default function ProjectsRedirect() {
  redirect("/#projects");
}
```

- [ ] **Step 3: Swap into `app/page.tsx`**

```tsx
import { ProjectBrowser } from "@/components/ProjectBrowser";
// …
<Panel index={10} titleLeft="FILES" titleRight="PROJECT_ARCHIVE" className="max-lg:order-4">
  <ProjectBrowser />
</Panel>
```

- [ ] **Step 4: Footer credit in `components/StatusBar.tsx`**

In the left brand group, after the `v2.0` span, add:

```tsx
        <span suppressHydrationWarning className="text-accent/40 max-md:hidden">
          © {new Date().getFullYear()} JAMAL BHOLA · {`${content.footer}`}
        </span>
```

with `import { content } from "@/lib/content";` added at top.

- [ ] **Step 5: Full check + preview check**

Bottom strip shows 8 tiles with status LEDs (amber pulsing for In Progress); project tile → modal; about/contact tiles switch tabs; resume tile opens the PDF; visiting `/projects` lands on `/#projects` with PROJECTS tab active; footer credit visible in status bar.

- [ ] **Step 6: Commit**

```bash
git add components/ProjectBrowser.tsx components/StatusBar.tsx app/projects/page.tsx app/page.tsx
git commit -m "feat: filesystem project browser, /projects redirect, footer credit"
```

---

### Task 21: Boot→cockpit sound chain + entrance blips

**Files:**
- Modify: `components/BootSequence.tsx`

The CSS stagger can't emit sound, so the boot component plays the eDEX `panels.wav`-style blip chain as the panels appear (reference analysis §1.4 phase 3).

- [ ] **Step 1: In `BootSequence.tsx`, inside the `phase === "greet"` branch of the phase effect, after `sfx.play("expand")`, add:**

```tsx
      for (let i = 0; i < 11; i++) {
        setTimeout(() => sfx.play("panel"), 200 + i * 120); // one blip per staggered panel
      }
```

- [ ] **Step 2: Full check + preview check**

Enable sound (SND toggle), clear sessionStorage, reload: log ticks per line, granted chirp at "Boot Complete", expand whoosh at lift, 11 quick panel blips during the stagger. Mute → totally silent boot.

- [ ] **Step 3: Commit**

```bash
git add components/BootSequence.tsx
git commit -m "feat: synchronized sfx chain for boot and panel entrances"
```

---

### Task 22: Responsive — tablet & mobile layouts

**Files:**
- Modify: `app/page.tsx`, `components/BootSequence.tsx`, `app/globals.css`

Spec §8: <768px = single column, sticky status bar, terminal 60vh, browser strip horizontal-scroll, side panels in accordions, boot shortened to title-card only.

- [ ] **Step 1: Mobile boot shortening — in `BootSequence.tsx`**

In the mount effect, after reading `data-booting`, add:

```tsx
      if (window.innerWidth < 768) {
        setPhase("title-in"); // skip the log on mobile (spec §8)
      }
```

- [ ] **Step 2: Accordion styling for side columns on mobile — `app/page.tsx`**

Wrap each side column's panels: on `max-lg`, columns render inside `<details className="panel-accordion" open={…}>` — implement by adding a small wrapper component in `app/page.tsx`:

```tsx
function MobileSection({ title, defaultOpen = false, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  return (
    <>
      <div className="contents max-lg:hidden">{children}</div>
      <details className="hidden max-lg:block" open={defaultOpen}>
        <summary className="cursor-pointer list-none px-[1vh] py-[1.2vh] font-display text-[max(1.4vh,12px)] font-bold uppercase tracking-[0.2em] text-accent/70 hover:text-accent">
          ▸ {title}
        </summary>
        <div className="flex flex-col gap-[0.75vh]">{children}</div>
      </details>
    </>
  );
}
```

Wrap the left column contents in `<MobileSection title="PANEL // SYSTEM" defaultOpen>` and the right column contents in `<MobileSection title="PANEL // NETWORK">`. Keep the desktop flex wrappers.

- [ ] **Step 3: Sticky status bar + terminal height on mobile — adjust classes in `app/page.tsx`**

- StatusBar wrapper: add `max-lg:sticky max-lg:top-0 max-lg:z-50 max-lg:bg-panel/95 max-lg:py-2`.
- Terminal `Panel`: add `max-lg:h-[60vh]`.
- Bottom FILES panel: ensure `max-lg:h-auto` and the browser's `overflow-x-auto` gives horizontal swipe.

- [ ] **Step 4: Touch targets — `app/globals.css`** append:

```css
@media (max-width: 767px) {
  button, a, summary { min-height: 44px; }
  .tab-skew { transform: skewX(20deg); } /* gentler slant so labels fit */
  .tab-skew > * { transform: skewX(-20deg); }
}
```

- [ ] **Step 5: Full check + preview checks at three widths**

`preview_resize` to 1440×900: unchanged cockpit. 768×1024: single column, no horizontal overflow. 375×812: sticky bar, 60vh terminal usable (type `help`), accordions expand/collapse, tiles swipe horizontally, boot = title card only (~1.5s), every §12 string still reachable.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/globals.css components/BootSequence.tsx
git commit -m "feat: tablet/mobile layouts with accordions and shortened boot"
```

---

### Task 23: Accessibility & reduced-motion sweep

**Files:**
- Modify: `app/globals.css`; audit-fix in any component found wanting

- [ ] **Step 1: Focus visibility — append to `app/globals.css`**

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Contrast audit (spec §11)**

For each theme set via StatusBar, `preview_inspect` body/panels: accent text on `--bg-panel` must be ≥ 4.5:1. Expected pass: tron ~12:1, apollo ~15:1, matrix ~5:1, blade ~5:1. For `interstellar` (light), if `rgb(3 169 244)` on `#dedede` measures < 4.5:1 (it will, ~2.4:1), add a per-theme text override in globals.css:

```css
html[data-theme="interstellar"] {
  --color-r: 2; --color-g: 100; --color-b: 158; /* darkened accent for AA on light bg */
}
```

(The darkened channel applies to borders too — verify panels still read clearly on the light background.)

- [ ] **Step 3: Keyboard-only walkthrough (fix anything that fails)**

Tab from load: skip-link → status bar controls → tabs (arrow keys switch) → tab content links → browser tiles → into SHELL input. Modal: opens from keyboard (Enter on PROJECTS row/tile), traps focus, Esc restores focus to opener. No focus ever lost into a canvas.

- [ ] **Step 4: Reduced-motion verification**

`preview_eval`: `document.documentElement.setAttribute('data-motion','reduced'); sessionStorage.clear(); location.reload()`.
Expect: no boot, no stagger animation (content instantly visible), globe static frame, no scanlines, typewriters instant. Also verify via DevTools emulation of `prefers-reduced-motion`.

- [ ] **Step 5: Screen-reader semantics spot check**

`preview_snapshot` (accessibility tree): tabs expose `tablist/tab/tabpanel` + `aria-selected`; meters expose `role=meter` with values; canvases invisible to the tree but sr-only texts present; dialog exposes name + `aria-modal`.

- [ ] **Step 6: Full check + commit**

```bash
git add -A
git commit -m "fix: a11y polish — focus rings, AA contrast, reduced-motion coverage"
```

---

### Task 24: Final acceptance, README, cleanup

**Files:**
- Modify: `README.md` (rewrite), `.gitignore` (if needed)
- Delete: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg` (unused template art — verify with grep first)

- [ ] **Step 1: Confirm template assets are unreferenced**

Run: `grep -r "next.svg\|vercel.svg\|window.svg\|file.svg\|globe.svg" app components lib --include=*.tsx --include=*.ts`
Expected: no hits → delete the five SVGs. Any hit → leave that file alone.

- [ ] **Step 2: Rewrite `README.md`**

~~~markdown
# jamal-bhola.dev — JB-OS

Personal portfolio rebuilt as an eDEX-UI / dex-ui-inspired sci-fi cockpit:
boot sequence, instrument panels, interactive terminal, five switchable themes.

## Stack
Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · augmented-ui

## Develop
```bash
npm install
npm run dev    # http://localhost:3000
npm run test   # vitest
npm run build
```

## Terminal
Open the SHELL tab and type `help`. Try `theme matrix`, `neofetch`, `open 1`, `sudo make me a sandwich`.

## Design docs
- `docs/superpowers/specs/2026-07-09-edex-ui-overhaul-design.md`
- `docs/design/REFERENCE-ANALYSIS.md`

Design inspired by [eDEX-UI](https://github.com/GitSquared/edex-ui) and
[dex-ui](https://github.com/seenaburns/dex-ui); all code, sounds, and data
re-implemented from scratch (no GPL assets).
~~~

- [ ] **Step 3: Run the spec §16 acceptance checklist — every line must pass**

1. `npx tsc --noEmit` && `npm run test` && `npm run build` — green.
2. Boot: plays on first visit; revisit skips; any-key skip; reduced-motion absent.
3. Content: about text, all 5 project dossiers (modal fields), all contact links, resume — reachable and verbatim (spot-check against `lib/content.ts`).
4. Themes: all 5 switch live (StatusBar + `theme <name>`), persist across reload.
5. Widths 375 / 768 / 1440: layouts per spec §8, no horizontal overflow, no clipped text.
6. Keyboard-only full walkthrough.
7. Lighthouse (desktop, production `npm run build && npm start`): performance ≥ 90, accessibility ≥ 95. Record scores in the commit message.
8. Idle CPU sanity: DevTools performance 10s idle sample — main thread mostly idle (<5% scripting).

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: readme, asset cleanup, final acceptance (lighthouse perf=NN a11y=NN)"
```

- [ ] **Step 5: Report** — summarize to the user: what shipped, acceptance numbers, and the two flagged items: (a) GitHub link `github.com/jamalbhola` vs repo owner `jambho` (preserved as-is — confirm which is correct); (b) © year now dynamic (was hardcoded 2024).

---

## Plan self-review (performed at write time)

- **Spec coverage:** §4 tokens→Task 4; §5 layout→Task 8; §6 all 14 components→Tasks 8–20; §7 boot→Tasks 9, 21, 22; §8 responsive→Tasks 8, 22; §9 animation system→Tasks 3, 4, 5, 7 (note: `useDrawIn`/`useTicker` from spec §9.2 — `useDrawIn` was folded into the CSS stagger system of Task 4 + `Panel`'s classes, a deliberate simplification; `TickLine` exists for in-panel use); §10 sound→Tasks 6, 21; §11 SSR/SEO/a11y→Tasks 4, 17, 23; §12 content→Task 2 (tested); §13 architecture→file map above; §14 error handling→Tasks 6, 7 (WidgetBoundary), 13; §15 cuts honored (no keyboard, no WebGL); §16 acceptance→Task 24.
- **Placeholder scan:** none — every code step is complete; the two intentional "generate then paste" values (QUINTIC_LINEAR, Lighthouse scores) have explicit generation steps.
- **Type consistency:** `TermLine/TermAction/CmdResult/PROMPT` (Task 15) match usages in Tasks 17–19; `TabId` exported from `lib/bus.ts` everywhere; `Panel` props consistent across Tasks 8–20; sfx names constant; `content` fields match Task 2 exactly.

## Execution handoff

Execute with **superpowers:subagent-driven-development** (fresh subagent per task, review between tasks) or **superpowers:executing-plans** (batch with checkpoints). Tasks are strictly ordered; do not parallelize across phases — later tasks edit files earlier tasks create (`app/page.tsx` accretes). Within Phase 3/4, panel tasks touch disjoint component files but share one-line `page.tsx` edits; safest sequentially.





