import { generateFromMedia } from "./client";
import { LANGUAGE_NAME, type Lang } from "@/lib/i18n/translations";

export interface ExtractedItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface IntakeExtraction {
  type: "stock_count" | "facility_note" | "unknown";
  items: ExtractedItem[];
  note: string;
  confidence: "high" | "medium" | "low";
}

function imagePrompt(lang: Lang) {
  return `You are reading a photo taken by a community health worker at a rural Kenyan health facility -- \
it could be a stock shelf, a paper stock register page, or a handwritten count. \
Extract every medicine/item name and its visible quantity. \
Respond with ONLY minified JSON matching this exact shape, no markdown fences, no commentary: \
{"type":"stock_count","items":[{"name":string,"quantity":number,"unit":string}],"note":string,"confidence":"high"|"medium"|"low"} \
Write the "note" field entirely in ${LANGUAGE_NAME[lang]}. \
If the image is unclear or not stock-related, set type to "unknown" and explain briefly in "note".`;
}

function audioPrompt(lang: Lang) {
  return `You are transcribing and structuring a voice note from a community health worker or nurse at a \
rural Kenyan health facility, possibly in English, Swahili, or a mix of both. They may be reporting stock counts, \
bed status, doctor attendance, or a general facility note. \
Respond with ONLY minified JSON matching this exact shape, no markdown fences, no commentary: \
{"type":"stock_count"|"facility_note","items":[{"name":string,"quantity":number,"unit":string}],"note":string,"confidence":"high"|"medium"|"low"} \
"items" may be empty if the note isn't about stock counts -- put the substance of the note in "note" either way, \
written entirely in ${LANGUAGE_NAME[lang]} regardless of which language was spoken.`;
}

function parseExtraction(rawText: string): IntakeExtraction {
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return {
      type: parsed.type === "stock_count" || parsed.type === "facility_note" ? parsed.type : "unknown",
      items: Array.isArray(parsed.items)
        ? parsed.items.map((i: { name?: string; quantity?: number; unit?: string }) => ({
            name: String(i.name ?? "Unknown item"),
            quantity: Number(i.quantity ?? 0),
            unit: String(i.unit ?? "units"),
          }))
        : [],
      note: String(parsed.note ?? ""),
      confidence: ["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "medium",
    };
  } catch {
    return { type: "unknown", items: [], note: rawText.slice(0, 300) || "Could not parse a structured result.", confidence: "low" };
  }
}

function mockImageExtraction(lang: Lang): IntakeExtraction {
  if (lang === "sw") {
    return {
      type: "stock_count",
      items: [
        { name: "Artemether-Lumefantrine 20/120mg", quantity: 42, unit: "vidonge" },
        { name: "Amoxicillin 250mg", quantity: 15, unit: "vidonge" },
        { name: "Malaria RDT Kit", quantity: 6, unit: "vifaa" },
      ],
      note: "Rasimu ya Nje ya Mtandao — unganisha GEMINI_API_KEY kwa uwezo halisi wa kuona wa Gemma 4. Mfano wa data umeonyeshwa.",
      confidence: "medium",
    };
  }
  return {
    type: "stock_count",
    items: [
      { name: "Artemether-Lumefantrine 20/120mg", quantity: 42, unit: "tablets" },
      { name: "Amoxicillin 250mg", quantity: 15, unit: "capsules" },
      { name: "Malaria RDT Kit", quantity: 6, unit: "kits" },
    ],
    note: "Offline draft — connect GEMINI_API_KEY for live Gemma 4 vision extraction. Sample extraction shown.",
    confidence: "medium",
  };
}

function mockAudioExtraction(lang: Lang): IntakeExtraction {
  if (lang === "sw") {
    return {
      type: "facility_note",
      items: [{ name: "Oxytocin Injection", quantity: 3, unit: "ampoule" }],
      note:
        "Rasimu ya Nje ya Mtandao — unganisha GEMINI_API_KEY kwa unukuzi halisi wa sauti wa Gemma 4. Mfano: \"Kitanda cha 2 na 3 vimejaa, daktari hakuja leo, na tumebakiwa na ampoule 3 za oxytocin.\"",
      confidence: "medium",
    };
  }
  return {
    type: "facility_note",
    items: [{ name: "Oxytocin Injection", quantity: 3, unit: "ampoules" }],
    note:
      "Offline draft — connect GEMINI_API_KEY for live Gemma 4 audio transcription. Sample: \"Bed 2 and 3 are full, the doctor did not come in today, and we are down to 3 ampoules of oxytocin.\"",
    confidence: "medium",
  };
}

export async function extractFromImage(
  imageBase64: string,
  mimeType: string,
  lang: Lang = "en"
): Promise<{ extraction: IntakeExtraction; mocked: boolean; raw: string }> {
  const result = await generateFromMedia({
    prompt: imagePrompt(lang),
    mediaBase64: imageBase64,
    mimeType,
    mockFallback: () => ({ text: JSON.stringify(mockImageExtraction(lang)), functionCalls: [], mocked: true }),
  });
  return { extraction: parseExtraction(result.text), mocked: result.mocked, raw: result.text };
}

export async function extractFromAudio(
  audioBase64: string,
  mimeType: string,
  lang: Lang = "en"
): Promise<{ extraction: IntakeExtraction; mocked: boolean; raw: string }> {
  const result = await generateFromMedia({
    prompt: audioPrompt(lang),
    mediaBase64: audioBase64,
    mimeType,
    mockFallback: () => ({ text: JSON.stringify(mockAudioExtraction(lang)), functionCalls: [], mocked: true }),
  });
  return { extraction: parseExtraction(result.text), mocked: result.mocked, raw: result.text };
}
