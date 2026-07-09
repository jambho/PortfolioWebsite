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
