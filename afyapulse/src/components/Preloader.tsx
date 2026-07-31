"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "enter" | "exit" | "done";

/**
 * The boot moment for the "District Health Nervous System" -- a real vital-signs monitor
 * coming online, not a spinner with a logo on it. A continuously-scrolling cardiac trace
 * (canvas-drawn, not a static SVG icon) runs inside a HUD-bracketed frame while a monospace
 * boot log calls out the system's actual subsystems, ending in a confirmed "SYSTEM NOMINAL"
 * before dissolving into the real (light-themed) dashboard underneath.
 *
 * Deliberately dark-screen for these two seconds regardless of the app's own light/dark
 * setting -- a monitor readout that looked like light mode wouldn't read as one. The
 * dashboard loads in parallel underneath the whole time; these two seconds are a brand beat,
 * never added latency. Mounted once per real page load -- the App Router keeps this layout
 * instance alive across client-side navigation, so it naturally only reappears on an actual
 * reload or first visit.
 */

const BEAT_POINTS: [number, number][] = [
  [0.0, 0],
  [0.14, 0],
  [0.18, 0.12],
  [0.22, 0],
  [0.3, 0],
  [0.335, -0.12],
  [0.36, 1],
  [0.385, -0.55],
  [0.41, 0],
  [0.55, 0],
  [0.63, 0.22],
  [0.72, 0],
  [1.0, 0],
];

function beatY(t: number): number {
  const u = ((t % 1) + 1) % 1;
  for (let i = 0; i < BEAT_POINTS.length - 1; i++) {
    const [x0, y0] = BEAT_POINTS[i];
    const [x1, y1] = BEAT_POINTS[i + 1];
    if (u >= x0 && u <= x1) {
      const f = (u - x0) / (x1 - x0 || 1);
      return y0 + (y1 - y0) * f;
    }
  }
  return 0;
}

const STATUS_LINES = ["INITIALIZING DISTRICT HEALTH NETWORK", "SYNCING FACILITY TELEMETRY", "CALIBRATING FORECAST ENGINE"];

export function Preloader() {
  const [phase, setPhase] = useState<Phase>("enter");
  const [lineIndex, setLineIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const exitTimer = setTimeout(() => setPhase("exit"), 1700);
    const doneTimer = setTimeout(() => setPhase("done"), 2000);
    const l1 = setTimeout(() => setLineIndex(1), 480);
    const l2 = setTimeout(() => setLineIndex(2), 920);
    const readyTimer = setTimeout(() => setReady(true), 1380);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      clearTimeout(l1);
      clearTimeout(l2);
      clearTimeout(readyTimer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.scale(dpr, dpr);

    function drawTrace(offsetBeats: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.lineWidth = 2.2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = "#5BC8FF";
      ctx.shadowColor = "#5BC8FF";
      ctx.shadowBlur = 8;

      const beatsVisible = 2.4;
      const pxPerBeat = cssWidth / beatsVisible;
      const midY = cssHeight * 0.56;
      const amp = cssHeight * 0.34;

      ctx.beginPath();
      let lastX = 0;
      let lastY = midY;
      for (let x = 0; x <= cssWidth; x += 2) {
        const t = offsetBeats - (cssWidth - x) / pxPerBeat;
        const y = midY - beatY(t) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        lastX = x;
        lastY = y;
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = "#EAF8FF";
      ctx.shadowBlur = 14;
      ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (reduceMotion) {
      drawTrace(0.72); // single static frame, no animation loop
      return;
    }

    let raf = 0;
    const start = performance.now();
    const beatDurationMs = 900;
    function tick(now: number) {
      drawTrace((now - start) / beatDurationMs);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`preloader${phase === "exit" ? " preloader-exit" : ""}`} role="status" aria-label="Loading AfyaPulse">
      <div className="preloader-scanlines" aria-hidden />
      <div className="preloader-frame" aria-hidden>
        <canvas ref={canvasRef} className="preloader-canvas" />
      </div>
      <div className={`preloader-readout${ready ? " is-ready" : ""}`} aria-hidden>
        <span>{ready ? "SYSTEM NOMINAL" : STATUS_LINES[lineIndex]}</span>
        <span className="preloader-cursor" />
      </div>
      <div className="preloader-word">AfyaPulse</div>
    </div>
  );
}
