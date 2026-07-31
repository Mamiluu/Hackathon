"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE_NAME } from "@/lib/i18n/constants";
import { ALL_LANGS, LANGUAGE_LABEL, parseLang, type Lang } from "@/lib/i18n/translations";

function readCookie(): Lang {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`${LANG_COOKIE_NAME}=([a-z-]+)`));
  return parseLang(match?.[1]);
}

/**
 * A native <select>'s open dropdown is rendered by the OS/browser chrome, not CSS -- no amount
 * of styling the closed trigger fixes how the list itself looks once it's open. This is a
 * fully custom listbox instead: same cookie + router.refresh() behavior as before, but every
 * pixel of the open menu is actually ours (hairline border, surface-raised card, series-1
 * accent on the active language) -- and it stays keyboard- and screen-reader-accessible via
 * the standard aria-activedescendant listbox pattern.
 */
export function LanguageToggle() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setLang(readCookie());
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(Math.max(0, ALL_LANGS.indexOf(lang)));
      listRef.current?.focus();
    }
  }, [open, lang]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, ALL_LANGS.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        commit(ALL_LANGS[activeIndex]);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  function commit(next: Lang) {
    document.cookie = `${LANG_COOKIE_NAME}=${next}; path=/; max-age=31536000`;
    setLang(next);
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className="flex items-center gap-2 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-raised hover:text-ink-primary"
      >
        <span aria-hidden className="text-sm leading-none">
          🌐
        </span>
        {LANGUAGE_LABEL[lang]}
        <svg aria-hidden width="9" height="6" viewBox="0 0 10 6" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label="Select language"
          aria-activedescendant={`lang-opt-${ALL_LANGS[activeIndex]}`}
          className="lang-menu absolute bottom-full left-0 z-50 mb-1.5 max-h-64 w-48 overflow-y-auto rounded-lg border border-hairline bg-surface-raised p-1 shadow-lg outline-none"
        >
          {ALL_LANGS.map((code, i) => {
            const selected = code === lang;
            const active = i === activeIndex;
            return (
              <li
                key={code}
                id={`lang-opt-${code}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(code)}
                className={`flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  active ? "bg-page text-ink-primary" : "text-ink-secondary"
                } ${selected ? "font-medium text-series-1" : ""}`}
              >
                <span>{LANGUAGE_LABEL[code]}</span>
                {selected && <span aria-hidden>✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
