"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Char-by-char reveal with a small burst jitter (dex-ui AnimatedText).
 * cps = characters per second. skip() completes instantly.
 */
export function useTypewriter(text: string, cps = 40) {
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    const step = Math.max(1000 / cps, 8);
    timer.current = setInterval(() => {
      setCount((c) => {
        const burst = 1 + (Math.random() < 0.2 ? 2 : 0); // occasional 3-char burst
        const next = Math.min(c + burst, text.length);
        if (next >= text.length && timer.current) clearInterval(timer.current);
        return next;
      });
    }, step);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [text, cps]);

  const skip = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    setCount(text.length);
  }, [text]);

  return { out: text.slice(0, count), done: count >= text.length, skip };
}
