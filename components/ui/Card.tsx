import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
  elevated,
  interactive,
}: {
  className?: string;
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border p-5 shadow-[var(--shadow-sm)]",
        elevated ? "bg-elevated" : "bg-card",
        interactive &&
          "transition-[transform,border-color,background-color] duration-[250ms] [transition-timing-function:var(--ease)] hover:-translate-y-0.5 hover:border-border-strong hover:bg-card-hover active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Surtitre en capitales espacées — ton "club privé". */
export function Eyebrow({
  children,
  className,
  tone = "faint",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "faint" | "muted" | "accent";
}) {
  const color =
    tone === "accent"
      ? "text-accent"
      : tone === "muted"
        ? "text-ink-muted"
        : "text-ink-faint";
  return (
    <span className={cn("text-overline", color, className)}>{children}</span>
  );
}

/** Petite étiquette discrète. */
export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-muted",
        className
      )}
    >
      {children}
    </span>
  );
}

/** Chip coloré, sémantique ou sélectionnable. */
export function Chip({
  children,
  className,
  color = "neutral",
  active,
}: {
  children: React.ReactNode;
  className?: string;
  color?: "neutral" | "accent" | "pink" | "red" | "blue" | "green";
  active?: boolean;
}) {
  const tones: Record<string, string> = {
    neutral: "border-border bg-elevated text-ink-muted",
    accent: "border-accent/30 bg-accent/10 text-accent",
    pink: "border-pink/30 bg-pink/10 text-pink",
    red: "border-red/30 bg-red/10 text-red",
    blue: "border-blue/30 bg-blue/10 text-blue",
    green: "border-green/30 bg-green/10 text-green",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-[12px] font-semibold tracking-tight",
        active ? "border-accent bg-accent text-accent-ink" : tones[color],
        className
      )}
    >
      {children}
    </span>
  );
}
