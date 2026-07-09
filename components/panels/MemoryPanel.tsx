"use client";
import { useEffect, useRef } from "react";
import { useTicker } from "@/hooks/useTicker";

const COLS = 24;
const ROWS = 8;

export function MemoryPanel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cells = useRef<Float32Array>(new Float32Array(COLS * ROWS));
  const target = useRef(0.65);

  useEffect(() => {
    const c = cells.current;
    for (let i = 0; i < c.length; i++) c[i] = Math.random() < 0.65 ? 1 : 0;
  }, []);

  useTicker((dt, t) => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;

    target.current = 0.675 + Math.sin(t * 0.23) * 0.125; // wanders 55–80%
    const c = cells.current;
    // toggle a few random cells toward the target ratio each frame
    for (let n = 0; n < 3; n++) {
      const i = Math.floor(Math.random() * c.length);
      const lit = c.reduce((a, v) => a + (v > 0.5 ? 1 : 0), 0) / c.length;
      c[i] = lit < target.current ? 1 : 0;
    }

    const w = (el.width = el.clientWidth * devicePixelRatio);
    const h = (el.height = el.clientHeight * devicePixelRatio);
    const cw = w / COLS;
    const ch = h / ROWS;
    const style = getComputedStyle(document.documentElement);
    const rgb = `${style.getPropertyValue("--color-r")} ${style.getPropertyValue("--color-g")} ${style.getPropertyValue("--color-b")}`;
    ctx.clearRect(0, 0, w, h);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const v = c[y * COLS + x];
        ctx.fillStyle = `rgb(${rgb} / ${v > 0.5 ? 0.9 : 0.15})`;
        ctx.fillRect(x * cw + cw * 0.25, y * ch + ch * 0.25, cw * 0.5, ch * 0.5);
      }
    }
  });

  return (
    <div>
      <canvas ref={canvas} aria-hidden className="h-[7vh] min-h-[48px] w-full" />
      <div className="mt-[0.3vh] flex justify-between font-term text-[max(1vh,9px)] tracking-[0.2em] text-accent/50">
        <span>HEAP://SKILL_CACHE</span>
        <span className="sr-only">Decorative memory visualization</span>
      </div>
    </div>
  );
}
