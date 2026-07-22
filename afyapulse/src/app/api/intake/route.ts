import { NextRequest, NextResponse } from "next/server";
import { extractFromAudio, extractFromImage } from "@/lib/gemma/intake";
import { parseLang } from "@/lib/i18n/translations";

// Media (image/audio) understanding calls run noticeably slower than plain text generation --
// see src/app/api/compliance/route.ts for why every Gemma-calling route sets this.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { mediaBase64?: string; mimeType?: string; kind?: "image" | "audio"; lang?: string };
  const { mediaBase64, mimeType, kind } = body;
  const lang = parseLang(body.lang);

  if (!mediaBase64 || !mimeType || !kind) {
    return NextResponse.json({ error: "mediaBase64, mimeType, and kind are required" }, { status: 400 });
  }

  const result = kind === "image" ? await extractFromImage(mediaBase64, mimeType, lang) : await extractFromAudio(mediaBase64, mimeType, lang);
  return NextResponse.json(result);
}
