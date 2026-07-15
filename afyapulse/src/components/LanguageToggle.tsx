"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE_NAME } from "@/lib/i18n/constants";
import type { Lang } from "@/lib/i18n/translations";
import { LANGUAGE_LABEL } from "@/lib/i18n/translations";

function readCookie(): Lang {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`${LANG_COOKIE_NAME}=(en|sw)`));
  return (match?.[1] as Lang) ?? "en";
}

export function LanguageToggle() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(readCookie());
  }, []);

  function toggle() {
    const next: Lang = lang === "en" ? "sw" : "en";
    document.cookie = `${LANG_COOKIE_NAME}=${next}; path=/; max-age=31536000`;
    setLang(next);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-raised transition-colors"
      aria-label={`Language: ${LANGUAGE_LABEL[lang]}. Click to switch.`}
    >
      <span aria-hidden>🌐</span>
      {LANGUAGE_LABEL[lang]}
    </button>
  );
}
