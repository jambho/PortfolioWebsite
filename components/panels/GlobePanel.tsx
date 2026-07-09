"use client";
import { useRef } from "react";
import { useTicker } from "@/hooks/useTicker";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { WORLD_POINTS, CITIES, LA } from "@/lib/geo";
import { content } from "@/lib/content";

type V3 = { x: number; y: number; z: number };

function toV3(lat: number, lng: number): V3 {
  const la = (lat * Math.PI) / 180;
  const lo = (lng * Math.PI) / 180;
  return { x: Math.cos(la) * Math.cos(lo), y: Math.sin(la), z: Math.cos(la) * Math.sin(lo) };
}
function rotY(v: V3, a: number): V3 {
  return { x: v.x * Math.cos(a) + v.z * Math.sin(a), y: v.y, z: -v.x * Math.sin(a) + v.z * Math.cos(a) };
}
function slerp(a: V3, b: V3, t: number): V3 {
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const th = Math.acos(dot) || 0.0001;
  const s = Math.sin(th);
  const p = Math.sin((1 - t) * th) / s;
  const q = Math.sin(t * th) / s;
  return { x: a.x * p + b.x * q, y: a.y * p + b.y * q, z: a.z * p + b.z * q };
}

const SPHERE = WORLD_POINTS.map(([lat, lng]) => toV3(lat, lng));
const LA_V = toV3(LA.lat, LA.lng);

export function GlobePanel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const arc = useRef({ to: toV3(CITIES[1].lat, CITIES[1].lng), start: 0 });

  useTicker((_dt, t) => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const dpr = devicePixelRatio || 1;
    const w = (el.width = el.clientWidth * dpr);
    const h = (el.height = el.clientHeight * dpr);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.42;
    const a = reduced ? 0.6 : t * 0.15;

    const style = getComputedStyle(document.documentElement);
    const rgb = `${style.getPropertyValue("--color-r")} ${style.getPropertyValue("--color-g")} ${style.getPropertyValue("--color-b")}`;

    ctx.clearRect(0, 0, w, h);
    // sphere outline
    ctx.strokeStyle = `rgb(${rgb} / 0.25)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    // land dots (screen x negated so east renders right — outside-view orientation)
    for (const v of SPHERE) {
      const r = rotY(v, a);
      if (r.z <= 0) continue;
      ctx.fillStyle = `rgb(${rgb} / ${0.25 + r.z * 0.65})`;
      ctx.fillRect(cx - r.x * R, cy - r.y * R, Math.max(1.2, dpr), Math.max(1.2, dpr));
    }
    // LA marker
    const laR = rotY(LA_V, a);
    if (laR.z > 0) {
      const px = cx - laR.x * R;
      const py = cy - laR.y * R;
      const pulse = 2 + Math.sin(t * 4) * 1.5;
      ctx.strokeStyle = `rgb(${rgb} / 0.9)`;
      ctx.beginPath();
      ctx.arc(px, py, (3 + pulse) * dpr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgb(${rgb})`;
      ctx.beginPath();
      ctx.arc(px, py, 2 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    // arc: LA → city, 3s flight, retarget every 5s
    if (!reduced) {
      if (t - arc.current.start > 5) {
        const city = CITIES[1 + Math.floor(Math.random() * (CITIES.length - 1))];
        arc.current = { to: toV3(city.lat, city.lng), start: t };
      }
      const prog = Math.min((t - arc.current.start) / 3, 1);
      ctx.strokeStyle = `rgb(${rgb} / 0.7)`;
      ctx.beginPath();
      let started = false;
      for (let s = 0; s <= prog; s += 0.02) {
        const p = slerp(LA_V, arc.current.to, s);
        const lift = 1 + Math.sin(s * Math.PI) * 0.18; // altitude bulge
        const r = rotY({ x: p.x * lift, y: p.y * lift, z: p.z * lift }, a);
        if (r.z <= 0) { started = false; continue; }
        const px = cx - r.x * R;
        const py = cy - r.y * R;
        if (started) ctx.lineTo(px, py);
        else { ctx.moveTo(px, py); started = true; }
      }
      ctx.stroke();
    }
  });

  return (
    <div className="relative">
      <canvas ref={canvas} aria-hidden className="aspect-square w-full" />
      <span className="sr-only">Rotating globe marking {content.identity.location}</span>
      <div className="mt-[0.2vh] text-center font-term text-[max(1vh,9px)] tracking-[0.25em] text-accent/50">
        GEO://34.05N 118.24W
      </div>
    </div>
  );
}
