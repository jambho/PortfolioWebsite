"use client";
import { useRef } from "react";
import { useTicker } from "@/hooks/useTicker";

const N = 64;

export function ActivityPanel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const values = useRef<number[]>(Array.from({ length: N }, () => 0.2));
  const acc = useRef(0);

  useTicker((dt) => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    acc.current += dt;
    if (acc.current > 0.1) {
      acc.current = 0;
      const v = values.current;
      const last = v[v.length - 1];
      const next = Math.max(0.05, Math.min(1, last + (Math.random() - 0.48) * 0.3));
      v.push(Math.random() < 0.06 ? Math.min(1, next + 0.5) : next); // occasional spike
      v.shift();
    }
    const dpr = devicePixelRatio || 1;
    const w = (el.width = el.clientWidth * dpr);
    const h = (el.height = el.clientHeight * dpr);
    const style = getComputedStyle(document.documentElement);
    const rgb = `${style.getPropertyValue("--color-r")} ${style.getPropertyValue("--color-g")} ${style.getPropertyValue("--color-b")}`;
    ctx.clearRect(0, 0, w, h);
    const bw = w / N;
    for (let i = 0; i < N; i++) {
      const v = values.current[i];
      ctx.fillStyle = `rgb(${rgb} / ${0.3 + v * 0.6})`;
      ctx.fillRect(i * bw, h - v * h, Math.max(1, bw - dpr), v * h);
    }
    ctx.strokeStyle = `rgb(${rgb} / 0.3)`;
    ctx.strokeRect(0, 0, w, h);
  });

  return (
    <div>
      <canvas ref={canvas} aria-hidden className="h-[6vh] min-h-[40px] w-full" />
      <div className="mt-[0.3vh] font-term text-[max(1vh,9px)] tracking-[0.25em] text-accent/50">
        NET://TRAFFIC
        <span className="sr-only">Decorative network activity graph</span>
      </div>
    </div>
  );
}
