import { Panel } from "@/components/Panel";
import { StatusBar } from "@/components/StatusBar";
import { BootSequence } from "@/components/BootSequence";
import { ClockPanel } from "@/components/panels/ClockPanel";
import { OperatorPanel } from "@/components/panels/OperatorPanel";
import { SkillsPanel } from "@/components/panels/SkillsPanel";
import { ProcessPanel } from "@/components/panels/ProcessPanel";
import { MemoryPanel } from "@/components/panels/MemoryPanel";
import { WidgetBoundary } from "@/components/WidgetBoundary";
import { GlobePanel } from "@/components/panels/GlobePanel";
import { ContactPanel } from "@/components/panels/ContactPanel";
import { NetStatusPanel } from "@/components/panels/NetStatusPanel";
import { ActivityPanel } from "@/components/panels/ActivityPanel";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { AboutTab } from "@/components/terminal/AboutTab";
import { ProjectsTab } from "@/components/terminal/ProjectsTab";
import { ExperienceTab } from "@/components/terminal/ExperienceTab";
import { ContactTab } from "@/components/terminal/ContactTab";
import { ShellTab } from "@/components/terminal/ShellTab";
import { MatrixRain } from "@/components/MatrixRain";
import { ProjectModalHost } from "@/components/ProjectModalHost";
import { ProjectBrowser } from "@/components/ProjectBrowser";

function MobileSection({ title, defaultOpen = false, children }: {
  title: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  return (
    <>
      <div className="contents max-lg:hidden">{children}</div>
      <details className="hidden max-lg:block" open={defaultOpen}>
        <summary className="cursor-pointer list-none px-[1vh] py-[1.2vh] font-display text-[max(1.4vh,12px)] font-bold uppercase tracking-[0.2em] text-accent/70 hover:text-accent">
          ▸ {title}
        </summary>
        <div className="flex flex-col gap-[0.75vh]">{children}</div>
      </details>
    </>
  );
}

export default function Home() {
  return (
    <div className="cockpit-root grid-bg fixed inset-0 grid grid-rows-[3vh_1fr_22vh] gap-[0.75vh] p-[1vh] max-lg:static max-lg:min-h-screen max-lg:grid-rows-none max-lg:grid-cols-1 max-lg:overflow-auto">
      <BootSequence />
      <a
        href="#terminal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:bg-panel focus:p-2 focus:text-accent"
      >
        Skip to content
      </a>
      <StatusBar />

      <div className="grid min-h-0 grid-cols-[17%_1fr_17%] gap-[0.75vh] max-lg:grid-cols-1">
        {/* LEFT — PANEL // SYSTEM */}
        <div className="flex min-h-0 flex-col justify-between gap-[0.75vh] max-lg:order-2">
          <MobileSection title="PANEL // SYSTEM" defaultOpen>
            <Panel index={1} titleLeft="CLOCK" titleRight="LOCAL"><ClockPanel /></Panel>
            <Panel index={3} titleLeft="OPERATOR" titleRight="ID"><OperatorPanel /></Panel>
            <Panel index={5} titleLeft="SKILLS" titleRight="PROF"><SkillsPanel /></Panel>
            <Panel index={7} titleLeft="PROC" titleRight="TOP"><ProcessPanel /></Panel>
            <Panel index={9} titleLeft="MEM" titleRight="HEAP">
              <WidgetBoundary fallbackLabel="MEM OFFLINE"><MemoryPanel /></WidgetBoundary>
            </Panel>
          </MobileSection>
        </div>

        {/* CENTER — TERMINAL */}
        <Panel
          index={0}
          titleLeft="TERMINAL"
          titleRight="MAIN SHELL"
          aug="bl-clip tr-clip border"
          className="min-h-[40vh] max-lg:h-[60vh]"
        >
          <div id="terminal" className="h-full">
            <TerminalPanel
              about={<AboutTab />}
              projects={<ProjectsTab />}
              experience={<ExperienceTab />}
              contact={<ContactTab />}
              shell={<ShellTab />}
            />
          </div>
        </Panel>

        {/* RIGHT — PANEL // NETWORK */}
        <div className="flex min-h-0 flex-col justify-between gap-[0.75vh] max-lg:order-3">
          <MobileSection title="PANEL // NETWORK">
            <Panel index={2} titleLeft="WORLD" titleRight="GEO">
              <WidgetBoundary fallbackLabel="GLOBE OFFLINE"><GlobePanel /></WidgetBoundary>
            </Panel>
            <Panel index={4} titleLeft="UPLINKS" titleRight="CONN"><ContactPanel /></Panel>
            <Panel index={6} titleLeft="NETSTAT" titleRight="LIVE"><NetStatusPanel /></Panel>
            <Panel index={8} titleLeft="TRAFFIC" titleRight="NET">
              <WidgetBoundary fallbackLabel="NET OFFLINE"><ActivityPanel /></WidgetBoundary>
            </Panel>
          </MobileSection>
        </div>
      </div>

      {/* BOTTOM — PROJECT ARCHIVE */}
      <Panel index={10} titleLeft="FILES" titleRight="PROJECT_ARCHIVE" className="max-lg:order-4 max-lg:h-auto">
        <ProjectBrowser />
      </Panel>

      <div className="scanlines" aria-hidden />
      <MatrixRain />
      <ProjectModalHost />
    </div>
  );
}
