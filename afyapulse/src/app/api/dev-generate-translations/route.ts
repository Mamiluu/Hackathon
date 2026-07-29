import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { chatComplete } from "@/lib/gemma/client";
import { ALL_LANGS, ENGLISH_SOURCE, LANGUAGE_NAME, type Lang } from "@/lib/i18n/translations";

/**
 * TEMPORARY, local-dev-only patcher: fills in only the MISSING keys of each precache JSON file
 * under src/lib/i18n/precache/ (rather than regenerating a language from scratch), so adding new
 * UI strings doesn't require re-translating everything. Run once locally per language that needs
 * patching, then delete this file again -- see autoTranslate.server.ts for why precache exists.
 */

const STATIC_LANGS: Lang[] = ["en", "sw"];
const CHUNK_SIZE = 20;
const PRECACHE_DIR = path.join(process.cwd(), "src", "lib", "i18n", "precache");
const REQUEST_SPACING_MS = 2500; // free-tier Gemini cap is 30 req/min
const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkEntries<T>(entries: [string, T][], size: number): [string, T][][] {
  const chunks: [string, T][][] = [];
  for (let i = 0; i < entries.length; i += size) chunks.push(entries.slice(i, i + size));
  return chunks;
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
    const result = await translateChunkOnce(lang, chunk);
    if (result) return result;
    if (attempt < MAX_RETRIES) await sleep(REQUEST_SPACING_MS * attempt);
  }
  return null;
}

async function patchLanguage(lang: Lang): Promise<{ lang: Lang; ok: boolean; patched: number; skipped?: boolean }> {
  const filePath = path.join(PRECACHE_DIR, `${lang}.json`);
  let existing: Record<string, string> = {};
  try {
    existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    // no existing file / unparsable -- treat as empty, will fill everything
  }

  const missingEntries = Object.entries(ENGLISH_SOURCE).filter(([k, v]) => !existing[k] && v);
  if (missingEntries.length === 0) return { lang, ok: true, patched: 0, skipped: true };

  const chunks = chunkEntries(missingEntries, CHUNK_SIZE);
  const merged: Record<string, string> = { ...existing };

  for (const chunk of chunks) {
    const result = await translateChunk(lang, Object.fromEntries(chunk));
    if (!result) return { lang, ok: false, patched: Object.keys(merged).length - Object.keys(existing).length };
    Object.assign(merged, result);
    await sleep(REQUEST_SPACING_MS);
  }

  fs.mkdirSync(PRECACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(PRECACHE_DIR, `${lang}.json`), JSON.stringify(merged, null, 2), "utf-8");
  return { lang, ok: true, patched: missingEntries.length };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const only = url.searchParams.get("lang");
  const targets = (only ? [only] : ALL_LANGS.filter((l) => !STATIC_LANGS.includes(l))) as Lang[];

  const results: { lang: Lang; ok: boolean; patched: number; skipped?: boolean }[] = [];
  for (const lang of targets) {
    results.push(await patchLanguage(lang));
  }
  return NextResponse.json({ results, totalKeys: Object.keys(ENGLISH_SOURCE).length });
}
