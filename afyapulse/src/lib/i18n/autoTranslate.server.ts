import { ENGLISH_SOURCE, setAutoTranslation, type Lang } from "./translations";

import fr from "./precache/fr.json";
import es from "./precache/es.json";
import de from "./precache/de.json";
import ar from "./precache/ar.json";
import zh from "./precache/zh.json";
import hi from "./precache/hi.json";
import pt from "./precache/pt.json";
import ru from "./precache/ru.json";
import ur from "./precache/ur.json";
import id from "./precache/id.json";
import ja from "./precache/ja.json";
import ko from "./precache/ko.json";

/**
 * Every auto-translated language is pre-generated ONCE (see the `dev-generate-translations`
 * route, run locally against the real Gemma API and committed as these JSON files) rather than
 * translated live per visitor. Earlier this ran Gemma calls in the request path itself: 5-9
 * sequential chunk translations per language, each taking up to a minute on this model tier, no
 * loading indicator -- a language switch could take minutes and the page would just keep showing
 * the *previous* language's content while the selector already showed the new one. It also
 * silently depended on the same free-tier 30-req/min Gemma quota that the live features need,
 * so an uncached visitor selecting an unusual language could stall or fail outright.
 *
 * This is the fix: every language switch is now instant, always, everywhere -- either real
 * bundled-at-build-time translation, or an immediate, honest fallback to English (never a
 * stuck or wrong-language page). Precache files not yet generated are `{}` placeholders;
 * `isCompleteTranslation` correctly treats those as "not available" and falls back cleanly.
 */
const PRECACHED: Partial<Record<Lang, Record<string, string>>> = {
  fr,
  es,
  de,
  ar,
  zh,
  hi,
  pt,
  ru,
  ur,
  id,
  ja,
  ko,
};

function isCompleteTranslation(map: Record<string, string> | undefined): map is Record<string, string> {
  if (!map) return false;
  return Object.keys(ENGLISH_SOURCE).every((k) => typeof map[k] === "string" && map[k].length > 0);
}

const resolvedCache: Partial<Record<Lang, Record<string, string>>> = {};

/** No-op for en/sw (hand-translated, no cache needed). For everything else, this is synchronous
 *  and instant -- there is no network call on the request path anymore. */
export async function ensureAutoTranslated(lang: Lang): Promise<void> {
  if (lang === "en" || lang === "sw") return;
  if (resolvedCache[lang]) {
    setAutoTranslation(lang, resolvedCache[lang]!);
    return;
  }

  const precached = PRECACHED[lang];
  if (isCompleteTranslation(precached)) {
    resolvedCache[lang] = precached;
    setAutoTranslation(lang, precached);
  }
  // No precache yet for this language: t() falls back to English automatically. No live
  // Gemma call is attempted here -- see the module comment for why.
}

/** Snapshot of whatever's resolved for this language -- used to hydrate the client's copy of the module. */
export function getCachedTranslation(lang: Lang): Record<string, string> | undefined {
  return resolvedCache[lang];
}
