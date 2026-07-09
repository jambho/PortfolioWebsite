import { content } from "@/lib/content";

function level(name: string): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 70 + (h % 26); // 70–95
}

const SEGMENTS = 10;

export function SkillsPanel() {
  return (
    <div className="flex flex-col gap-[0.8vh]">
      {content.skills.map((group) => (
        <div key={group.label}>
          <div className="mb-[0.3vh] font-display text-[max(1.1vh,10px)] font-bold uppercase tracking-[0.2em] text-accent/60">
            {group.label}
          </div>
          <ul className="m-0 flex list-none flex-col gap-[0.25vh] p-0 font-term text-[max(1.15vh,10px)]">
            {group.skills.map((skill) => {
              const lit = Math.round((level(skill) / 100) * SEGMENTS);
              return (
                <li key={skill} className="flex items-center justify-between gap-[1vh]">
                  <span>{skill}</span>
                  <span
                    className="flex gap-[2px]"
                    role="meter"
                    aria-valuenow={level(skill)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${skill} proficiency`}
                  >
                    {Array.from({ length: SEGMENTS }, (_, i) => (
                      <span
                        key={i}
                        aria-hidden
                        className={`inline-block h-[1vh] w-[0.45vh] min-h-[7px] min-w-[3px] ${
                          i < lit ? "bg-accent" : "bg-accent/20"
                        }`}
                      />
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
