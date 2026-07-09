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
