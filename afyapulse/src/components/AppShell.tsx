import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page">
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
              <div className="text-sm font-semibold leading-tight text-ink-primary">AfyaPulse</div>
              <div className="text-[11px] leading-tight text-ink-muted">Kilifi County · District Health</div>
            </div>
          </div>
          <NavLinks />
          <div className="mt-auto space-y-3 px-2">
            <div className="rounded-lg border border-hairline bg-surface-raised p-3 text-xs text-ink-secondary">
              <div className="mb-1 font-medium text-ink-primary">Built with Gemma 4</div>
              Multimodal intake, agentic redistribution, and the district copilot are powered by Gemma 4&apos;s
              native function calling.
            </div>
            <ThemeToggle />
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
