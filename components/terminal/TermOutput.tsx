import type { TermLine } from "@/lib/terminal/commands";

const KIND_CLASS: Record<NonNullable<TermLine["kind"]>, string> = {
  out: "",
  ok: "text-accent font-bold",
  err: "text-error",
  dim: "text-accent/50",
  head: "font-display text-[max(2vh,16px)] font-bold uppercase tracking-[0.1em]",
};

export function TermOutput({ lines }: { lines: TermLine[] }) {
  return (
    <div className="whitespace-pre-wrap break-words">
      {lines.map((l, i) => (
        <div key={i} className={l.kind ? KIND_CLASS[l.kind] : ""}>
          {l.text || " "}
        </div>
      ))}
    </div>
  );
}
