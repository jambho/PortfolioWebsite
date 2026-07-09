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
