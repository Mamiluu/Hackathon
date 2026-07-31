"use client";

import { useEffect, useState } from "react";

type Phase = "enter" | "exit" | "done";

/**
 * The boot moment for the "District Health Nervous System": draws the app's own pulse-line
 * mark as a live trace, synced to a heartbeat cadence, rather than a generic spinner --
 * AfyaPulse's name is literal here, not just a wordmark.
 *
 * Mounted once per real page load, never gated: the dashboard underneath starts loading
 * immediately in parallel, so these two seconds never stack on top of real fetch time. The App
 * Router keeps this layout instance alive across client-side navigation, so it naturally only
 * re-appears on an actual reload or first visit -- not on every in-app link click.
 */
export function Preloader() {
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    const exitTimer = setTimeout(() => setPhase("exit"), 1700);
    const doneTimer = setTimeout(() => setPhase("done"), 2000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`preloader${phase === "exit" ? " preloader-exit" : ""}`}
      role="status"
      aria-label="Loading AfyaPulse"
    >
      <div className="preloader-grid" aria-hidden />
      <div className="preloader-glow" aria-hidden />
      <svg className="preloader-mark" width="88" height="88" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="preloader-word">AfyaPulse</div>
    </div>
  );
}
