"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { EMOTION_META, type EmotionRevealed } from "@/lib/data/types";

/** Révélation collective : les cartes se retournent une à une — cérémonie. */
export function EmotionReveal({ emotions }: { emotions: EmotionRevealed[] }) {
  const [revealedCount, setRevealedCount] = useState(0);

  function revealNext() {
    if (revealedCount >= emotions.length) return;
    let i = revealedCount;
    const step = () => {
      i += 1;
      setRevealedCount(i);
      if (i < emotions.length) setTimeout(step, 900);
    };
    step();
  }

  const started = revealedCount > 0;

  if (emotions.length === 0) {
    return (
      <p className="rounded-[var(--radius-card)] border border-border bg-surface p-5 text-center text-sm text-ink-faint">
        Aucune émotion scellée pour ce cycle.
      </p>
    );
  }

  return (
    <div>
      {!started ? (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={revealNext}
          className="flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-card)] border border-accent/40 bg-accent/5 py-5 font-display text-lg text-accent transition-colors hover:bg-accent/10"
        >
          <Sparkles className="h-5 w-5" strokeWidth={2} />
          Révéler les émotions du cercle
        </motion.button>
      ) : null}

      <div className="mt-5 space-y-3">
        {emotions.map((e, i) => {
          const open = i < revealedCount;
          const meta = EMOTION_META[e.kind];
          return (
            <div
              key={e.id}
              className={cn("flip-card", open && "is-open")}
              style={{ minHeight: 138 }}
            >
              <motion.div
                className="flip-inner relative"
                style={{ minHeight: 138 }}
                animate={open ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              >
                {/* Face fermée — clin d'œil au logo (deux bobines) */}
                <div className="flip-face absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface">
                  <div className="flex gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-ink-faint/50" />
                    <span className="h-5 w-5 rounded-full bg-ink-faint/50" />
                  </div>
                  <span className="text-overline text-ink-faint">Scellée</span>
                </div>
                {/* Face révélée */}
                <div
                  className="flip-face flip-back absolute inset-0 rounded-[var(--radius-card)] border p-5"
                  style={{
                    borderColor: `${meta.color}55`,
                    backgroundImage: `linear-gradient(160deg, ${meta.color}24, transparent 75%)`,
                    boxShadow: open
                      ? `0 14px 50px -20px ${meta.color}88`
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-display text-2xl"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <Avatar
                        pseudo={e.author.pseudo}
                        photoUrl={e.author.photoUrl}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-ink-muted">
                        {e.author.pseudo}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 leading-relaxed text-ink">
                    {e.justification}
                  </p>
                </div>
              </motion.div>
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
