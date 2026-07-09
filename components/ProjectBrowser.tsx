"use client";
import { content } from "@/lib/content";
import { emit } from "@/lib/bus";
import { sfx } from "@/lib/audio";

const tileClass =
  "panel-frame stagger group flex h-full min-w-[13ch] cursor-pointer flex-col justify-between gap-[0.5vh] border-0 bg-transparent p-[0.8vh] text-left font-term text-accent transition-transform hover:-translate-y-[2px] [--aug-border-all:1px] [--aug-tl:7px] [--aug-br:7px]";

function ext(file: string) {
  return file.slice(file.lastIndexOf(".") + 1).toUpperCase();
}

export function ProjectBrowser() {
  const open = (i: number) => {
    sfx.init();
    sfx.play("panel");
    emit("openProject", i);
  };

  return (
    <div className="flex h-full items-stretch gap-[0.75vh] overflow-x-auto pb-[0.3vh]">
      {content.projects.map((p, i) => (
        <button
          key={p.id}
          type="button"
          data-augmented-ui="tl-clip br-clip border"
          className={tileClass}
          style={{ "--i": i } as React.CSSProperties}
          onClick={() => open(i)}
          aria-label={`Open project: ${p.title}`}
        >
          <span className="font-display text-[max(2vh,15px)] font-bold tracking-[0.1em]">
            .{ext(p.file)}
          </span>
          <span className="text-[max(1.15vh,10px)] leading-tight">
            {p.file}
            <span className="mt-[0.2vh] block text-accent/50">{p.title}</span>
          </span>
          <span className="flex items-center gap-2 text-[max(1vh,9px)] tracking-[0.15em]">
            <span
              aria-hidden
              className={`inline-block h-[0.8vh] w-[0.8vh] min-h-[5px] min-w-[5px] rounded-full ${
                p.status === "Completed" ? "bg-accent" : "bg-warn animate-[pulse-dot_1.5s_ease-in-out_infinite]"
              }`}
            />
            {p.status.toUpperCase().replace(" ", "_")}
          </span>
        </button>
      ))}

      <button type="button" data-augmented-ui="tl-clip br-clip border" className={tileClass}
        style={{ "--i": 5 } as React.CSSProperties}
        onClick={() => { emit("setTab", "about"); }} aria-label="Open about section">
        <span className="font-display text-[max(2vh,15px)] font-bold tracking-[0.1em]">.MD</span>
        <span className="text-[max(1.15vh,10px)]">about.md</span>
        <span className="text-[max(1vh,9px)] tracking-[0.15em] text-accent/50">DOC</span>
      </button>

      <button type="button" data-augmented-ui="tl-clip br-clip border" className={tileClass}
        style={{ "--i": 6 } as React.CSSProperties}
        onClick={() => { emit("setTab", "contact"); }} aria-label="Open contact section">
        <span className="font-display text-[max(2vh,15px)] font-bold tracking-[0.1em]">.SH</span>
        <span className="text-[max(1.15vh,10px)]">contact.sh</span>
        <span className="text-[max(1vh,9px)] tracking-[0.15em] text-accent/50">EXEC</span>
      </button>

      <a href={content.resumeUrl} target="_blank" rel="noopener noreferrer"
        data-augmented-ui="tl-clip br-clip border" className={`${tileClass} no-underline`}
        style={{ "--i": 7 } as React.CSSProperties} aria-label="Open resume PDF">
        <span className="font-display text-[max(2vh,15px)] font-bold tracking-[0.1em]">.PDF</span>
        <span className="text-[max(1.15vh,10px)]">Jamal_Bhola_resume.pdf</span>
        <span className="text-[max(1vh,9px)] tracking-[0.15em] text-accent/50">PDF ▸ OPEN</span>
      </a>
    </div>
  );
}
