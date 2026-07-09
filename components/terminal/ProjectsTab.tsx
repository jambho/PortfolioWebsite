"use client";
import { content } from "@/lib/content";
import { emit } from "@/lib/bus";
import { PROMPT } from "@/lib/terminal/commands";

export function ProjectsTab() {
  return (
    <div>
      <div className="text-accent/60">
        <span className="text-accent/40">{PROMPT} </span>ls -la ./projects
      </div>
      <div className="text-accent/50">total {content.projects.length}</div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-accent/50">
            <th className="font-normal">#</th>
            <th className="font-normal">FILE</th>
            <th className="font-normal max-md:hidden">STATUS</th>
            <th className="font-normal max-md:hidden">DATE</th>
          </tr>
        </thead>
        <tbody>
          {content.projects.map((p, i) => (
            <tr
              key={p.id}
              className="cursor-pointer hover:bg-accent/10"
              onClick={() => emit("openProject", i)}
            >
              <td className="pr-2 text-accent/60">{i + 1}</td>
              <td className="pr-2">
                <button type="button" className="cursor-pointer border-0 bg-transparent p-0 font-term text-[inherit] text-accent underline-offset-4 hover:underline">
                  {p.file}
                </button>
                <span className="block text-accent/50">{p.title}</span>
              </td>
              <td className={`pr-2 max-md:hidden ${p.status === "Completed" ? "text-accent" : "text-warn"}`}>
                {p.status.toUpperCase().replace(" ", "_")}
              </td>
              <td className="text-accent/60 max-md:hidden">{p.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-[1vh] text-accent/50">{"hint: click a file — or switch to SHELL and `open <n>`"}</div>
    </div>
  );
}
