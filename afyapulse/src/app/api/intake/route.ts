import { NextRequest, NextResponse } from "next/server";
import { extractFromAudio, extractFromImage } from "@/lib/gemma/intake";
import type { Lang } from "@/lib/i18n/translations";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { mediaBase64?: string; mimeType?: string; kind?: "image" | "audio"; lang?: string };
  const { mediaBase64, mimeType, kind } = body;
  const lang: Lang = body.lang === "sw" ? "sw" : "en";

  if (!mediaBase64 || !mimeType || !kind) {
    return NextResponse.json({ error: "mediaBase64, mimeType, and kind are required" }, { status: 400 });
  }

  const result = kind === "image" ? await extractFromImage(mediaBase64, mimeType, lang) : await extractFromAudio(mediaBase64, mimeType, lang);
  return NextResponse.json(result);
}
