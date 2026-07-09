import { content } from "@/lib/content";

const rows: [string, string][] = [
  ["NAME", content.identity.name],
  ["ROLE", content.identity.tagline],
  ["EDU", `B.S. Computer Engineering — ${content.identity.school}`],
  ["LOC", content.identity.location],
];

export function OperatorPanel() {
  return (
    <dl className="m-0 flex flex-col gap-[0.5vh] font-term text-[max(1.25vh,11px)] leading-snug">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-[1vh]">
          <dt className="w-[5ch] shrink-0 text-accent/50">{k}</dt>
          <dd className="m-0">{v}</dd>
        </div>
      ))}
      <div className="flex gap-[1vh]">
        <dt className="w-[5ch] shrink-0 text-accent/50">STAT</dt>
        <dd className="m-0 flex items-center gap-2">
          <span aria-hidden className="inline-block h-[0.9vh] w-[0.9vh] rounded-full bg-accent animate-[pulse-dot_2s_ease-in-out_infinite]" />
          ONLINE
        </dd>
      </div>
    </dl>
  );
}
