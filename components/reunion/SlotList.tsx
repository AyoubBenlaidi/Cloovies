"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatTime } from "@/lib/utils/format";
import { CheckIcon } from "@/components/nav/icons";
import { voteSlotAction, validateSlotAction } from "@/app/(app)/reunion/actions";
import type { Availability, SlotResult } from "@/lib/data/types";

const OPTIONS: { value: Availability; label: string; glyph: string }[] = [
  { value: "available", label: "Dispo", glyph: "✓" },
  { value: "maybe", label: "Si besoin", glyph: "~" },
  { value: "unavailable", label: "Indispo", glyph: "✕" },
];

const COLORS: Record<Availability, string> = {
  available: "var(--color-emo-espoir)",
  maybe: "var(--color-emo-joie)",
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
  const [localVote, setLocalVote] = useState<Record<string, Availability>>(
    () => Object.fromEntries(slots.filter((s) => s.myVote).map((s) => [s.id, s.myVote!]))
  );

  const finalSlot = slots.find((s) => s.isFinal);
  const recommended = !finalSlot ? slots[0] : null;

  function vote(slotId: string, av: Availability) {
    setLocalVote((v) => ({ ...v, [slotId]: av }));
    startTransition(() => voteSlotAction(slotId, av));
  }

  return (
    <div className="space-y-4">
      {recommended ? (
        <p className="rounded-2xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-ink-muted">
          Créneau recommandé :{" "}
          <span className="font-medium text-gold">
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
              "rounded-[var(--radius-card)] border p-4",
              s.isFinal
                ? "border-gold/60 bg-gold/5"
                : isReco
                  ? "border-gold/30 bg-card"
                  : "border-border bg-card"
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg leading-tight text-ink">
                  {formatDate(s.date)}
                </p>
                <p className="text-sm text-ink-muted">
                  {formatTime(s.startTime)} · {Math.round(s.durationMin / 60 * 10) / 10} h
                </p>
              </div>
              {s.isFinal ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-black">
                  <CheckIcon className="h-3 w-3" /> Officiel
                </span>
              ) : isReco ? (
                <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-medium text-gold">
                  Recommandé
                </span>
              ) : null}
            </div>

            {/* barre de participation */}
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-surface">
              <div style={{ width: `${pct}%`, backgroundColor: COLORS.available }} />
              <div
                style={{
                  width: `${s.total ? (s.maybe / s.total) * 100 : 0}%`,
                  backgroundColor: COLORS.maybe,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              {s.available} dispo · {s.maybe} si besoin · {s.unavailable} indispo
            </p>

            {/* mes disponibilités */}
            {!s.isFinal ? (
              <div className="mt-3 flex gap-2">
                {OPTIONS.map((o) => {
                  const active = mine === o.value;
                  return (
                    <button
                      key={o.value}
                      onClick={() => vote(s.id, o.value)}
                      className={cn(
                        "flex-1 rounded-xl border py-2 text-sm transition-all duration-200",
                        active ? "font-medium" : "text-ink-muted"
                      )}
                      style={{
                        borderColor: active ? COLORS[o.value] : "var(--color-border)",
                        backgroundColor: active ? `${COLORS[o.value]}1a` : "transparent",
                        color: active ? COLORS[o.value] : undefined,
                      }}
                    >
                      <span className="mr-1">{o.glyph}</span>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* validation admin */}
            {isAdmin && !finalSlot ? (
              <button
                onClick={() =>
                  startTransition(() => validateSlotAction(s.id, moovieId))
                }
                className="mt-3 w-full rounded-xl border border-border py-2 text-sm text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
              >
                Valider ce créneau
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
