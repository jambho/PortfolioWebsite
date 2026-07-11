"use client";

// The public overloads below give callers precise callback types; the
// implementation signature must stay assignable-from all of them, so its
// callback param is intentionally `any` (contravariance would otherwise reject
// the typed overloads under strictFunctionTypes).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (detail: any) => void;
const PREFIX = "jb:";

export type TabId = "about" | "projects" | "experience" | "contact" | "shell";

export function emit(name: "openProject", detail: number): void;
export function emit(name: "setTab", detail: TabId): void;
export function emit(name: "matrix"): void;
export function emit(name: string, detail?: unknown): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PREFIX + name, { detail }));
}

export function onBus(name: "openProject", cb: (n: number) => void): () => void;
export function onBus(name: "setTab", cb: (t: TabId) => void): () => void;
export function onBus(name: "matrix", cb: () => void): () => void;
export function onBus(name: string, cb: Handler): () => void {
  if (typeof window === "undefined") return () => {};
  const h = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener(PREFIX + name, h);
  return () => window.removeEventListener(PREFIX + name, h);
}
