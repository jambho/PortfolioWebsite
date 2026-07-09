"use client";
import { useEffect, useRef } from "react";

type TickFn = (dt: number, t: number) => void;

const subs = new Set<TickFn>();
let raf = 0;
let last = 0;
let running = false;

function loop(now: number) {
  const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
  last = now;
  subs.forEach((fn) => fn(dt, now / 1000));
  raf = requestAnimationFrame(loop);
}

function start() {
  if (!running && subs.size > 0 && !document.hidden) {
    running = true;
    last = 0;
    raf = requestAnimationFrame(loop);
  }
}
function stop() {
  running = false;
  cancelAnimationFrame(raf);
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
}

/** Shared rAF hub (spec §9.2): one loop for all canvases; pauses when tab hidden. */
export function useTicker(cb: TickFn, active = true) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!active) return;
    const fn: TickFn = (dt, t) => ref.current(dt, t);
    subs.add(fn);
    start();
    return () => {
      subs.delete(fn);
      if (subs.size === 0) stop();
    };
  }, [active]);
}
