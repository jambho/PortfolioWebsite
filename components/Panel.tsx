import type { ReactNode } from "react";

type PanelProps = {
  index?: number;
  titleLeft: string;
  titleRight?: string;
  aug?: string;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

/**
 * eDEX panel chrome (spec §4.3): chamfered aug frame, two-part uppercase
 * title bar with end-ticked hairline, staggered entrance via --i.
 */
export function Panel({
  index = 0,
  titleLeft,
  titleRight,
  aug = "tl-clip br-clip border",
  className = "",
  bodyClassName = "",
  children,
}: PanelProps) {
  return (
    <section
      data-augmented-ui={aug}
      className={`panel-frame stagger relative flex min-h-0 flex-col p-[0.9vh] ${className}`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <h3 className="hairline stagger-title mb-[0.7vh] flex justify-between gap-2 pb-[0.3vh] font-display text-[max(1.1vh,10px)] font-bold uppercase tracking-[0.15em]">
        <p className="m-0">{titleLeft}</p>
        {titleRight ? <p className="m-0 text-right opacity-70">{titleRight}</p> : null}
      </h3>
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
