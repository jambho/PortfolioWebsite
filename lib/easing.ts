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
