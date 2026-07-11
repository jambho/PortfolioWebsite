import { describe, it, expect } from "vitest";
import { content } from "../lib/content";

describe("content preservation (spec §12, resume-aligned 2026-07)", () => {
  it("keeps identity strings", () => {
    expect(content.identity.name).toBe("Jamal Bhola");
    expect(content.identity.tagline).toBe("Software Engineer & Web Developer");
    expect(content.identity.school).toBe("San Diego State University");
    expect(content.identity.specialization).toBe(
      "Specializing in software development, web technologies, and system architecture"
    );
    expect(content.identity.location).toBe("Los Angeles, CA");
  });

  it("keeps the four resume-derived skill groups", () => {
    expect(content.skills).toEqual([
      { label: "Languages", skills: ["TypeScript", "Python", "C/C++", "Java"] },
      { label: "Web", skills: ["React", "Next.js", "Node.js", "Django"] },
      { label: "Hardware", skills: ["Verilog / FPGA", "Arduino", "PCB Design"] },
      { label: "Tools", skills: ["Git", "Docker", "AWS", "Linux"] },
    ]);
  });

  it("keeps the seven detailed projects with every field", () => {
    expect(content.projects).toHaveLength(7);
    const titles = content.projects.map(p => p.title);
    expect(titles).toEqual([
      "Discord AI Voice Cloning Bot",
      "FPGA Rhythm Game",
      "Dungeons and Dragons Desktop App",
      "SDSU Thrift Website",
      "Music Box Cyberphysical System",
      "Headcount",
      "JB-OS Portfolio Terminal",
    ]);
    for (const p of content.projects) {
      expect(p.description.length).toBeGreaterThan(20);
      expect(p.longDescription.length).toBeGreaterThan(80);
      expect(p.tech.length).toBeGreaterThanOrEqual(4);
      expect(["In Progress", "Completed"]).toContain(p.status);
      expect(p.date).toMatch(/20\d\d/);
      expect(p.role.length).toBeGreaterThan(5);
      expect(p.features.length).toBeGreaterThanOrEqual(4);
      expect(p.challenges.length).toBeGreaterThan(40);
      expect(p.results.length).toBeGreaterThan(40);
      expect(p.slug).toMatch(/^[a-z0-9_]+$/);
      expect(p.metrics!.length).toBeGreaterThanOrEqual(2);
    }
    expect(content.projects[3].github).toBe("https://github.com/leanneallen/sdsuthrift");
    expect(content.projects[5].github).toBe("https://github.com/jambho/Headcount");
    expect(content.projects[6].github).toBe("https://github.com/jambho/PortfolioWebsite");
  });

  it("keeps the resume experience entries", () => {
    expect(content.experience).toHaveLength(3);
    expect(content.experience.map(e => e.role)).toEqual([
      "Full Stack Developer",
      "IT Services Help Desk Student Analyst",
      "Electrical Engineering Team",
    ]);
    for (const e of content.experience) {
      expect(e.org.length).toBeGreaterThan(3);
      expect(e.date).toMatch(/20\d\d/);
      expect(e.bullets.length).toBeGreaterThanOrEqual(2);
      for (const b of e.bullets) expect(b.length).toBeGreaterThan(30);
    }
    expect(content.experience[0].bullets.join(" ")).toContain("50+");
  });

  it("keeps contact data with the resume-confirmed GitHub handle", () => {
    expect(content.contact.email).toBe("jamal.bhola@gmail.com");
    expect(content.contact.cta).toBe(
      "Ready to collaborate on your next project? Let's build something amazing together."
    );
    const hrefs = content.contact.links.map(l => l.href);
    expect(hrefs).toContain("https://github.com/jambho");
    expect(hrefs).toContain("https://linkedin.com/in/jamalbhola");
    expect(hrefs).toContain("https://twitter.com/jambho");
    expect(content.resumeUrl).toBe("/Jamal_Bhola_resume.pdf");
  });
});
