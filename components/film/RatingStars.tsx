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
  const [, startTransition] = useTransition();

  const shown = hover ?? score ?? 0;

  function pick(n: number) {
    setScore(n);
    startTransition(() => rateFilmAction(moovieId, filmId, n));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1" onMouseLeave={() => setHover(null)}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onClick={() => pick(n)}
              aria-label={`Noter ${n} sur 10`}
              className={cn(
                "h-7 w-[7%] grow rounded-sm transition-colors duration-150",
                n <= shown ? "bg-gold" : "bg-surface"
              )}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-muted">
        {score ? (
          <>
            Votre note :{" "}
            <span className="font-display text-lg text-gold">{score}</span>
            <span className="text-ink-faint">/10</span>
          </>
        ) : (
          "Touchez pour attribuer votre note."
        )}
      </p>
    </div>
  );
}
