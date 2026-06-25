"use client";

import { useEffect, useMemo, useState } from "react";
import { BADGE_BY_KEY, RARITY_META, type BadgeDef } from "@/lib/badges/catalog";

interface Props {
  /** Liste des keys de badges fraîchement débloqués (consommée côté serveur). */
  badgeKeys: string[];
}

/**
 * Affiche en séquence (~2.4s par badge) une animation de révélation
 * pour chaque badge nouvellement débloqué. Confetti discret, halo or.
 * Le composant disparaît seul une fois tous les badges affichés.
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
  const [phase, setPhase] = useState<"enter" | "hold" | "leave">("enter");

  useEffect(() => {
    if (!badges.length || index >= badges.length) return;
    setPhase("enter");
    const t1 = setTimeout(() => setPhase("hold"), 350);
    const t2 = setTimeout(() => setPhase("leave"), 2000);
    const t3 = setTimeout(() => setIndex((i) => i + 1), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [index, badges.length]);

  if (!badges.length || index >= badges.length) return null;

  const badge = badges[index];
  const meta = RARITY_META[badge.rarity];

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4"
    >
      <div
        className="relative max-w-[360px] rounded-[var(--radius-card)] border bg-card/95 px-5 py-4 backdrop-blur-md transition-all duration-300"
        style={{
          borderColor: meta.color,
          boxShadow: `0 0 0 1px ${meta.color}33, 0 18px 60px -20px ${meta.glow}, 0 0 40px ${meta.glow}`,
          transform:
            phase === "enter"
              ? "translateY(-12px) scale(0.96)"
              : phase === "leave"
              ? "translateY(-12px) scale(0.96)"
              : "translateY(0) scale(1)",
          opacity: phase === "hold" ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl"
            style={{
              background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)`,
              animation: phase === "hold" ? "badge-pop 0.6s var(--ease)" : undefined,
            }}
          >
            {badge.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] uppercase tracking-[0.22em]"
              style={{ color: meta.color }}
            >
              Badge débloqué · {meta.label}
            </p>
            <p className="mt-1 truncate font-display text-base text-ink">
              {badge.name}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-faint">
              {badge.description}
            </p>
          </div>
        </div>

        {/* Confetti minimaliste */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--radius-card)]">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full"
              style={{
                left: `${10 + (i * 8) % 80}%`,
                top: "50%",
                background: i % 2 ? meta.color : "var(--color-gold)",
                opacity: 0,
                animation:
                  phase === "hold"
                    ? `badge-confetti-${i % 3} 1.4s var(--ease) ${i * 30}ms forwards`
                    : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes badge-pop {
          0% { transform: scale(0.6); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes badge-confetti-0 {
          0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translate(-22px, -28px) scale(1); }
        }
        @keyframes badge-confetti-1 {
          0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translate(18px, -32px) scale(1); }
        }
        @keyframes badge-confetti-2 {
          0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translate(2px, -36px) scale(1); }
        }
      `}</style>
    </div>
  );
}
