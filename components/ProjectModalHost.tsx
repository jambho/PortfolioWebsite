"use client";
import { useEffect, useState } from "react";
import { onBus } from "@/lib/bus";
import { content } from "@/lib/content";
import { Modal } from "./Modal";
import { sfx } from "@/lib/audio";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-[1.5vh]">
      <h3 className="m-0 mb-[0.4vh] font-display text-[max(1.4vh,12px)] font-bold uppercase tracking-[0.2em] text-accent/60">
        {label}
      </h3>
      <div className="font-term text-[max(1.5vh,13px)] leading-relaxed">{children}</div>
    </section>
  );
}

export function ProjectModalHost() {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(
    () =>
      onBus("openProject", (i) => {
        if (i >= 0 && i < content.projects.length) {
          setIndex(i);
          sfx.init();
          sfx.play("expand");
        }
      }),
    []
  );

  if (index === null) return null;
  const p = content.projects[index];

  return (
    <Modal title={p.title} onClose={() => setIndex(null)}>
      <div className="mb-[1.5vh] flex flex-wrap gap-x-[2vh] gap-y-1 font-term text-[max(1.2vh,11px)] text-accent/60">
        <span>STATUS: <span className={p.status === "Completed" ? "text-accent" : "text-warn"}>{p.status.toUpperCase().replace(" ", "_")}</span></span>
        <span>DATE: {p.date}</span>
        <span>ROLE: {p.role}</span>
      </div>

      {p.metrics?.length ? (
        <div className="mb-[1.5vh] flex flex-wrap gap-[0.75vh]">
          {p.metrics.map((m) => (
            <div
              key={m.label}
              data-augmented-ui="tl-clip br-clip border"
              className="min-w-[10ch] px-3 py-1.5 [--aug-border-all:1px] [--aug-border-bg:var(--accent-30)] [--aug-tl:6px] [--aug-br:6px]"
            >
              <div className="font-display text-[max(2.2vh,18px)] font-bold leading-tight text-accent">
                {m.value}
              </div>
              <div className="font-term text-[max(1vh,9px)] tracking-[0.15em] text-accent/50">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Section label="Dossier">{p.longDescription}</Section>

      <Section label="Key Features">
        <ul className="m-0 list-none p-0">
          {p.features.map((f) => (
            <li key={f} className="flex gap-2">
              <span aria-hidden className="text-accent">→</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Challenges">{p.challenges}</Section>
      <Section label="Results">{p.results}</Section>

      <Section label="Stack">
        <ul className="m-0 flex list-none flex-wrap gap-[0.6vh] p-0">
          {p.tech.map((tch) => (
            <li key={tch} data-augmented-ui="tl-clip br-clip border"
                className="px-2 py-0.5 font-term text-[max(1.2vh,11px)] [--aug-border-all:1px] [--aug-border-bg:var(--accent-30)] [--aug-tl:5px] [--aug-br:5px]">
              {tch}
            </li>
          ))}
        </ul>
      </Section>

      {p.github ? (
        <a
          href={p.github}
          target="_blank"
          rel="noopener noreferrer"
          data-augmented-ui="tl-clip br-clip border"
          className="inline-block px-4 py-2 font-display font-bold uppercase tracking-[0.15em] text-accent no-underline [--aug-border-all:2px] [--aug-border-bg:var(--accent-50)] hover:bg-accent hover:text-panel"
        >
          View Code ▸
        </a>
      ) : (
        <span className="font-term text-[max(1.2vh,11px)] text-accent/40">
          SOURCE: PRIVATE ARCHIVE
        </span>
      )}
    </Modal>
  );
}
