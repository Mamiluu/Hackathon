"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/i18n/translations";

interface Message {
  role: "user" | "model";
  text: string;
  mocked?: boolean;
  toolsUsed?: string[];
}

const SUGGESTION_KEYS = ["suggestion1", "suggestion2", "suggestion3", "suggestion4"] as const;

export function CopilotClient({ lang }: { lang: Lang }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "model", text: t("copilotWelcome", lang) }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const userMessage: Message = { role: "user", text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          message: text,
          lang,
        }),
      });
      const json = await res.json();
      setMessages([...nextMessages, { role: "model", text: json.text, mocked: json.mocked, toolsUsed: json.toolsUsed }]);
    } catch {
      setMessages([...nextMessages, { role: "model", text: "Something went wrong reaching the copilot. Please try again." }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-3xl flex-col">
      <div className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-series-1">{t("copilotEyebrow", lang)}</div>
        <h1 className="text-2xl font-semibold text-ink-primary">{t("copilotTitle", lang)}</h1>
        <p className="text-sm text-ink-secondary">{t("copilotSubtitle", lang)}</p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-hairline bg-surface p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                m.role === "user" ? "bg-series-1 text-white" : "bg-surface-raised text-ink-primary"
              )}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              {m.toolsUsed && m.toolsUsed.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.toolsUsed.map((tool, j) => (
                    <span key={j} className="rounded-full bg-series-1/10 px-2 py-0.5 text-[10px] font-medium text-series-1">
                      ◎ {tool}
                    </span>
                  ))}
                </div>
              )}
              {m.mocked && <div className="mt-1.5 text-[10px] text-ink-muted">{t("offlineDraft", lang)}</div>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-surface-raised px-4 py-2.5 text-sm text-ink-muted">{t("thinking", lang)}</div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTION_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => !loading && send(t(key, lang))}
            className="rounded-full border border-hairline px-3 py-1 text-xs text-ink-secondary hover:border-series-1/40 hover:text-series-1"
          >
            {t(key, lang)}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !loading) send(input.trim());
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("copilotPlaceholder", lang)}
          className="flex-1 rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink-primary outline-none focus:border-series-1"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-series-1 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {t("send", lang)}
        </button>
      </form>
    </div>
  );
}
