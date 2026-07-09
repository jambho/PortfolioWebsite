"use client";
import type { TabId } from "@/lib/bus";

const TABS: { id: TabId; label: string }[] = [
  { id: "about", label: "ABOUT" },
  { id: "projects", label: "PROJECTS" },
  { id: "contact", label: "CONTACT" },
  { id: "shell", label: "SHELL" },
];

export function TabBar({ active, onSelect }: { active: TabId; onSelect: (t: TabId) => void }) {
  return (
    <ul
      role="tablist"
      aria-label="Terminal sections"
      className="m-0 flex list-none overflow-hidden border-b-2 border-accent/50 p-0 px-[2vh]"
      onKeyDown={(e) => {
        const i = TABS.findIndex((t) => t.id === active);
        if (e.key === "ArrowRight") onSelect(TABS[(i + 1) % TABS.length].id);
        if (e.key === "ArrowLeft") onSelect(TABS[(i + TABS.length - 1) % TABS.length].id);
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <li key={tab.id} className="flex-1">
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              className={`tab-skew block w-full cursor-pointer border-0 border-l border-accent/30 py-[0.6vh] text-center font-display text-[max(1.3vh,11px)] font-bold uppercase tracking-[0.15em] transition-transform first:border-l-0 ${
                isActive ? "z-10 scale-110 bg-accent text-panel" : "bg-panel/80 text-accent/70 hover:text-accent"
              }`}
            >
              <span className="block">{tab.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
