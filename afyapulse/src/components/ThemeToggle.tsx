"use client";

import { useEffect, useState } from "react";

type ThemeSetting = "system" | "light" | "dark";

function applyTheme(setting: ThemeSetting) {
  const root = document.documentElement;
  if (setting === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", setting);
}

export function ThemeToggle() {
  const [setting, setSetting] = useState<ThemeSetting>("system");

  useEffect(() => {
    const stored = (localStorage.getItem("afyapulse-theme") as ThemeSetting | null) ?? "system";
    setSetting(stored);
    applyTheme(stored);
  }, []);

  function cycle() {
    const order: ThemeSetting[] = ["system", "light", "dark"];
    const next = order[(order.indexOf(setting) + 1) % order.length];
    setSetting(next);
    applyTheme(next);
    localStorage.setItem("afyapulse-theme", next);
  }

  const label = setting === "system" ? "System" : setting === "light" ? "Light" : "Dark";
  const icon = setting === "system" ? "◐" : setting === "light" ? "☀" : "☽";

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-2 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-raised transition-colors"
      aria-label={`Theme: ${label}. Click to change.`}
    >
      <span aria-hidden>{icon}</span>
      {label}
    </button>
  );
}
