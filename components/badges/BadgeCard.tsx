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

  const dimensions =
    size === "sm" ? "p-3 text-center" : "p-4 text-center";
  const iconSize = size === "sm" ? "text-2xl" : "text-3xl";

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center rounded-[var(--radius-card)] border bg-card transition-all duration-300",
        dimensions,
        unlocked ? "border-[--rarity] hover:-translate-y-0.5" : "border-border opacity-60"
      )}
      style={
        unlocked
          ? ({
              ["--rarity" as string]: meta.color,
              boxShadow: `0 0 0 1px ${meta.color}22, 0 8px 24px -16px ${meta.glow}`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          unlocked ? "" : "grayscale"
        )}
        style={
          unlocked
            ? { background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)` }
            : { background: "rgba(255,255,255,0.02)" }
        }
      >
        <span className={cn(iconSize, !unlocked && "opacity-50")}>
          {unlocked ? badge.icon : "🔒"}
        </span>
      </div>

      <h3
        className={cn(
          "mt-2 font-display text-sm leading-tight tracking-tight",
          unlocked ? "text-ink" : "text-ink-muted"
        )}
      >
        {showSecret ? "Secret" : badge.name}
      </h3>

      <p className="mt-1 text-[11px] leading-snug text-ink-faint">
        {showSecret ? "À découvrir." : badge.description}
      </p>

      <span
        className="mt-2 text-[10px] uppercase tracking-[0.18em]"
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
