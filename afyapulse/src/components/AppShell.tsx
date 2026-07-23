import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { AutoTranslationSync } from "./AutoTranslationSync";
import { getLang } from "@/lib/i18n/getLang";
import { t } from "@/lib/i18n/translations";
import { ensureAutoTranslated, getCachedTranslation } from "@/lib/i18n/autoTranslate.server";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  await ensureAutoTranslated(lang);
  const autoDict = getCachedTranslation(lang) ?? {};
  return (
    <div className="min-h-screen bg-page">
      <AutoTranslationSync lang={lang} dict={autoDict} />
      <div className="mx-auto flex max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-hairline bg-surface px-4 py-6 md:flex">
          <div className="mb-8 flex items-center gap-2.5 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-series-1 text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M3 12h4l2-7 4 14 2-7h6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight text-ink-primary">{t("appName", lang)}</div>
              <div className="text-[11px] leading-tight text-ink-muted">{t("appTagline", lang)}</div>
            </div>
          </div>
          <NavLinks lang={lang} />
          <div className="mt-auto space-y-3 px-2">
            <div className="rounded-lg border border-hairline bg-surface-raised p-3 text-xs text-ink-secondary">
              <div className="mb-1 font-medium text-ink-primary">{t("builtWithGemma", lang)}</div>
              {t("builtWithGemmaDesc", lang)}
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            <div className="px-2 text-[10px] text-ink-muted">{t("copyrightNotice", lang, { year: new Date().getFullYear() })}</div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
