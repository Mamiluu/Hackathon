"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Command Center", icon: "◈" },
  { href: "/redistribution", label: "Redistribution", icon: "⇄" },
  { href: "/copilot", label: "DHO Copilot", icon: "◎" },
  { href: "/intake", label: "Field Intake", icon: "◍" },
];

export function NavLinks() {
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
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
