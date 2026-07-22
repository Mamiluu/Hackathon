"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { t, type Lang } from "@/lib/i18n/translations";

const LINKS = [
  { href: "/", labelKey: "navCommandCenter", icon: "◈" },
  { href: "/redistribution", labelKey: "navRedistribution", icon: "⇄" },
  { href: "/copilot", labelKey: "navCopilot", icon: "◎" },
  { href: "/intake", labelKey: "navIntake", icon: "◍" },
  { href: "/compliance", labelKey: "navCompliance", icon: "✓" },
] as const;

export function NavLinks({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-series-1/10 text-series-1"
                : "text-ink-secondary hover:bg-surface-raised hover:text-ink-primary"
            )}
          >
            <span aria-hidden className="text-base">
              {link.icon}
            </span>
            {t(link.labelKey, lang)}
          </Link>
        );
      })}
    </nav>
  );
}
