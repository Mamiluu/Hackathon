import { promises as fs } from "fs";
import path from "path";
import { chatComplete } from "@/lib/gemma/client";
import { ENGLISH_SOURCE, LANGUAGE_NAME, setAutoTranslation, type Lang } from "./translations";

const CACHE_DIR = path.join(process.cwd(), ".data", "i18n-cache");

const memoCache: Partial<Record<Lang, Record<string, string>>> = {};
const inFlight: Partial<Record<Lang, Promise<void>>> = {};

async function readDiskCache(lang: Lang): Promise<Record<string, string> | null> {
  try {
    const raw = await fs.readFile(path.join(CACHE_DIR, `${lang}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeDiskCache(lang: Lang, map: Record<string, string>): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(path.join(CACHE_DIR, `${lang}.json`), JSON.stringify(map), "utf-8");
  } catch {
    // Best-effort only -- serverless filesystems (e.g. Vercel) may be read-only/ephemeral,
    // in which case this is just an in-memory-per-instance cache instead. Still correct either way.
  }
}

function isCompleteTranslation(map: unknown): map is Record<string, string> {
  if (!map || typeof map !== "object") return false;
  const m = map as Record<string, unknown>;
  return Object.keys(ENGLISH_SOURCE).every((k) => typeof m[k] === "string" && (m[k] as string).length > 0);
}

async function translateViaGemma(lang: Lang): Promise<Record<string, string> | null> {
  const result = await chatComplete({
    systemInstruction:
      `Translate the values of this JSON object from English into ${LANGUAGE_NAME[lang]}. ` +
      `Keep every key exactly unchanged. Preserve every {placeholder} token (e.g. {count}, {facility}, {item}) ` +
      `verbatim and untranslated, in the same position within the sentence. Respond with ONLY the translated ` +
      `minified JSON object -- no markdown fences, no commentary, no extra or missing keys.`,
    messages: [{ role: "user", text: JSON.stringify(ENGLISH_SOURCE) }],
    mockFallback: () => ({ text: "", functionCalls: [], mocked: true }),
  });

  if (result.mocked || !result.text) return null;
  try {
    const cleaned = result.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return isCompleteTranslation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Ensures the given language's UI strings are translated and cached (in-memory per server
 * process, best-effort persisted to disk for warm-instance reuse). No-op for the two
 * statically/hand-translated languages (en, sw). If Gemma isn't configured or the translation
 * call fails or comes back incomplete, this simply leaves the cache unpopulated -- `t()` then
 * falls back to English for that language, same honest degradation as every other Gemma feature
 * in this app rather than ever showing a broken or partially-translated page.
 */
export async function ensureAutoTranslated(lang: Lang): Promise<void> {
  if (lang === "en" || lang === "sw") return;

  if (memoCache[lang]) {
    setAutoTranslation(lang, memoCache[lang]!);
    return;
  }

  if (inFlight[lang]) {
    await inFlight[lang];
    return;
  }

  inFlight[lang] = (async () => {
    const fromDisk = await readDiskCache(lang);
    if (isCompleteTranslation(fromDisk)) {
      memoCache[lang] = fromDisk;
      setAutoTranslation(lang, fromDisk);
      return;
    }

    const translated = await translateViaGemma(lang);
    if (translated) {
      memoCache[lang] = translated;
      setAutoTranslation(lang, translated);
      void writeDiskCache(lang, translated);
    }
  })();

  try {
    await inFlight[lang];
  } finally {
    delete inFlight[lang];
  }
}

/** Snapshot of whatever's currently cached for this process -- used to hydrate the client's copy of the module. */
export function getCachedTranslation(lang: Lang): Record<string, string> | undefined {
  return memoCache[lang];
}
