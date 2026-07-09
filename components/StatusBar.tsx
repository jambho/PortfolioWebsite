"use client";
import { useCallback, useEffect } from "react";
import { useClock } from "@/hooks/useClock";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { THEME_NAMES, isTheme } from "@/lib/themes";
import { sfx } from "@/lib/audio";
import { content } from "@/lib/content";

/** Top strip: brand · theme/sound/fx controls · live clock (spec §5, §6). */
export function StatusBar() {
  const clock = useClock();
  const [theme, setTheme] = useLocalStorage("jb-theme");
  const [sound, setSound] = useLocalStorage("jb-sound");
  const [fx, setFx] = useLocalStorage("jb-fx");

  useEffect(() => {
    const t = theme && isTheme(theme) ? theme : "tron";
    document.documentElement.setAttribute("data-theme", t);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-fx", fx === "off" ? "off" : "on");
  }, [fx]);

  const cycleTheme = useCallback(() => {
    const current = theme && isTheme(theme) ? theme : "tron";
    const next = THEME_NAMES[(THEME_NAMES.indexOf(current) + 1) % THEME_NAMES.length];
    setTheme(next);
    sfx.init();
    sfx.play("theme");
  }, [theme, setTheme]);

  const toggleSound = useCallback(() => {
    const on = sound !== "on";
    setSound(on ? "on" : "off");
    sfx.setEnabled(on);
    sfx.init();
    if (on) sfx.play("granted");
  }, [sound, setSound]);

  const btn =
    "cursor-pointer bg-transparent border-0 p-0 font-term text-[max(1.2vh,11px)] uppercase tracking-[0.12em] text-accent/70 hover:text-accent transition-colors";

  return (
    <header className="stagger flex items-center justify-between px-[1vh] font-term text-[max(1.2vh,11px)] uppercase tracking-[0.12em] max-lg:sticky max-lg:top-0 max-lg:z-50 max-lg:bg-panel/95 max-lg:py-2" style={{ "--i": 0 } as React.CSSProperties}>
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[max(1.6vh,13px)] font-bold tracking-[0.2em]">
          JB://PORTFOLIO
        </span>
        <span className="text-accent/50">v2.0</span>
        <span suppressHydrationWarning className="text-accent/40 max-md:hidden">
          © {new Date().getFullYear()} JAMAL BHOLA · {`${content.footer}`}
        </span>
      </div>
      <div className="flex items-center gap-[2vh]">
        <button type="button" className={btn} onClick={cycleTheme} aria-label="Cycle color theme">
          THM◇{theme && isTheme(theme) ? theme : "tron"}
        </button>
        <button type="button" className={btn} onClick={toggleSound} aria-pressed={sound === "on"} aria-label="Toggle sound">
          SND {sound === "on" ? "◉" : "○"}
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => setFx(fx === "off" ? "on" : "off")}
          aria-pressed={fx !== "off"}
          aria-label="Toggle CRT effects"
        >
          FX {fx === "off" ? "○" : "◉"}
        </button>
        <span suppressHydrationWarning className="tabular-nums text-accent">
          {clock ? `${clock.h}:${clock.m}:${clock.s}` : "--:--:--"}
        </span>
      </div>
    </header>
  );
}
