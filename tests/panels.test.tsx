import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { OperatorPanel } from "../components/panels/OperatorPanel";
import { SkillsPanel } from "../components/panels/SkillsPanel";
import { ContactPanel } from "../components/panels/ContactPanel";

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
    for (const s of ["React", "Django", "Verilog / FPGA", "Docker"]) {
      expect(screen.getByText(s)).toBeTruthy();
    }
  });
});

describe("ContactPanel", () => {
  it("renders every uplink as a real link", () => {
    render(<ContactPanel />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("mailto:jamal.bhola@gmail.com");
    expect(hrefs).toContain("https://github.com/jambho");
    expect(hrefs).toContain("https://linkedin.com/in/jamalbhola");
    expect(hrefs).toContain("https://twitter.com/jambho");
    expect(hrefs).toContain("/Jamal_Bhola_resume.pdf");
  });
});
