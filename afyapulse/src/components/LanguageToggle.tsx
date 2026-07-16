"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE_NAME } from "@/lib/i18n/constants";
import { ALL_LANGS, LANGUAGE_LABEL, parseLang, type Lang } from "@/lib/i18n/translations";

function readCookie(): Lang {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`${LANG_COOKIE_NAME}=([a-z-]+)`));
  return parseLang(match?.[1]);
}

export function LanguageToggle() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(readCookie());
  }, []);

  function onChange(next: Lang) {
    document.cookie = `${LANG_COOKIE_NAME}=${next}; path=/; max-age=31536000`;
    setLang(next);
    router.refresh();
  }

  return (
    <label
      className="flex items-center gap-2 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-surface-raised transition-colors"
      aria-label="Language"
    >
      <span aria-hidden>🌐</span>
      <select
        value={lang}
        onChange={(e) => onChange(parseLang(e.target.value))}
        className="cursor-pointer appearance-none bg-transparent text-xs font-medium text-inherit outline-none"
      >
        {ALL_LANGS.map((code) => (
          <option key={code} value={code}>
            {LANGUAGE_LABEL[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
