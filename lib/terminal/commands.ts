import { content } from "../content";
import { THEME_NAMES, isTheme, type ThemeName } from "../themes";
import type { TabId } from "../bus";

export type TermLine = { text: string; kind?: "out" | "ok" | "err" | "dim" | "head"; href?: string };
export type TermAction =
  | { type: "tab"; tab: TabId }
  | { type: "openProject"; index: number }
  | { type: "theme"; theme: ThemeName }
  | { type: "matrix" }
  | { type: "clear" }
  | { type: "sound" }
  | { type: "fx" }
  | { type: "resume" };
export type CmdResult = { lines: TermLine[]; actions?: TermAction[] };

export const PROMPT = "visitor@jamal-bhola:~$";

const t = (text: string, kind?: TermLine["kind"]): TermLine => ({ text, kind });

const FILES = ["about.md", "contact.sh", "resume.pdf", ...content.projects.map((p) => p.file)];

function aboutLines(): TermLine[] {
  return [
    t(`# ${content.identity.name}`, "head"),
    t(content.identity.tagline, "ok"),
    t(""),
    t(content.identity.schoolLine),
    t(content.identity.specialization),
    t(""),
    t(`EDUCATION  ${content.about.education[0].degree} — ${content.about.education[0].school}`),
    t(`SPECIALTY  ${content.about.specialization}`),
    t(`FOCUS      ${content.about.focusAreas}`),
    t(""),
    ...content.skills.map((g) => t(`${g.label.toUpperCase().padEnd(9)} ${g.skills.join(", ")}`, "dim")),
  ];
}

function projectLines(): TermLine[] {
  const rows = content.projects.map((p, i) =>
    t(`${String(i + 1).padStart(2)}  ${p.file.padEnd(18)} ${p.status.padEnd(12)} ${p.date}`)
  );
  return [
    t(`total ${content.projects.length}`, "dim"),
    ...rows,
    t(""),
    ...content.projects.map((p, i) => t(`    [${i + 1}] ${p.title}`, "dim")),
    t(""),
    t(`hint: open <n> for full dossier · resume for the PDF`, "dim"),
  ];
}

function contactLines(): TermLine[] {
  return [
    t(content.contact.cta, "ok"),
    t(""),
    t(`EMAIL     ${content.contact.email}`),
    ...content.contact.links.map((l) => t(`${l.label.padEnd(9)} ${l.href}`)),
    t(`LOCATION  ${content.contact.location}`),
    t(""),
    t(`PING jamal.bhola (${content.contact.location}): 32 bytes, time=0.4ms — reachable.`, "dim"),
  ];
}

const NEOFETCH = [
  "     ██╗██████╗ ",
  "     ██║██╔══██╗",
  "     ██║██████╔╝",
  "██   ██║██╔══██╗",
  "╚█████╔╝██████╔╝",
  " ╚════╝ ╚═════╝ ",
];

function neofetchLines(): TermLine[] {
  const info = [
    `${content.identity.name}@portfolio`,
    "----------------------",
    `OS: JB-OS v2.0 (web)`,
    `Host: ${content.identity.school}`,
    `Kernel: next-15.5 / react-19`,
    `Shell: /bin/visitor`,
    `Theme: run \`theme\` to change`,
    `Uptime: since December 2024`,
  ];
  const n = Math.max(NEOFETCH.length, info.length);
  return Array.from({ length: n }, (_, i) =>
    t(`${NEOFETCH[i] ?? " ".repeat(16)}  ${info[i] ?? ""}`, i === 0 ? "ok" : "out")
  );
}

const HELP: [string, string][] = [
  ["help", "this list"],
  ["about", "operator dossier (cat about.md)"],
  ["projects", "list project archive (ls)"],
  ["open <n>", "open project dossier n"],
  ["contact", "uplink directory (./contact.sh)"],
  ["resume", "open resume.pdf"],
  ["theme <name>", `switch theme: ${THEME_NAMES.join(" | ")}`],
  ["sound", "toggle sfx"],
  ["fx", "toggle scanlines"],
  ["neofetch", "system info"],
  ["whoami", "who are you?"],
  ["matrix", "?"],
  ["clear", "clear terminal"],
];

export function runCommand(raw: string): CmdResult {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const [cmd, ...args] = input.split(/\s+/);

  switch (cmd.toLowerCase()) {
    case "help":
      return {
        lines: [
          t("JB-OS shell — available programs:", "head"),
          ...HELP.map(([c, d]) => t(`  ${c.padEnd(14)} ${d}`)),
        ],
      };
    case "about":
      return { lines: aboutLines() };
    case "ls":
    case "projects":
      return { lines: projectLines() };
    case "open": {
      const n = Number(args[0]);
      if (!Number.isInteger(n) || n < 1 || n > content.projects.length) {
        return { lines: [t(`open: expected 1-${content.projects.length}, got "${args[0] ?? ""}"`, "err")] };
      }
      return {
        lines: [t(`decrypting dossier ${content.projects[n - 1].file} ... OK`, "ok")],
        actions: [{ type: "openProject", index: n - 1 }],
      };
    }
    case "contact":
      return { lines: contactLines() };
    case "resume":
      return { lines: [t("opening resume.pdf ...", "ok")], actions: [{ type: "resume" }] };
    case "cat": {
      const f = args[0] ?? "";
      if (f === "about.md") return { lines: aboutLines() };
      if (f === "contact.sh") return { lines: contactLines() };
      if (f === "resume.pdf") return { lines: [t("cat: resume.pdf: binary file — try `resume`", "err")] };
      const proj = content.projects.findIndex((p) => p.file === f);
      if (proj >= 0) return { lines: [t(`use \`open ${proj + 1}\` for the full dossier`, "dim")] };
      return { lines: [t(`cat: ${f}: no such file`, "err")] };
    }
    case "theme": {
      const name = (args[0] ?? "").toLowerCase();
      if (isTheme(name)) {
        return { lines: [t(`theme set: ${name}`, "ok")], actions: [{ type: "theme", theme: name }] };
      }
      return { lines: [t(`theme: unknown "${args[0] ?? ""}" — themes: ${THEME_NAMES.join(", ")}`, "err")] };
    }
    case "sound":
      return { lines: [t("toggling sfx", "ok")], actions: [{ type: "sound" }] };
    case "fx":
      return { lines: [t("toggling scanlines", "ok")], actions: [{ type: "fx" }] };
    case "whoami":
      return { lines: [t("visitor — but the operator is:"), ...aboutLines().slice(0, 2)] };
    case "neofetch":
      return { lines: neofetchLines() };
    case "matrix":
      return { lines: [t("wake up...", "ok")], actions: [{ type: "matrix" }] };
    case "sudo":
      return { lines: [t("sudo: permission denied — this incident will be reported to nobody.", "err")] };
    case "exit":
      return { lines: [t("nice try. there is no escape from the portfolio.", "dim")] };
    case "clear":
      return { lines: [], actions: [{ type: "clear" }] };
    default:
      return { lines: [t(`${cmd}: command not found — try \`help\``, "err")] };
  }
}
