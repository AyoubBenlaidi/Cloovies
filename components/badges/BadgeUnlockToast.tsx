"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BADGE_BY_KEY, RARITY_META, type BadgeDef } from "@/lib/badges/catalog";

interface Props {
  /** Keys de badges fraîchement débloqués (consommés côté serveur). */
  badgeKeys: string[];
}

/**
 * Révélation séquentielle des badges nouvellement débloqués.
 * Chaque badge apparaît avec un pop ressort, un halo qui pulse et
 * quelques étincelles, puis s'efface seul (~2.6s).
 */
export function BadgeUnlockToast({ badgeKeys }: Props) {
  const badges = useMemo(
    () =>
      badgeKeys
        .map((k) => BADGE_BY_KEY.get(k))
        .filter((b): b is BadgeDef => !!b),
    [badgeKeys]
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!badges.length || index >= badges.length) return;
    const t = setTimeout(() => setIndex((i) => i + 1), 2600);
    return () => clearTimeout(t);
  }, [index, badges.length]);

  if (!badges.length || index >= badges.length) return null;

  const badge = badges[index];
  const meta = RARITY_META[badge.rarity];

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[max(env(safe-area-inset-top),16px)] z-[65] flex justify-center px-4"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -28, scale: 0.82 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
          className="glass relative max-w-[360px] overflow-hidden rounded-[var(--radius-card)] border px-5 py-4"
          style={{
            borderColor: meta.color,
            boxShadow: `0 0 0 1px ${meta.color}33, 0 22px 60px -22px ${meta.glow}`,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full blur-md"
                style={{ background: meta.glow }}
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.12, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                className="relative flex h-14 w-14 items-center justify-center rounded-full text-3xl"
                style={{
                  background: `radial-gradient(circle at 35% 30%, ${meta.color}33, transparent 70%)`,
                  boxShadow: `inset 0 0 0 1px ${meta.color}55`,
                }}
                initial={{ scale: 0.5, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 14, delay: 0.1 }}
              >
                {badge.icon}
              </motion.span>
              {/* Étincelles */}
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="absolute h-1.5 w-1.5 rounded-full"
                  style={{ background: meta.color }}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: [0, [-26, 22, 6, -14][i]],
                    y: [0, [-22, -26, -32, -18][i]],
                    scale: [0.5, 1, 0.6],
                  }}
                  transition={{ duration: 1.1, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: meta.color }}
              >
                Badge débloqué · {meta.label}
              </p>
              <p className="mt-1 truncate font-heading text-base text-ink">
                {badge.name}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-faint">
                {badge.description}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
