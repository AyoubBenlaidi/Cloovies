"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import { rateFilmAction } from "@/app/(app)/films/actions";

/** Notation sur 10. */
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
      } catch {
        setScore(prev); // revert si l'enregistrement échoue
        setError(true);
      }
    });
  }

  return (
    <div onMouseLeave={() => setHover(null)}>
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = n <= shown;
          return (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onClick={() => pick(n)}
              aria-label={`Noter ${n} sur 10`}
              aria-pressed={score === n}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg border text-sm tabular-nums transition-all duration-150 active:scale-90",
                active
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-border bg-surface text-ink-faint hover:text-ink-muted"
              )}
            >
              {n}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        {score ? (
          <>
            Votre note :{" "}
            <span className="font-display text-lg text-gold">{score}</span>
            <span className="text-ink-faint">/10</span>
            {pending ? <span className="ml-2 text-ink-faint">…</span> : null}
          </>
        ) : (
          "Touchez un chiffre pour attribuer votre note."
        )}
      </p>

      {error ? (
        <p className="mt-1 text-xs text-emo-malaise">
          Impossible d'enregistrer la note. Réessayez.
        </p>
      ) : null}
    </div>
  );
}
