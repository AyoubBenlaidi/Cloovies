"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { EMOTION_META, type EmotionRevealed } from "@/lib/data/types";

/** US19 — révélation collective. Les cartes se retournent une à une. */
export function EmotionReveal({ emotions }: { emotions: EmotionRevealed[] }) {
  const [revealedCount, setRevealedCount] = useState(0);

  function revealNext() {
    if (revealedCount >= emotions.length) return;
    // Révèle progressivement, jamais toutes d'un coup.
    let i = revealedCount;
    const step = () => {
      i += 1;
      setRevealedCount(i);
      if (i < emotions.length) setTimeout(step, 850);
    };
    step();
  }

  const started = revealedCount > 0;

  return (
    <div>
      {!started ? (
        <button
          onClick={revealNext}
          className="w-full rounded-[var(--radius-card)] border border-gold/40 bg-gold/5 py-5 font-display text-lg tracking-tight text-gold transition-colors hover:bg-gold/10"
        >
          Révéler les émotions du cercle
        </button>
      ) : null}

      <div className="mt-5 space-y-3">
        {emotions.map((e, i) => {
          const open = i < revealedCount;
          const meta = EMOTION_META[e.kind];
          return (
            <div
              key={e.id}
              className={cn("flip-card", open && "is-open")}
              style={{ minHeight: 132 }}
            >
              <div className="flip-inner relative" style={{ minHeight: 132 }}>
                {/* Face fermée */}
                <div className="flip-face absolute inset-0 flex items-center justify-center rounded-[var(--radius-card)] border border-border bg-surface">
                  <span className="font-display text-2xl text-ink-faint">?</span>
                </div>
                {/* Face révélée */}
                <div
                  className="flip-face flip-back absolute inset-0 rounded-[var(--radius-card)] border p-5"
                  style={{
                    borderColor: `${meta.color}55`,
                    backgroundImage: `linear-gradient(160deg, ${meta.color}1f, transparent)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display text-xl"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <Avatar pseudo={e.author.pseudo} photoUrl={e.author.photoUrl} size="sm" />
                      <span className="text-sm text-ink-muted">{e.author.pseudo}</span>
                    </div>
                  </div>
                  <p className="mt-3 leading-relaxed text-ink">{e.justification}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {started && revealedCount < emotions.length ? (
        <p className="mt-4 text-center text-sm text-ink-faint">
          Révélation en cours… {revealedCount}/{emotions.length}
        </p>
      ) : null}
    </div>
  );
}
