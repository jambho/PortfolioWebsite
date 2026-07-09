export type SfxName = "stdout" | "key" | "granted" | "denied" | "expand" | "panel" | "theme";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensureCtx() {
  if (ctx) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.25;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
    master = null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType, vol = 1, sweepTo?: number) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur);
}

function noiseBurst(dur: number, from: number, to: number, vol = 0.5) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t0);
}

const recipes: Record<SfxName, () => void> = {
  stdout: () => tone(2200, 0.02, "square", 0.08),
  key: () => noiseBurst(0.015, 1400, 2200, 0.15),
  granted: () => { tone(880, 0.05, "sine", 0.3); setTimeout(() => tone(1320, 0.07, "sine", 0.3), 45); },
  denied: () => tone(140, 0.12, "sawtooth", 0.35),
  expand: () => noiseBurst(0.35, 200, 3000, 0.25),
  panel: () => tone(660, 0.06, "triangle", 0.2),
  theme: () => { tone(660, 0.06, "sine", 0.25); setTimeout(() => tone(880, 0.06, "sine", 0.25), 70); setTimeout(() => tone(1100, 0.09, "sine", 0.25), 140); },
};

function readEnabled(): boolean {
  try {
    return localStorage.getItem("jb-sound") === "on";
  } catch {
    return false;
  }
}

export const sfx = {
  get enabled() {
    return readEnabled();
  },
  setEnabled(on: boolean) {
    try {
      localStorage.setItem("jb-sound", on ? "on" : "off");
    } catch {}
    if (on) ensureCtx();
  },
  init() {
    if (readEnabled()) ensureCtx();
    if (ctx?.state === "suspended") ctx.resume().catch(() => {});
  },
  play(name: SfxName) {
    if (!readEnabled() || !ctx || !master) return;
    try {
      recipes[name]();
    } catch {}
  },
};
