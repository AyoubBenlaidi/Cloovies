"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { rateFilmAction } from "@/app/(app)/films/actions";
import { toast } from "@/components/ui/Toast";

/** Notation sur 10 — chiffres tappables, retour optimiste. */
export function RatingStars({
  moovieId,
  filmId,
  initial,
}: {
  moovieId: string;
  filmId: string;
  initial: number | null;
}) {
  const [score, setScore] = useState<number | null>(initial);
  const [hover, setHover] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  const shown = hover ?? score ?? 0;

  function pick(n: number) {
    const prev = score;
    setScore(n); // optimiste
    setError(false);
    startTransition(async () => {
      try {
        await rateFilmAction(moovieId, filmId, n);
        toast(`Note enregistrée : ${n}/10`, { variant: "success" });
      } catch {
        setScore(prev); // revert si l'enregistrement échoue
        setError(true);
        toast("Impossible d'enregistrer la note.", { variant: "error" });
      }
    });
  }

  return (
    <div onMouseLeave={() => setHover(null)}>
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = n <= shown;
          const isPick = score === n;
          return (
            <motion.button
              key={n}
              type="button"
              whileTap={{ scale: 0.85 }}
              animate={isPick ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHover(n)}
              onClick={() => pick(n)}
              aria-label={`Noter ${n} sur 10`}
              aria-pressed={isPick}
              className={cn(
                "flex h-10 items-center justify-center rounded-[10px] border text-sm font-bold tabular-nums transition-colors duration-150",
                active
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-surface text-ink-faint hover:text-ink-muted"
              )}
            >
              {n}
            </motion.button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        {score ? (
          <>
            Votre note :{" "}
            <span className="font-display text-lg text-accent">{score}</span>
            <span className="text-ink-faint">/10</span>
            {pending ? <span className="ml-2 text-ink-faint">…</span> : null}
          </>
        ) : (
          "Touchez un chiffre pour attribuer votre note."
        )}
      </p>

      {error ? (
        <p className="mt-1 text-xs text-red">
          Impossible d'enregistrer la note. Réessayez.
        </p>
      ) : null}
    </div>
  );
}
