"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildBootLog } from "@/lib/bootLog";
import { content } from "@/lib/content";
import { sfx } from "@/lib/audio";

type Phase = "log" | "title-in" | "title-fill" | "title-border" | "title-glitch" | "title-hold" | "greet" | "done";

function lineDelay(i: number, total: number): number {
  // eDEX displayLine cadence (reference analysis §1.4)
  if (i <= 2) return 500;
  if (i === 25) return 400;
  if (i === 42) return 300;
  if (i >= total - 2) return 300;
  if (i > 4 && i < 25) return 30;
  if (i > 42 && i < 82) return 25;
  return Math.pow(1 - i / 1000, 3) * 25;
}

export function BootSequence() {
  const [active, setActive] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("log");
  const [pct, setPct] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);
  const log = useRef<string[]>([]);

  const finish = useCallback(() => {
    if (cancelled.current) return;
    cancelled.current = true;
    try {
      sessionStorage.setItem("jb-booted", "1");
    } catch {}
    document.documentElement.removeAttribute("data-booting");
    setPhase("done");
  }, []);

  // Only play when the head script armed it (first visit, motion OK).
  useEffect(() => {
    if (document.documentElement.getAttribute("data-booting") === "1") {
      log.current = buildBootLog();
      sfx.init();
      setActive(true);
    }
  }, []);

  // Skip on any key or click of the SKIP control.
  useEffect(() => {
    if (!active) return;
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  // Phase 1: the log.
  useEffect(() => {
    if (!active || phase !== "log") return;
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      if (cancelled.current) return;
      const all = log.current;
      if (i >= all.length) {
        setTimeout(() => setPhase("title-in"), 300);
        return;
      }
      setLines((prev) => [...prev, all[i]]);
      setPct(Math.round(((i + 1) / all.length) * 100));
      sfx.play(all[i] === "Boot Complete" ? "granted" : "stdout");
      i += 1;
      t = setTimeout(step, lineDelay(i, all.length));
    };
    step();
    return () => clearTimeout(t);
  }, [active, phase]);

  // Autoscroll the log.
  useEffect(() => {
    scroller.current?.scrollTo(0, scroller.current.scrollHeight);
  }, [lines]);

  // Phase 2: title card choreography (400 blank → fade-in → fill → border → glitch → hold).
  useEffect(() => {
    if (!active) return;
    if (phase === "title-in") {
      const t1 = setTimeout(() => setPhase("title-fill"), 400 + 300 + 200);
      return () => clearTimeout(t1);
    }
    if (phase === "title-fill") {
      const t = setTimeout(() => setPhase("title-border"), 300);
      return () => clearTimeout(t);
    }
    if (phase === "title-border") {
      const t = setTimeout(() => setPhase("title-glitch"), 100);
      return () => clearTimeout(t);
    }
    if (phase === "title-glitch") {
      const t = setTimeout(() => setPhase("title-hold"), 500);
      return () => clearTimeout(t);
    }
    if (phase === "title-hold") {
      const t = setTimeout(() => setPhase("greet"), 700);
      return () => clearTimeout(t);
    }
    if (phase === "greet") {
      // Lift the overlay so the cockpit entrance staggers play beneath the greeting.
      try {
        sessionStorage.setItem("jb-booted", "1");
      } catch {}
      document.documentElement.removeAttribute("data-booting");
      sfx.play("expand");
      for (let i = 0; i < 11; i++) {
        setTimeout(() => sfx.play("panel"), 200 + i * 120); // one blip per staggered panel
      }
      const t = setTimeout(() => finish(), 1400);
      return () => clearTimeout(t);
    }
  }, [active, phase, finish]);

  if (!active || phase === "done") return null;

  const name = `${content.identity.first} ${content.identity.last}`;
  const isTitle = phase.startsWith("title");

  return (
    <div
      className={`fixed inset-0 z-[90] bg-abyss font-term text-[max(1.4vh,12px)] leading-[1.35] text-accent ${
        phase === "greet" ? "pointer-events-none bg-transparent" : ""
      }`}
      aria-label="Boot animation"
    >
      {phase === "log" && (
        <>
          <div ref={scroller} className="h-full overflow-hidden p-[1vh] flex flex-col justify-end">
            <div>
              {lines.map((l, n) => (
                <div key={n} className={l.startsWith("  ") ? "text-accent/60" : undefined}>
                  {l}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-[1vh] right-[1.5vh] tracking-[0.2em] text-accent/70">
            BOOTING… {pct}%
          </div>
        </>
      )}

      {isTitle && (
        <div className="flex h-full items-center justify-center">
          <h1
            className={`relative m-0 select-none px-[2vh] pt-[1vh] text-center font-display text-[10vh] font-bold uppercase tracking-[0.08em] ${
              phase === "title-in" ? "animate-[fade-in_300ms_linear_400ms_both]" : "" /* 400ms blank beat, then fade */
            } ${phase === "title-fill" ? "bg-accent text-abyss" : ""} ${
              phase === "title-border" || phase === "title-hold" ? "border-[5px] border-accent" : ""
            } ${phase === "title-glitch" ? "text-transparent" : "border-b-[0.46vh] border-b-accent"}`}
            data-text={name}
          >
            {name}
            {phase === "title-glitch" && (
              <>
                <span aria-hidden className="absolute inset-0 block text-accent/80 [clip-path:polygon(100%_0%,100%_40%,0%_40%,0%_0%)] animate-[derezz-top_50ms_linear_infinite_alternate-reverse]">
                  {name}
                </span>
                <span aria-hidden className="absolute inset-0 block text-accent/90 [clip-path:polygon(100%_40%,100%_100%,0%_100%,0%_40%)] animate-[derezz-bottom_50ms_linear_infinite_alternate-reverse]">
                  {name}
                </span>
              </>
            )}
          </h1>
        </div>
      )}

      {phase === "greet" && (
        <div className="flex h-full items-center justify-center">
          <p className="animate-[flicker-in_400ms_linear_both] font-display text-[3.9vh]">
            Welcome, <em className="not-italic font-bold">visitor</em>
          </p>
        </div>
      )}

      {phase !== "greet" && (
        <button
          type="button"
          onClick={finish}
          className="absolute bottom-[1vh] left-[1.5vh] cursor-pointer border border-accent/50 bg-transparent px-3 py-1 font-term text-[max(1.2vh,11px)] uppercase tracking-[0.2em] text-accent/80 hover:bg-accent hover:text-abyss"
        >
          SKIP ▸
        </button>
      )}
    </div>
  );
}
