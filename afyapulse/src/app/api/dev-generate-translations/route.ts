import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { chatComplete } from "@/lib/gemma/client";
import { ALL_LANGS, ENGLISH_SOURCE, LANGUAGE_NAME, type Lang } from "@/lib/i18n/translations";

/**
 * TEMPORARY, local-dev-only generator: pre-translates the UI string dictionary into every
 * auto-translated language ONCE and writes the result as committed JSON under
 * src/lib/i18n/precache/. This is what turns "translate live per visitor, sequentially, with no
 * loading state" into "instant, because it already shipped with the deploy." Not meant to stay
 * in the app long-term as a public route -- run once locally, then delete this file.
 */

const STATIC_LANGS: Lang[] = ["en", "sw"];
const CHUNK_SIZE = 20;
const PRECACHE_DIR = path.join(process.cwd(), "src", "lib", "i18n", "precache");

// The free-tier Gemini API key backing this app is hard-capped at 30 requests/minute
// (confirmed via a live 429: "generate_content_free_tier_requests, limit: 30"). Firing all
// ~108 chunk-translation calls at once blew straight through that. This paces requests well
// under the ceiling and retries on 429 instead of giving up.
const REQUEST_SPACING_MS = 2500; // ~24/min, leaving headroom
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkEntries<T>(entries: [string, T][], size: number): [string, T][][] {
  const chunks: [string, T][][] = [];
  for (let i = 0; i < entries.length; i += size) chunks.push(entries.slice(i, i + size));
  return chunks;
}

let lastRequestAt = 0;
async function paced<T>(fn: () => Promise<T>): Promise<T> {
  const wait = Math.max(0, lastRequestAt + REQUEST_SPACING_MS - Date.now());
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
  return fn();
}

async function translateChunkOnce(lang: Lang, chunk: Record<string, string>): Promise<Record<string, string> | null> {
  const result = await chatComplete({
    systemInstruction:
      `Translate the values of this JSON object from English into ${LANGUAGE_NAME[lang]}. ` +
      `Keep every key exactly unchanged. Preserve every {placeholder} token (e.g. {count}, {facility}, {item}) ` +
      `verbatim and untranslated, in the same position within the sentence. Respond with ONLY the translated ` +
      `minified JSON object -- no markdown fences, no commentary, no extra or missing keys.`,
    messages: [{ role: "user", text: JSON.stringify(chunk) }],
    mockFallback: () => ({ text: "", functionCalls: [], mocked: true }),
  });

  if (result.mocked || !result.text) return null;
  try {
    const cleaned = result.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== "object") return null;
    const keys = Object.keys(chunk);
    const ok = keys.every((k) => typeof (parsed as Record<string, unknown>)[k] === "string");
    return ok ? (parsed as Record<string, string>) : null;
  } catch {
    return null;
  }
}

async function translateChunk(lang: Lang, chunk: Record<string, string>): Promise<Record<string, string> | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const result = await paced(() => translateChunkOnce(lang, chunk));
    if (result) return result;
    if (attempt < MAX_RETRIES) await sleep(REQUEST_SPACING_MS * attempt); // back off a bit more each retry
  }
  return null;
}

async function translateLanguage(lang: Lang): Promise<{ lang: Lang; ok: boolean; keys: number }> {
  const chunks = chunkEntries(Object.entries(ENGLISH_SOURCE), CHUNK_SIZE);
  const merged: Record<string, string> = {};

  // Sequential, not parallel: this whole run shares one 30-req/min budget across every language.
  for (const chunk of chunks) {
    const result = await translateChunk(lang, Object.fromEntries(chunk));
    if (!result) return { lang, ok: false, keys: Object.keys(merged).length };
    Object.assign(merged, result);
  }

  const complete = Object.keys(ENGLISH_SOURCE).every((k) => typeof merged[k] === "string" && merged[k].length > 0);
  if (!complete) return { lang, ok: false, keys: Object.keys(merged).length };

  fs.mkdirSync(PRECACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(PRECACHE_DIR, `${lang}.json`), JSON.stringify(merged, null, 2), "utf-8");
  return { lang, ok: true, keys: Object.keys(merged).length };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const only = url.searchParams.get("lang");
  const targets = only ? [only as Lang] : ALL_LANGS.filter((l) => !STATIC_LANGS.includes(l));

  const results: { lang: Lang; ok: boolean; keys: number }[] = [];
  for (const lang of targets) {
    results.push(await translateLanguage(lang));
  }
  return NextResponse.json({ results, totalKeys: Object.keys(ENGLISH_SOURCE).length });
}
