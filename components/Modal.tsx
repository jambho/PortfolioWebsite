"use client";
import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = { title: string; onClose: () => void; children: ReactNode };

/** augmented-ui framed dialog: focus-trapped, Esc/backdrop close (spec §6). */
export function Modal({ title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const focusables = ref.current.querySelectorAll<HTMLElement>(
          'a[href], button, input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-abyss/70 p-[2vh] backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        data-augmented-ui="tl-clip tr-clip br-clip bl-clip border"
        className="panel-frame max-h-[86vh] w-full max-w-[90ch] overflow-y-auto p-[2.5vh] outline-none animate-[flicker-in_180ms_linear_both]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hairline mb-[1.5vh] flex items-start justify-between pb-[0.5vh]">
          <h2 className="m-0 font-display text-[max(2.4vh,18px)] font-bold uppercase tracking-[0.1em]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer border border-accent/50 bg-transparent px-2 font-term text-accent hover:bg-accent hover:text-panel"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
