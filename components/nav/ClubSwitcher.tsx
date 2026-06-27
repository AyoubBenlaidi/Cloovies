"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Plus, Ticket } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { switchCommunityAction } from "@/app/(app)/community/actions";
import { cn } from "@/lib/utils/cn";
import type { CommunitySummary } from "@/lib/data/types";

export function ClubSwitcher({
  communities,
  activeId,
  activeName,
}: {
  communities: CommunitySummary[];
  activeId: string;
  activeName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Changer de club"
        className="flex min-w-0 flex-col items-start leading-none active:opacity-70"
      >
        <span className="text-overline text-ink-faint">Le club</span>
        <span className="mt-1 flex max-w-[46vw] items-center gap-1">
          <span className="truncate font-heading text-[17px] text-ink">
            {activeName}
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-ink-faint"
            strokeWidth={2.5}
          />
        </span>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Vos clubs">
        <div className="space-y-2">
          {communities.map((c) => {
            const active = c.id === activeId;
            return (
              <form key={c.id} action={switchCommunityAction}>
                <input type="hidden" name="communityId" value={c.id} />
                <button
                  type="submit"
                  disabled={active}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-[var(--radius-card)] border p-4 text-left transition-colors",
                    active
                      ? "border-accent bg-accent/[0.07]"
                      : "border-border bg-card hover:border-border-strong active:scale-[0.99]"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-subheading text-[15px] text-ink">
                      {c.name}
                    </span>
                    <span className="text-xs text-ink-faint">
                      {c.role === "admin" ? "Administrateur" : "Membre"}
                    </span>
                  </span>
                  {active ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs font-semibold text-ink-faint">
                      Basculer
                    </span>
                  )}
                </button>
              </form>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/join"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 rounded-pill border border-border bg-elevated py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <Ticket className="h-4 w-4" strokeWidth={2} />
            Rejoindre
          </Link>
          <Link
            href="/start"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 rounded-pill border border-border bg-elevated py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Créer
          </Link>
        </div>
      </Sheet>
    </>
  );
}
