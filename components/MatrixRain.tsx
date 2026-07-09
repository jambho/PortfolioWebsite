"use client";
import { useEffect, useRef, useState } from "react";
import { onBus } from "@/lib/bus";

/** 4s digital-rain overlay for the `matrix` easter egg (spec §6). */
export function MatrixRain() {
  const [active, setActive] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => onBus("matrix", () => setActive(true)), []);

  useEffect(() => {
    if (!active) return;
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const dpr = devicePixelRatio || 1;
    el.width = innerWidth * dpr;
    el.height = innerHeight * dpr;
    const fs = 16 * dpr;
    const cols = Math.floor(el.width / fs);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789JBJAMALBHOLA";
    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "rgb(0 0 0 / 0.08)";
      ctx.fillRect(0, 0, el.width, el.height);
      ctx.font = `${fs}px monospace`;
      const style = getComputedStyle(document.documentElement);
      ctx.fillStyle = `rgb(${style.getPropertyValue("--color-r")} ${style.getPropertyValue("--color-g")} ${style.getPropertyValue("--color-b")})`;
      drops.forEach((y, i) => {
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fs, y * fs);
        drops[i] = y * fs > el.height && Math.random() > 0.98 ? 0 : y + 1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => setActive(false), 4000);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvas} aria-hidden className="fixed inset-0 z-[80] h-full w-full bg-abyss/80" />;
}
