"use client";

import { useRef, useState } from "react";
import { StatusPill } from "@/components/StatusPill";
import type { IntakeExtraction } from "@/lib/gemma/intake";
import { ALL_LANGS, t, type Lang } from "@/lib/i18n/translations";

function fileToBase64(blob: Blob): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [, base64] = result.split(",");
      resolve({ base64, mimeType: blob.type || "application/octet-stream" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface ExtractionState {
  extraction: IntakeExtraction;
  mocked: boolean;
}

const CONFIDENCE_KEY = {
  low: "confidenceLow",
  medium: "confidenceMedium",
  high: "confidenceHigh",
} as const;

function ExtractionResult({ result, lang }: { result: ExtractionState; lang: Lang }) {
  const { extraction, mocked } = result;
  return (
    <div className="mt-4 rounded-lg border border-series-1/20 bg-series-1/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-series-1">
          <span aria-hidden>◎</span> {t("gemmaExtraction", lang)}
        </div>
        <StatusPill
          severity={extraction.confidence === "high" ? "good" : extraction.confidence === "medium" ? "warning" : "critical"}
          text={t(CONFIDENCE_KEY[extraction.confidence], lang)}
        />
      </div>
      {extraction.items.length > 0 && (
        <table className="mb-2 w-full text-sm">
          <tbody className="divide-y divide-hairline">
            {extraction.items.map((item, i) => (
              <tr key={i}>
                <td className="py-1.5 text-ink-primary">{item.name}</td>
                <td className="py-1.5 text-right tabular text-ink-secondary">
                  {item.quantity} {item.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {extraction.note && <p className="text-xs text-ink-secondary">{extraction.note}</p>}
      {mocked && <div className="mt-2 text-[10px] text-ink-muted">{t("offlineDraft", lang)}</div>}
    </div>
  );
}

function ImageIntake({ lang }: { lang: Lang }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onSelect(f: File | null) {
    setFile(f);
    setResult(null);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function extract() {
    if (!file) return;
    setLoading(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaBase64: base64, mimeType, kind: "image", lang }),
      });
      const json = await res.json();
      setResult({ extraction: json.extraction, mocked: json.mocked });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="mb-1 text-sm font-semibold text-ink-primary">{t("photoIntake", lang)}</div>
      <p className="mb-3 text-xs text-ink-secondary">{t("photoIntakeDesc", lang)}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Selected stock photo" className="mb-3 max-h-56 w-full rounded-lg border border-hairline object-cover" />
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="mb-3 flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-hairline text-sm text-ink-muted hover:border-series-1/40 hover:text-series-1"
        >
          <span aria-hidden className="text-2xl">
            ◍
          </span>
          {t("clickToChoosePhoto", lang)}
        </button>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary"
        >
          {file ? t("changePhoto", lang) : t("choosePhoto", lang)}
        </button>
        <button
          onClick={extract}
          disabled={!file || loading}
          className="rounded-md bg-series-1 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? t("reading", lang) : t("extractWithGemma", lang)}
        </button>
      </div>

      {result && <ExtractionResult result={result} lang={lang} />}
    </div>
  );
}

function AudioIntake({ lang }: { lang: Lang }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);

  async function startRecording() {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        blobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError(t("micDenied", lang));
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function extract() {
    if (!blobRef.current) return;
    setLoading(true);
    try {
      const { base64, mimeType } = await fileToBase64(blobRef.current);
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaBase64: base64, mimeType, kind: "audio", lang }),
      });
      const json = await res.json();
      setResult({ extraction: json.extraction, mocked: json.mocked });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="mb-1 text-sm font-semibold text-ink-primary">{t("voiceIntake", lang)}</div>
      <p className="mb-3 text-xs text-ink-secondary">{t("voiceIntakeDesc", lang, { count: ALL_LANGS.length })}</p>

      <div className="mb-3 flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-hairline">
        {recording ? (
          <>
            <span className="h-3 w-3 animate-pulse rounded-full bg-status-critical" aria-hidden />
            <span className="text-sm text-ink-secondary">{t("recording", lang)}</span>
          </>
        ) : audioUrl ? (
          <audio controls src={audioUrl} className="w-4/5" />
        ) : (
          <span className="text-sm text-ink-muted">{t("noRecordingYet", lang)}</span>
        )}
      </div>

      {error && <p className="mb-2 text-xs text-status-critical">{error}</p>}

      <div className="flex gap-2">
        {!recording ? (
          <button
            onClick={startRecording}
            className="rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary"
          >
            {audioUrl ? t("recordAgain", lang) : t("startRecording", lang)}
          </button>
        ) : (
          <button onClick={stopRecording} className="rounded-md border border-status-critical/40 px-3 py-1.5 text-xs font-medium text-status-critical">
            {t("stopRecording", lang)}
          </button>
        )}
        <button
          onClick={extract}
          disabled={!audioUrl || loading || recording}
          className="rounded-md bg-series-1 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? t("listening", lang) : t("extractWithGemma", lang)}
        </button>
      </div>

      {result && <ExtractionResult result={result} lang={lang} />}
    </div>
  );
}

export function IntakeClient({ lang }: { lang: Lang }) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wide text-series-1">{t("intakeEyebrow", lang)}</div>
        <h1 className="text-2xl font-semibold text-ink-primary">{t("intakeTitle", lang)}</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">{t("intakeSubtitle", lang)}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ImageIntake lang={lang} />
        <AudioIntake lang={lang} />
      </div>
    </div>
  );
}
