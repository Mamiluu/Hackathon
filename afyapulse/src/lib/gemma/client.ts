/**
 * Thin abstraction over the Gemma 4 / Gemini Generative Language REST API.
 *
 * Deliberately NOT using the @google/genai SDK -- it requires Node >=20 and this
 * project targets Node 18. Raw fetch is fewer dependencies and just as easy to
 * swap models/endpoints (see GEMMA_MODEL below).
 *
 * If GEMINI_API_KEY is unset, every call returns a clearly-labeled mock so the
 * app always runs end-to-end -- swap in a real key and nothing else changes.
 */

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export const isGemmaConfigured = Boolean(API_KEY);

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface FunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ContentPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
  functionCall?: FunctionCall;
  functionResponse?: { name: string; response: Record<string, unknown> };
  /** Gemma 4's reasoning trace, when thinking mode is on. Never part of the answer shown to users. */
  thought?: boolean;
}

export interface Content {
  role: "user" | "model" | "function";
  parts: ContentPart[];
}

export interface GemmaResponse {
  text: string;
  functionCalls: FunctionCall[];
  mocked: boolean;
}

export async function generateContent(opts: {
  contents: Content[];
  systemInstruction?: string;
  tools?: FunctionDeclaration[];
}): Promise<GemmaResponse> {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const res = await fetch(`${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: opts.contents,
      systemInstruction: opts.systemInstruction ? { parts: [{ text: opts.systemInstruction }] } : undefined,
      tools: opts.tools ? [{ functionDeclarations: opts.tools }] : undefined,
      // Note: thinkingConfig (to disable the reasoning trace outright) is rejected by this
      // model ("Thinking budget is not supported for this model"), so we filter thought
      // parts out of the response below instead.
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemma API error ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const candidate = json.candidates?.[0];
  const parts: ContentPart[] = candidate?.content?.parts ?? [];

  // Defensive filter: even with thinking disabled, never surface a `thought` part as the answer.
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text)
    .filter(Boolean)
    .join("\n");

  const functionCalls: FunctionCall[] = parts.filter((p) => p.functionCall).map((p) => p.functionCall!);

  return { text, functionCalls, mocked: false };
}

/** Convenience wrapper for a simple single-turn text generation (no tools). */
export async function chatComplete(opts: {
  systemInstruction: string;
  messages: { role: "user" | "model"; text: string }[];
  mockFallback: () => GemmaResponse;
}): Promise<GemmaResponse> {
  if (!isGemmaConfigured) return opts.mockFallback();

  try {
    return await generateContent({
      systemInstruction: opts.systemInstruction,
      contents: opts.messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    });
  } catch (err) {
    console.error("[gemma] chatComplete failed, falling back to mock:", err);
    return { ...opts.mockFallback(), mocked: true };
  }
}

export async function generateFromMedia(opts: {
  prompt: string;
  mediaBase64: string;
  mimeType: string;
  systemInstruction?: string;
  mockFallback: () => GemmaResponse;
}): Promise<GemmaResponse> {
  if (!isGemmaConfigured) return opts.mockFallback();

  try {
    return await generateContent({
      systemInstruction: opts.systemInstruction,
      contents: [
        {
          role: "user",
          parts: [{ text: opts.prompt }, { inlineData: { mimeType: opts.mimeType, data: opts.mediaBase64 } }],
        },
      ],
    });
  } catch (err) {
    console.error("[gemma] generateFromMedia failed, falling back to mock:", err);
    return { ...opts.mockFallback(), mocked: true };
  }
}
