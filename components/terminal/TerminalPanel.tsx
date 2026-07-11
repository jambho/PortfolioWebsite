"use client";
import { useEffect, useState, type ReactNode } from "react";
import { TabBar } from "./TabBar";
import { onBus, type TabId } from "@/lib/bus";
import { sfx } from "@/lib/audio";

const VALID: TabId[] = ["about", "projects", "experience", "contact", "shell"];

function tabFromHash(): TabId {
  if (typeof window === "undefined") return "about";
  const h = window.location.hash.replace("#", "");
  return (VALID as string[]).includes(h) ? (h as TabId) : "about";
}

type Props = {
  about: ReactNode;
  projects: ReactNode;
  experience: ReactNode;
  contact: ReactNode;
  shell: ReactNode;
};

/** Center stage: trapezoid tabs + routed tab panels, hash-synced (spec §6). */
export function TerminalPanel(props: Props) {
  const [active, setActive] = useState<TabId>("about");

  useEffect(() => {
    setActive(tabFromHash());
    const onHash = () => setActive(tabFromHash());
    window.addEventListener("hashchange", onHash);
    const off = onBus("setTab", (t) => select(t));
    return () => {
      window.removeEventListener("hashchange", onHash);
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (t: TabId) => {
    setActive(t);
    try {
      history.replaceState(null, "", `#${t}`);
    } catch {}
    sfx.init();
    sfx.play("panel");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <TabBar active={active} onSelect={select} />
      {VALID.map((id) => (
        <div
          key={id}
          role="tabpanel"
          id={`tabpanel-${id}`}
          hidden={active !== id}
          className="min-h-0 flex-1 overflow-y-auto p-[1vh] font-term text-[max(1.5vh,13px)] leading-[1.5]"
        >
          {props[id]}
        </div>
      ))}
    </div>
  );
}
