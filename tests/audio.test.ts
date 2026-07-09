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
