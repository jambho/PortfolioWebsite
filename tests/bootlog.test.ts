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
