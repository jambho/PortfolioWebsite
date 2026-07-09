"use client";
import { useMemo } from "react";
import { runCommand, PROMPT } from "@/lib/terminal/commands";
import { TermOutput } from "./TermOutput";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AboutTab() {
  const lines = useMemo(() => runCommand("about").lines, []);
  const reduced = useReducedMotion();
  const { out, done } = useTypewriter(reduced ? "" : "cat about.md", 25);

  return (
    <div>
      <div className="text-accent/60">
        <span className="text-accent/40">{PROMPT} </span>
        {reduced ? "cat about.md" : out}
        {!done && !reduced ? <span className="animate-[blink_1s_linear_infinite]">▊</span> : null}
      </div>
      <div className={done || reduced ? "animate-[fade-in_300ms_both]" : "invisible h-0 overflow-hidden"} aria-hidden={!(done || reduced)}>
        <TermOutput lines={lines} />
      </div>
      {/* Always-present crawlable copy of the text while animation gates visibility */}
      {!(done || reduced) ? <div className="sr-only"><TermOutput lines={lines} /></div> : null}
    </div>
  );
}
