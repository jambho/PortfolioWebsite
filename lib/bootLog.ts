import { content } from "./content";

/** Deterministic ~80-line fake boot log, personalized from site content (spec §7 T1). */
export function buildBootLog(): string[] {
  const lines: string[] = [
    "JB-OS v2.0.0 — initializing kernel",
    `boot at ${"2026-01-01T00:00:00Z"} on node jamal-bhola.dev; root:jbos-2.0.0/RELEASE_WEB_X64`,
    "vm_page_bootstrap: 262144 free pages and 4096 wired pages",
    "standard timeslicing quantum is 10000 us",
    "JBACPICPU: ProcessorId=1 LocalApicId=0 Enabled",
    "JBACPICPU: ProcessorId=2 LocalApicId=2 Enabled",
    "JBACPICPU: ProcessorId=3 LocalApicId=4 Enabled",
    "JBACPICPU: ProcessorId=4 LocalApicId=6 Enabled",
    "calling mpo_policy_init for CreativityGuard",
    "Security policy loaded: caffeine containment (CreativityGuard)",
    "Copyright (c) 2024-2026 Jamal Bhola. All rights reserved.",
    "MAC Framework successfully initialized",
    "using 16384 buffer headers and 10240 cluster IO buffer headers",
    "IOAPIC: Version 0x20 Vectors 64:87",
    "ACPI: System State [S0 S3 S4 S5] (S3)",
    "AppleKeyStore: starting (BuildVersion=JBOS)",
    "hfs: unmount initiated on scratch volume",
    "[ PCI configuration begin ]",
    "PCI configuration changed (bridge=1 device=4 cardbus=0)",
    "[ PCI configuration end, bridges 4, devices 42 ]",
    "mbinit: done [96 MB total pool size, (64/32) split]",
    "Pthread support ABORTS when sync kernel primitives misused",
    "IOHIDSystem: registered virtual keyboard for /bin/visitor",
    "AppleIntelCPUPowerManagement: initialization complete",
    "Sandbox: JB-OS profile compiled and loaded",
    "com.jamal.driver.CoffeeIntake kext loaded",
    "com.jamal.driver.ChaiIntake kext loaded (fallback)",
    "IOSurface: allocated 12 framebuffer surfaces",
    "GPU: phosphor shader linked [OK]",
    "rooting via boot-uuid from /chosen: 4D3C2B1A-JB05-BH0L-A379-PORTFOLIO01",
    "Waiting on <dict ID=\"0\"><key>IOProviderClass</key><string>IOResources</string></dict>",
    "com.jamal.launchd 1 == com.jamal.launchd.portfolio",
    "BSD root: disk0s2, major 1, minor 2",
    "jbfs: mounted /dev/skills (read-only)",
    "jbfs: mounted /dev/projects (read-write)",
    "SDSU degree module verified: B.S. Computer Engineering [OK]",
  ];

  for (const group of content.skills) {
    lines.push(
      `loading skill cluster ${group.label.toLowerCase()}: ${group.skills.join(", ")} [OK]`
    );
  }

  for (const p of content.projects) {
    lines.push(`mounting /dev/projects/${p.file} ... OK`);
    lines.push(`  ${p.title} :: status=${p.status.replace(" ", "_").toUpperCase()}`);
  }

  lines.push(
    "en0: Ethernet address de:ad:be:ef:ca:fe",
    "airport: Link Up on en1",
    `geo_locate: ${content.contact.location} [34.05N 118.24W]`,
    `uplink registered: mailto:${content.contact.email}`,
    ...content.contact.links.map((l) => `uplink registered: ${l.href}`),
    "resume.pdf checksum verified [OK]",
    "IOThinkTank: idle inspiration at 0x00ff41",
    "systemShell: registering /bin/visitor",
    "termdisp: 24-bit color, 60Hz, scanlines ENABLED",
    "audio: WebAudio synth bank armed (7 voices)",
    "theme daemon: tron matrix blade apollo interstellar [5 loaded]",
    "entropy harvested from cosmic background",
    "checking root filesystem for style violations... none found",
    "warming up phosphor layer",
    "aligning chamfered corners",
    "calibrating typewriters to 40cps",
    "spawning panel supervisors (10 workers)",
    "handshake with visitor pending...",
    "all subsystems nominal",
    "Boot Complete",
    "Welcome to JB-OS"
  );

  return lines;
}
