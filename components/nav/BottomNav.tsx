"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { FilmIcon, HomeIcon, MeetingIcon, ReflectIcon } from "./icons";

const ITEMS = [
  { href: "/accueil", label: "Accueil", Icon: HomeIcon },
  { href: "/films", label: "Films", Icon: FilmIcon },
  { href: "/reflexions", label: "Réflexions", Icon: ReflectIcon },
  { href: "/reunion", label: "Réunion", Icon: MeetingIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="pointer-events-auto mx-4 flex w-full max-w-[420px] items-center justify-around rounded-full border border-border bg-elevated/80 px-2 py-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 transition-colors duration-[250ms] [transition-timing-function:var(--ease)]",
                active ? "text-gold" : "text-ink-faint hover:text-ink-muted"
              )}
            >
              <Icon className="h-[21px] w-[21px]" />
              <span className="text-[10px] font-medium tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
