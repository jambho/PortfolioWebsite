import { describe, it, expect } from "vitest";

describe("test tooling", () => {
  it("runs TypeScript tests in jsdom", () => {
    const el = document.createElement("div");
    el.textContent = "ok";
    expect(el.textContent).toBe("ok");
  });
});
