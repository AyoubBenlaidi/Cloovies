"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Clapperboard, Home, NotebookPen, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/accueil", label: "Accueil", Icon: Home },
  { href: "/films", label: "Films", Icon: Clapperboard },
  { href: "/reflexions", label: "Réflexions", Icon: NotebookPen },
  { href: "/reunion", label: "Réunion", Icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="glass pointer-events-auto mx-4 flex w-full max-w-[420px] items-center justify-around gap-1 rounded-pill border border-border-strong p-1.5 shadow-[var(--shadow-lg)]">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[18px] py-2"
            >
              {active ? (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-[18px] bg-accent/12 ring-1 ring-accent/25"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <Icon
                className={cn(
                  "relative h-[22px] w-[22px] transition-colors duration-200",
                  active ? "text-accent" : "text-ink-faint"
                )}
                strokeWidth={active ? 2.4 : 1.9}
              />
              <span
                className={cn(
                  "relative text-[10px] font-bold tracking-tight transition-colors duration-200",
                  active ? "text-accent" : "text-ink-faint"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
