"use client";
import { useClock } from "@/hooks/useClock";

/** eDEX mod_clock: big digits, blinking colons, date line (spec §6). */
export function ClockPanel() {
  const c = useClock();
  return (
    <div className="flex flex-col items-center py-[0.5vh]">
      <div
        suppressHydrationWarning
        className="font-display text-[max(4vh,26px)] font-medium tabular-nums tracking-[0.08em]"
        aria-live="off"
      >
        {c ? (
          <>
            {c.h}
            <span className="animate-[blink_1s_linear_infinite]">:</span>
            {c.m}
            <span className="animate-[blink_1s_linear_infinite]">:</span>
            {c.s}
          </>
        ) : (
          "--:--:--"
        )}
      </div>
      <div suppressHydrationWarning className="font-term text-[max(1.1vh,10px)] tracking-[0.3em] text-accent/60">
        {c ? c.date : "LOADING"}
      </div>
    </div>
  );
}
