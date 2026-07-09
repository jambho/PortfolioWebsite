"use client";
import { useEffect, useState } from "react";
import { content } from "@/lib/content";

export function NetStatusPanel() {
  const [uptime, setUptime] = useState(0);
  const [ping, setPing] = useState(12);
  useEffect(() => {
    const id = setInterval(() => {
      setUptime((u) => u + 1);
      setPing(10 + Math.round(Math.random() * 6));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(Math.floor(uptime / 3600)).padStart(2, "0");
  const mm = String(Math.floor((uptime % 3600) / 60)).padStart(2, "0");
  const ss = String(uptime % 60).padStart(2, "0");

  const rows: [string, string][] = [
    ["LOC", content.contact.location],
    ["UPTIME", `${hh}:${mm}:${ss}`],
    ["LATENCY", `${ping}ms`],
    ["MODE", "OPEN_TO_WORK"],
  ];
  return (
    <dl className="m-0 flex flex-col gap-[0.45vh] font-term text-[max(1.2vh,11px)]">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-[1vh]">
          <dt className="text-accent/50">{k}</dt>
          <dd suppressHydrationWarning className="m-0 tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
