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
