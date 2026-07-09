import { content } from "@/lib/content";
import { PROMPT } from "@/lib/terminal/commands";

const rows = [
  { label: "EMAIL", href: `mailto:${content.contact.email}`, text: content.contact.email },
  ...content.contact.links.map((l) => ({ label: l.label, href: l.href, text: l.href })),
  { label: "RESUME", href: content.resumeUrl, text: "Jamal_Bhola_resume.pdf" },
];

export function ContactTab() {
  return (
    <div>
      <div className="text-accent/60">
        <span className="text-accent/40">{PROMPT} </span>./contact.sh --list
      </div>
      <p className="my-[1vh] font-bold text-accent">{content.contact.cta}</p>
      <dl className="m-0">
        {rows.map((r) => (
          <div key={r.label} className="flex gap-[2vh]">
            <dt className="w-[9ch] shrink-0 text-accent/50">{r.label}</dt>
            <dd className="m-0">
              <a className="text-accent underline-offset-4 hover:underline" href={r.href}
                 target={r.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                {r.text}
              </a>
            </dd>
          </div>
        ))}
        <div className="flex gap-[2vh]">
          <dt className="w-[9ch] shrink-0 text-accent/50">LOCATION</dt>
          <dd className="m-0">{content.contact.location}</dd>
        </div>
      </dl>
      <div className="mt-[1vh] text-accent/50">
        PING jamal.bhola ({content.contact.location}): 32 bytes, time=0.4ms — reachable.
      </div>
    </div>
  );
}
