import { Panel } from "@/components/Panel";
import { StatusBar } from "@/components/StatusBar";

function Standby() {
  return (
    <div className="flex h-full items-center justify-center py-[2vh] font-term text-[max(1.1vh,10px)] tracking-[0.3em] text-accent/40">
      STANDBY
    </div>
  );
}

export default function Home() {
  return (
    <div className="cockpit-root grid-bg fixed inset-0 grid grid-rows-[3vh_1fr_22vh] gap-[0.75vh] p-[1vh] max-lg:static max-lg:min-h-screen max-lg:grid-rows-none max-lg:grid-cols-1 max-lg:overflow-auto">
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
          <Panel index={1} titleLeft="CLOCK" titleRight="LOCAL"><Standby /></Panel>
          <Panel index={3} titleLeft="OPERATOR" titleRight="ID"><Standby /></Panel>
          <Panel index={5} titleLeft="SKILLS" titleRight="PROF"><Standby /></Panel>
          <Panel index={7} titleLeft="PROC" titleRight="TOP"><Standby /></Panel>
          <Panel index={9} titleLeft="MEM" titleRight="HEAP"><Standby /></Panel>
        </div>

        {/* CENTER — TERMINAL */}
        <Panel
          index={0}
          titleLeft="TERMINAL"
          titleRight="MAIN SHELL"
          aug="bl-clip tr-clip border"
          className="min-h-[40vh]"
        >
          <div id="terminal" className="h-full">
            <Standby />
          </div>
        </Panel>

        {/* RIGHT — PANEL // NETWORK */}
        <div className="flex min-h-0 flex-col justify-between gap-[0.75vh] max-lg:order-3">
          <Panel index={2} titleLeft="WORLD" titleRight="GEO"><Standby /></Panel>
          <Panel index={4} titleLeft="UPLINKS" titleRight="CONN"><Standby /></Panel>
          <Panel index={6} titleLeft="NETSTAT" titleRight="LIVE"><Standby /></Panel>
          <Panel index={8} titleLeft="TRAFFIC" titleRight="NET"><Standby /></Panel>
        </div>
      </div>

      {/* BOTTOM — PROJECT ARCHIVE */}
      <Panel index={10} titleLeft="FILES" titleRight="PROJECT_ARCHIVE" className="max-lg:order-4">
        <Standby />
      </Panel>

      <div className="scanlines" aria-hidden />
    </div>
  );
}
