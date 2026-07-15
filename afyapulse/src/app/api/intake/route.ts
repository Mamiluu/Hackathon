import { NextRequest, NextResponse } from "next/server";
import { extractFromAudio, extractFromImage } from "@/lib/gemma/intake";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { mediaBase64?: string; mimeType?: string; kind?: "image" | "audio" };
  const { mediaBase64, mimeType, kind } = body;

  if (!mediaBase64 || !mimeType || !kind) {
    return NextResponse.json({ error: "mediaBase64, mimeType, and kind are required" }, { status: 400 });
  }

  const result = kind === "image" ? await extractFromImage(mediaBase64, mimeType) : await extractFromAudio(mediaBase64, mimeType);
  return NextResponse.json(result);
}
