import { generateFromMedia } from "./client";

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

const IMAGE_PROMPT = `You are reading a photo taken by a community health worker at a rural Kenyan health facility -- \
it could be a stock shelf, a paper stock register page, or a handwritten count. \
Extract every medicine/item name and its visible quantity. \
Respond with ONLY minified JSON matching this exact shape, no markdown fences, no commentary: \
{"type":"stock_count","items":[{"name":string,"quantity":number,"unit":string}],"note":string,"confidence":"high"|"medium"|"low"} \
If the image is unclear or not stock-related, set type to "unknown" and explain briefly in "note".`;

const AUDIO_PROMPT = `You are transcribing and structuring a voice note from a community health worker or nurse at a \
rural Kenyan health facility, possibly in English, Swahili, or a mix of both. They may be reporting stock counts, \
bed status, doctor attendance, or a general facility note. \
Respond with ONLY minified JSON matching this exact shape, no markdown fences, no commentary: \
{"type":"stock_count"|"facility_note","items":[{"name":string,"quantity":number,"unit":string}],"note":string,"confidence":"high"|"medium"|"low"} \
"items" may be empty if the note isn't about stock counts -- put the substance of the note in "note" either way \
(translated to English if needed).`;

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

function mockImageExtraction(): IntakeExtraction {
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

function mockAudioExtraction(): IntakeExtraction {
  return {
    type: "facility_note",
    items: [{ name: "Oxytocin Injection", quantity: 3, unit: "ampoules" }],
    note:
      "Offline draft — connect GEMINI_API_KEY for live Gemma 4 audio transcription. Sample: \"Bed 2 and 3 are full, the doctor did not come in today, and we are down to 3 ampoules of oxytocin.\"",
    confidence: "medium",
  };
}

export async function extractFromImage(imageBase64: string, mimeType: string): Promise<{ extraction: IntakeExtraction; mocked: boolean; raw: string }> {
  const result = await generateFromMedia({
    prompt: IMAGE_PROMPT,
    mediaBase64: imageBase64,
    mimeType,
    mockFallback: () => ({ text: JSON.stringify(mockImageExtraction()), functionCalls: [], mocked: true }),
  });
  return { extraction: parseExtraction(result.text), mocked: result.mocked, raw: result.text };
}

export async function extractFromAudio(audioBase64: string, mimeType: string): Promise<{ extraction: IntakeExtraction; mocked: boolean; raw: string }> {
  const result = await generateFromMedia({
    prompt: AUDIO_PROMPT,
    mediaBase64: audioBase64,
    mimeType,
    mockFallback: () => ({ text: JSON.stringify(mockAudioExtraction()), functionCalls: [], mocked: true }),
  });
  return { extraction: parseExtraction(result.text), mocked: result.mocked, raw: result.text };
}
