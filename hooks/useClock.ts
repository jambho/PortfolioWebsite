"use client";
import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Returns null until mounted (hydration safety — spec §13). */
export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  return {
    h: pad(now.getHours()),
    m: pad(now.getMinutes()),
    s: pad(now.getSeconds()),
    date: now
      .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
      .toUpperCase(),
  };
}
