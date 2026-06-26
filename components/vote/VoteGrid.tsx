"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Plus, Ticket, Trophy } from "lucide-react";
import { Poster } from "@/components/film/Poster";
import { toast } from "@/components/ui/Toast";
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
  const [voted, setVoted] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(films.map((f) => [f.id, f.votedByMe]))
  );
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(films.map((f) => [f.id, f.voteCount]))
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
      setTimeout(() => setShakeId(null), 450);
      toast(`Vous avez déjà placé vos ${maxVotes} votes.`, { variant: "info" });
      return;
    }

    setVoted((v) => ({ ...v, [id]: !isVoted }));
    setCounts((c) => ({ ...c, [id]: c[id] + (isVoted ? -1 : 1) }));
    if (!isVoted) playTick();

    startTransition(async () => {
      const res = await toggleVoteAction(moovieId, id);
      if (!res.ok) {
        setVoted((v) => ({ ...v, [id]: isVoted }));
        setCounts((c) => ({ ...c, [id]: c[id] + (isVoted ? 1 : -1) }));
        toast("Vote non enregistré. Réessayez.", { variant: "error" });
      }
    });
  }

  return (
    <div>
      {votingOpen ? (
        <div className="mb-5 flex items-center gap-2.5 rounded-[var(--radius-card)] border border-border bg-card p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Ticket className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <p className="text-sm text-ink-muted">
            {remaining > 0 ? (
              <>
                Il vous reste{" "}
                <span className="font-bold text-accent">
                  {remaining} vote{remaining > 1 ? "s" : ""}
                </span>{" "}
                sur {maxVotes}.
              </>
            ) : (
              <span className="font-semibold text-accent">
                Vos {maxVotes} votes sont placés. Touchez pour changer d'avis.
              </span>
            )}
          </p>
        </div>
      ) : (
        <p className="mb-5 text-sm text-ink-muted">
          Le vote est clos. Voici le verdict du cercle.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {films.map((f, i) => {
          const isVoted = voted[f.id];
          const rank = i + 1;
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
            >
              <motion.div
                className="relative"
                animate={{
                  scale: isVoted ? 1.03 : 1,
                  x: shakeId === f.id ? [0, -6, 6, -4, 0] : 0,
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/films/${f.id}`}>
                  <Poster
                    title={f.title}
                    year={f.year}
                    posterUrl={f.posterUrl}
                    className={cn(
                      "transition-shadow duration-[250ms]",
                      isVoted
                        ? "ring-2 ring-accent shadow-[var(--shadow-pop)]"
                        : "ring-0"
                    )}
                  />
                </Link>

                {!votingOpen && rank <= 2 ? (
                  <span
                    className={cn(
                      "absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold",
                      rank === 1
                        ? "bg-accent text-accent-ink"
                        : "bg-black/70 text-ink backdrop-blur"
                    )}
                  >
                    {rank === 1 ? (
                      <>
                        <Trophy className="h-3 w-3" strokeWidth={2.5} /> Lauréat
                      </>
                    ) : (
                      "Retenu"
                    )}
                  </span>
                ) : null}

                {votingOpen ? (
                  <motion.button
                    whileTap={{ scale: 0.86 }}
                    onClick={() => onToggle(f.id)}
                    aria-pressed={isVoted}
                    aria-label={isVoted ? "Retirer mon vote" : "Voter"}
                    className={cn(
                      "absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-[250ms]",
                      isVoted
                        ? "border-accent bg-accent text-accent-ink shadow-[var(--shadow-pop)]"
                        : "border-white/15 bg-black/55 text-ink backdrop-blur-md hover:bg-black/70"
                    )}
                  >
                    {isVoted ? (
                      <Check className="h-[18px] w-[18px]" strokeWidth={3} />
                    ) : (
                      <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
                    )}
                  </motion.button>
                ) : null}
              </motion.div>

              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="truncate font-subheading text-[15px] text-ink">
                  {f.title}
                </span>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 text-xs font-bold tabular-nums",
                    isVoted ? "text-accent" : "text-ink-faint"
                  )}
                >
                  <Ticket className="h-3.5 w-3.5" strokeWidth={2} />
                  {counts[f.id]}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
