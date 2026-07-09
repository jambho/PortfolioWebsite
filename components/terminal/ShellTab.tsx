"use client";
import { useEffect, useRef, useState } from "react";
import { runCommand, PROMPT, type TermLine, type TermAction } from "@/lib/terminal/commands";
import { TermOutput } from "./TermOutput";
import { emit } from "@/lib/bus";
import { sfx } from "@/lib/audio";
import { content } from "@/lib/content";

const GREETING: TermLine[] = [
  { text: "Welcome to JB-OS v2.0 — portfolio shell", kind: "ok" },
  { text: 'type "help" to list programs', kind: "dim" },
];

const MAX_LINES = 300;

export function ShellTab() {
  const [lines, setLines] = useState<TermLine[]>(GREETING);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  function execute(action: TermAction) {
    switch (action.type) {
      case "tab": emit("setTab", action.tab); break;
      case "openProject": emit("openProject", action.index); break;
      case "matrix": emit("matrix"); break;
      case "theme":
        try { localStorage.setItem("jb-theme", action.theme); } catch {}
        document.documentElement.setAttribute("data-theme", action.theme);
        sfx.play("theme");
        break;
      case "sound": {
        const on = !(sfx.enabled);
        sfx.setEnabled(on);
        if (on) { sfx.init(); sfx.play("granted"); }
        break;
      }
      case "fx": {
        const off = document.documentElement.getAttribute("data-fx") === "off";
        document.documentElement.setAttribute("data-fx", off ? "on" : "off");
        try { localStorage.setItem("jb-fx", off ? "on" : "off"); } catch {}
        break;
      }
      case "resume": window.open(content.resumeUrl, "_blank", "noopener"); break;
      case "clear": setLines([]); break;
    }
  }

  function submit() {
    const cmd = input;
    setInput("");
    setHistIdx(-1);
    if (cmd.trim()) setHistory((h) => [...h, cmd]);
    const echo: TermLine = { text: `${PROMPT} ${cmd}`, kind: "dim" };
    const result = runCommand(cmd);
    const hasErr = result.lines.some((l) => l.kind === "err");
    sfx.init();
    sfx.play(hasErr ? "denied" : "stdout");
    if (result.actions?.some((a) => a.type === "clear")) {
      setLines([]);
    } else {
      setLines((prev) => [...prev, echo, ...result.lines].slice(-MAX_LINES));
    }
    result.actions?.filter((a) => a.type !== "clear").forEach(execute);
    if (hasErr) {
      document.documentElement.animate?.(
        [{ filter: "none" }, { filter: "hue-rotate(140deg)" }, { filter: "none" }],
        { duration: 120 }
      );
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    sfx.play("key");
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHistIdx((i) => {
        const next = i < 0 ? history.length - 1 : Math.max(0, i - 1);
        setInput(history[next] ?? "");
        return next;
      });
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHistIdx((i) => {
        const next = i + 1;
        if (next >= history.length) { setInput(""); return -1; }
        setInput(history[next]);
        return next;
      });
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div className="flex h-full min-h-0 flex-col" onClick={() => inputRef.current?.focus()}>
      <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        <TermOutput lines={lines} />
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-accent/20 pt-[0.5vh]">
        <label htmlFor="shell-input" className="whitespace-nowrap text-accent/50">
          {PROMPT}
        </label>
        <input
          id="shell-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal command input"
          className="w-full border-0 bg-transparent font-term text-[inherit] text-accent outline-none [caret-color:var(--accent)]"
        />
      </div>
    </div>
  );
}
