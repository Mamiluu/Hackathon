"use client";

import { useEffect } from "react";
import { setAutoTranslation, type Lang, type TranslationKey } from "@/lib/i18n/translations";

/**
 * The server resolves auto-translated strings once per request (see ensureAutoTranslated) and
 * that cache lives in the server's copy of the translations module. This component mirrors the
 * resolved map into the browser's own copy of the same module on hydration, so client components
 * that call t() again after a client-side re-render (not just the initial SSR pass) still see the
 * translated text instead of silently falling back to English.
 */
export function AutoTranslationSync({ lang, dict }: { lang: Lang; dict: Partial<Record<TranslationKey, string>> }) {
  useEffect(() => {
    if (Object.keys(dict).length > 0) {
      setAutoTranslation(lang, dict);
    }
  }, [lang, dict]);

  return null;
}
