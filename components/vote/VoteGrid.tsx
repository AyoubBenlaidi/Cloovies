"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Poster } from "@/components/film/Poster";
import { CheckIcon } from "@/components/nav/icons";
import { cn } from "@/lib/utils/cn";
import { toggleVoteAction } from "@/app/(app)/films/actions";
import type { FilmWithVotes } from "@/lib/data/types";

/** Son discret au vote (WebAudio) — facultatif, très doux. */
function playTick() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    /* silencieux */
  }
}

export function VoteGrid({
  films,
  moovieId,
  maxVotes,
  votingOpen,
}: {
  films: FilmWithVotes[];
  moovieId: string;
  maxVotes: number;
  votingOpen: boolean;
}) {
  const [voted, setVoted] = useState<Record<string, boolean>>(
    () => Object.fromEntries(films.map((f) => [f.id, f.votedByMe]))
  );
  const [counts, setCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(films.map((f) => [f.id, f.voteCount]))
  );
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const used = Object.values(voted).filter(Boolean).length;
  const remaining = maxVotes - used;

  function onToggle(id: string) {
    if (!votingOpen) return;
    const isVoted = voted[id];

    if (!isVoted && remaining <= 0) {
      setShakeId(id);
      setTimeout(() => setShakeId(null), 400);
      return;
    }

    // Optimiste
    setVoted((v) => ({ ...v, [id]: !isVoted }));
    setCounts((c) => ({ ...c, [id]: c[id] + (isVoted ? -1 : 1) }));
    if (!isVoted) playTick();

    startTransition(async () => {
      const res = await toggleVoteAction(moovieId, id);
      if (!res.ok) {
        setVoted((v) => ({ ...v, [id]: isVoted }));
        setCounts((c) => ({ ...c, [id]: c[id] + (isVoted ? 1 : -1) }));
      }
    });
  }

  return (
    <div>
      {votingOpen ? (
        <p className="mb-4 text-sm text-ink-muted">
          {remaining > 0 ? (
            <>
              Il vous reste{" "}
              <span className="font-medium text-gold">
                {remaining} vote{remaining > 1 ? "s" : ""}
              </span>{" "}
              sur {maxVotes}.
            </>
          ) : (
            <span className="text-gold">
              Vos {maxVotes} votes sont placés. Touchez pour changer d'avis.
            </span>
          )}
        </p>
      ) : (
        <p className="mb-4 text-sm text-ink-muted">
          Le vote est clos. Voici le verdict du cercle.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {films.map((f, i) => {
          const isVoted = voted[f.id];
          const rank = i + 1;
          return (
            <div
              key={f.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={cn(
                  "relative transition-transform duration-[250ms] [transition-timing-function:var(--ease)]",
                  isVoted && "scale-[1.03]",
                  shakeId === f.id && "animate-[fade-in_0.4s]"
                )}
              >
                <Link href={`/films/${f.id}`}>
                  <Poster
                    title={f.title}
                    year={f.year}
                    posterUrl={f.posterUrl}
                    className={cn(
                      "transition-all duration-[250ms] [transition-timing-function:var(--ease)]",
                      isVoted
                        ? "ring-2 ring-gold shadow-[0_10px_40px_-12px_rgba(200,155,60,0.6)]"
                        : "ring-0"
                    )}
                  />
                </Link>

                {/* badge classement (vote clos) */}
                {!votingOpen && rank <= 2 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-black">
                    {rank === 1 ? "Lauréat" : "Retenu"}
                  </span>
                ) : null}

                {/* bouton vote */}
                {votingOpen ? (
                  <button
                    onClick={() => onToggle(f.id)}
                    aria-pressed={isVoted}
                    aria-label={isVoted ? "Retirer mon vote" : "Voter"}
                    className={cn(
                      "absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-[250ms] [transition-timing-function:var(--ease)] active:scale-90",
                      isVoted
                        ? "border-gold bg-gold text-black"
                        : "border-border bg-black/60 text-ink-muted backdrop-blur hover:text-ink"
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="truncate font-display text-[15px] text-ink">
                  {f.title}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-xs tabular-nums",
                    isVoted ? "text-gold" : "text-ink-faint"
                  )}
                >
                  {counts[f.id]} ♦
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
