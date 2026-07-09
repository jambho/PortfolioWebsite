"use client";
import { useCallback, useState } from "react";

/** Guarded localStorage (Safari private mode etc. — spec §14). */
export function useLocalStorage(key: string): [string | null, (v: string) => void] {
  const [value, setValue] = useState<string | null>(() => {
    try {
      return typeof window === "undefined" ? null : localStorage.getItem(key);
    } catch {
      return null;
    }
  });
  const set = useCallback(
    (v: string) => {
      setValue(v);
      try {
        localStorage.setItem(key, v);
      } catch {}
    },
    [key]
  );
  return [value, set];
}
