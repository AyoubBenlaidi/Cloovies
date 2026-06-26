import { Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { type BadgeDef, RARITY_META } from "@/lib/badges/catalog";

interface Props {
  badge: BadgeDef;
  unlocked: boolean;
  unlockedAt?: string | null;
  size?: "sm" | "md";
}

export function BadgeCard({ badge, unlocked, unlockedAt, size = "md" }: Props) {
  const meta = RARITY_META[badge.rarity];
  const showSecret = !unlocked && badge.hidden;
  const pad = size === "sm" ? "p-3" : "p-4";
  const iconSize = size === "sm" ? "text-2xl" : "text-3xl";

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center overflow-hidden rounded-[var(--radius-card)] border text-center transition-all duration-300",
        pad,
        unlocked
          ? "bg-card hover:-translate-y-1"
          : "border-border bg-surface/60"
      )}
      style={
        unlocked
          ? ({
              borderColor: `${meta.color}66`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px -18px ${meta.glow}`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Reflet métallique qui balaie au survol (débloqués) */}
      {unlocked ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-y-2 -left-1/3 w-1/3 -translate-x-full rotate-[8deg] bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
        />
      ) : null}

      {/* Médaillon */}
      <div className="relative flex h-14 w-14 items-center justify-center">
        {unlocked ? (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full blur-md"
            style={{ background: meta.glow }}
          />
        ) : null}
        <span
          className="relative flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: unlocked
              ? `radial-gradient(circle at 35% 30%, ${meta.color}33, ${meta.color}10 60%, transparent 75%)`
              : "rgba(255,255,255,0.03)",
            boxShadow: unlocked
              ? `inset 0 0 0 1px ${meta.color}40`
              : "inset 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          <span className={cn(iconSize, !unlocked && "opacity-25 grayscale")}>
            {showSecret ? "✦" : badge.icon}
          </span>
        </span>
        {!unlocked ? (
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-elevated text-ink-faint">
            <Lock className="h-3 w-3" strokeWidth={2.5} />
          </span>
        ) : null}
      </div>

      <h3
        className={cn(
          "mt-2.5 font-subheading text-sm leading-tight",
          unlocked ? "text-ink" : "text-ink-muted"
        )}
      >
        {showSecret ? "Secret" : badge.name}
      </h3>

      <p className="mt-1 text-[11px] leading-snug text-ink-faint">
        {showSecret ? "À découvrir." : badge.description}
      </p>

      <span
        className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{ color: unlocked ? meta.color : "var(--color-ink-faint)" }}
      >
        {meta.label}
      </span>

      {unlocked && unlockedAt ? (
        <span className="mt-0.5 text-[10px] text-ink-faint">
          {formatDate(unlockedAt)}
        </span>
      ) : null}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
