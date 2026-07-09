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
