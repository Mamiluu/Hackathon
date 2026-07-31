"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "enter" | "exit" | "done";

/**
 * The boot moment for AfyaPulse: a living, breathing pulse rendered as a smooth organic
 * waveform (not clinical EKG spikes) in a blue-to-teal gradient pulled straight from the
 * existing chart palette (--series-1, --series-5) -- vitality, not diagnostics. Sits on the
 * app's own page background so it matches whichever theme the visitor already has, rather
 * than forcing a detour. The dashboard loads underneath in parallel the whole time; these two
 * seconds are a brand beat, never added latency. Mounted once per real page load -- the App
 * Router keeps this layout instance alive across client-side navigation, so it naturally only
 * reappears on an actual reload or first visit.
 */

function waveY(xNorm: number, t: number): number {
  // Sum of a few incommensurate sine waves -- the classic technique for a signal that reads
  // as alive rather than a mechanical repeating loop.
  const k = xNorm * Math.PI * 2;
  return (
    Math.sin(k * 1.0 + t * 1.6) * 0.55 +
    Math.sin(k * 2.3 - t * 1.1) * 0.22 +
    Math.sin(k * 0.6 + t * 2.4) * 0.15
  );
}

const PARTICLES = [
  { left: 18, delay: 0, duration: 1900 },
  { left: 34, delay: 260, duration: 2100 },
  { left: 50, delay: 120, duration: 1800 },
  { left: 64, delay: 420, duration: 2000 },
  { left: 78, delay: 60, duration: 1950 },
];

export function Preloader() {
  const [phase, setPhase] = useState<Phase>("enter");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const exitTimer = setTimeout(() => setPhase("exit"), 1700);
    const doneTimer = setTimeout(() => setPhase("done"), 2000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
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

    const gradient = ctx.createLinearGradient(0, 0, cssWidth, 0);
    gradient.addColorStop(0, "#2a78d6");
    gradient.addColorStop(1, "#1baf7a");

    function drawWave(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      const midY = cssHeight / 2;
      const amp = cssHeight * 0.32;

      ctx.beginPath();
      ctx.lineWidth = 2.6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = gradient;
      ctx.shadowColor = "#4fb3a8";
      ctx.shadowBlur = 16;

      for (let x = 0; x <= cssWidth; x += 3) {
        const y = midY - waveY(x / cssWidth, t) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (reduceMotion) {
      drawWave(0.6);
      return;
    }

    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      drawWave((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`preloader${phase === "exit" ? " preloader-exit" : ""}`} role="status" aria-label="Loading AfyaPulse">
      <div className="preloader-aura" aria-hidden />
      <div className="preloader-particles" aria-hidden>
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="preloader-particle"
            style={{ left: `${p.left}%`, animationDelay: `${p.delay}ms`, animationDuration: `${p.duration}ms` }}
          />
        ))}
      </div>
      <canvas ref={canvasRef} className="preloader-wave" />
      <div className="preloader-word-wrap">
        <div className="preloader-word">AfyaPulse</div>
        <div className="preloader-underline" aria-hidden />
      </div>
    </div>
  );
}
