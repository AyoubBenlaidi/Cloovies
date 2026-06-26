"use client";

import { useState, useTransition } from "react";
import { Check, CheckCircle2, HelpCircle, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatTime } from "@/lib/utils/format";
import { toast } from "@/components/ui/Toast";
import { voteSlotAction, validateSlotAction } from "@/app/(app)/reunion/actions";
import type { Availability, SlotResult } from "@/lib/data/types";

const OPTIONS: {
  value: Availability;
  label: string;
  Icon: typeof Check;
}[] = [
  { value: "available", label: "Dispo", Icon: Check },
  { value: "maybe", label: "Si besoin", Icon: HelpCircle },
  { value: "unavailable", label: "Indispo", Icon: X },
];

const COLORS: Record<Availability, string> = {
  available: "var(--color-green)",
  maybe: "var(--color-yellow)",
  unavailable: "var(--color-ink-faint)",
};

export function SlotList({
  slots,
  moovieId,
  isAdmin,
}: {
  slots: SlotResult[];
  moovieId: string;
  isAdmin: boolean;
}) {
  const [, startTransition] = useTransition();
  const [localVote, setLocalVote] = useState<Record<string, Availability>>(() =>
    Object.fromEntries(
      slots.filter((s) => s.myVote).map((s) => [s.id, s.myVote!])
    )
  );

  const finalSlot = slots.find((s) => s.isFinal);
  const recommended = !finalSlot ? slots[0] : null;

  function vote(slotId: string, av: Availability) {
    setLocalVote((v) => ({ ...v, [slotId]: av }));
    startTransition(() => voteSlotAction(slotId, av));
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-[var(--radius-card)] border border-dashed border-border-strong bg-card p-5 text-center text-sm text-ink-faint">
        Aucun créneau proposé pour l'instant.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {recommended ? (
        <p className="rounded-[var(--radius-card)] border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-ink-muted">
          Créneau recommandé :{" "}
          <span className="font-bold text-accent">
            {formatDate(recommended.date)} · {formatTime(recommended.startTime)}
          </span>{" "}
          ({recommended.available} disponibles sur {recommended.total}).
        </p>
      ) : null}

      {slots.map((s) => {
        const mine = localVote[s.id] ?? s.myVote;
        const isReco = recommended?.id === s.id;
        const pct = s.total ? Math.round((s.available / s.total) * 100) : 0;
        return (
          <div
            key={s.id}
            className={cn(
              "rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-sm)]",
              s.isFinal
                ? "border-accent/60 bg-accent/[0.06]"
                : isReco
                  ? "border-accent/25 bg-card"
                  : "border-border bg-card"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-subheading text-lg leading-tight text-ink">
                  {formatDate(s.date)}
                </p>
                <p className="text-sm text-ink-muted">
                  {formatTime(s.startTime)} ·{" "}
                  {Math.round((s.durationMin / 60) * 10) / 10} h
                </p>
              </div>
              {s.isFinal ? (
                <span className="inline-flex items-center gap-1 rounded-pill bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-ink">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />{" "}
                  Officiel
                </span>
              ) : isReco ? (
                <span className="rounded-pill bg-accent/15 px-2.5 py-1 text-[11px] font-bold text-accent">
                  Recommandé
                </span>
              ) : null}
            </div>

            {/* barre de participation */}
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface">
              <div
                style={{ width: `${pct}%`, backgroundColor: COLORS.available }}
              />
              <div
                style={{
                  width: `${s.total ? (s.maybe / s.total) * 100 : 0}%`,
                  backgroundColor: COLORS.maybe,
                }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-ink-faint">
              {s.available} dispo · {s.maybe} si besoin · {s.unavailable} indispo
            </p>

            {!s.isFinal ? (
              <div className="mt-3 flex gap-2">
                {OPTIONS.map((o) => {
                  const active = mine === o.value;
                  const Icon = o.Icon;
                  return (
                    <button
                      key={o.value}
                      onClick={() => vote(s.id, o.value)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]",
                        active ? "" : "text-ink-muted"
                      )}
                      style={{
                        borderColor: active
                          ? COLORS[o.value]
                          : "var(--color-border)",
                        backgroundColor: active
                          ? `${COLORS[o.value]}1f`
                          : "transparent",
                        color: active ? COLORS[o.value] : undefined,
                      }}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.5} />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {isAdmin && !finalSlot ? (
              <button
                onClick={() =>
                  startTransition(() => {
                    validateSlotAction(s.id, moovieId);
                    toast("Créneau officialisé", { variant: "success" });
                  })
                }
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Sparkles className="h-4 w-4" strokeWidth={2} />
                Valider ce créneau
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
