import { describe, it, expect } from "vitest";
import { content } from "../lib/content";

describe("content preservation (spec §12)", () => {
  it("keeps identity strings", () => {
    expect(content.identity.name).toBe("Jamal Bhola");
    expect(content.identity.tagline).toBe("Software Engineer & Web Developer");
    expect(content.identity.school).toBe("San Diego State University");
    expect(content.identity.specialization).toBe(
      "Specializing in software development, web technologies, and system architecture"
    );
    expect(content.identity.location).toBe("Los Angeles, CA");
  });

  it("keeps all four skill groups verbatim", () => {
    expect(content.skills).toEqual([
      { label: "Frontend", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
      { label: "Backend", skills: ["Node.js", "Python", "Express.js", "Django"] },
      { label: "Database", skills: ["MongoDB", "PostgreSQL", "MySQL"] },
      { label: "Tools", skills: ["Git", "Docker", "AWS", "Linux"] },
    ]);
  });

  it("keeps the five detailed projects with every field", () => {
    expect(content.projects).toHaveLength(5);
    const titles = content.projects.map(p => p.title);
    expect(titles).toEqual([
      "Discord AI Voice Cloning Bot",
      "Dungeons and Dragons Desktop App",
      "SDSU Thrift Website",
      "Music Box Cyberphysical System",
      "Portfolio Website",
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
    }
    expect(content.projects[2].github).toBe("https://github.com/leanneallen/sdsuthrift");
  });

  it("keeps contact data verbatim", () => {
    expect(content.contact.email).toBe("jamal.bhola@gmail.com");
    expect(content.contact.cta).toBe(
      "Ready to collaborate on your next project? Let's build something amazing together."
    );
    const hrefs = content.contact.links.map(l => l.href);
    expect(hrefs).toContain("https://github.com/jamalbhola");
    expect(hrefs).toContain("https://linkedin.com/in/jamalbhola");
    expect(hrefs).toContain("https://twitter.com/jambho");
    expect(content.resumeUrl).toBe("/Jamal_Bhola_resume.pdf");
  });
});
