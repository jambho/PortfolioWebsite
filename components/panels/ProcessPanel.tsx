"use client";
import { useEffect, useState } from "react";
import { content } from "@/lib/content";

type Proc = { pid: number; name: string; cpu: number };

const seed: Proc[] = content.projects.map((p, i) => ({
  pid: 1000 + i * 137,
  name: p.file,
  cpu: 2 + ((i * 7) % 9),
}));

export function ProcessPanel() {
  const [procs, setProcs] = useState(seed);
  useEffect(() => {
    const id = setInterval(() => {
      setProcs((ps) =>
        ps.map((p) => ({
          ...p,
          cpu: Math.max(0.4, Math.min(24, p.cpu + (Math.random() - 0.5) * 4)),
        }))
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <table className="w-full border-collapse font-term text-[max(1.1vh,10px)] leading-relaxed">
      <thead>
        <tr className="text-left text-accent/50">
          <th className="font-normal">PID</th>
          <th className="font-normal">NAME</th>
          <th className="text-right font-normal">CPU%</th>
        </tr>
      </thead>
      <tbody suppressHydrationWarning>
        {procs.map((p) => (
          <tr key={p.pid}>
            <td className="text-accent/60">{p.pid}</td>
            <td>{p.name}</td>
            <td className="text-right tabular-nums">{p.cpu.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
