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
