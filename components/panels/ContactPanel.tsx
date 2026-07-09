import { content } from "@/lib/content";

const uplinks = [
  { label: "EMAIL", href: `mailto:${content.contact.email}` },
  ...content.contact.links.map((l) => ({ label: l.label, href: l.href })),
  { label: "RESUME.PDF", href: content.resumeUrl },
];

export function ContactPanel() {
  return (
    <ul className="m-0 flex list-none flex-col gap-[0.45vh] p-0 font-term text-[max(1.2vh,11px)]">
      {uplinks.map((u) => (
        <li key={u.label}>
          <a
            href={u.href}
            target={u.href.startsWith("/") || u.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="group flex items-baseline justify-between gap-[1vh] text-accent no-underline hover:bg-accent/10"
          >
            <span>
              <span className="text-accent/50 transition-transform group-hover:translate-x-[2px]">▸ </span>
              {u.label}
            </span>
            <span className="text-[max(1vh,9px)] tracking-[0.15em] text-accent/40 group-hover:text-accent/80 group-hover:animate-[flicker-in_180ms_linear]">
              ESTABLISHED
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
