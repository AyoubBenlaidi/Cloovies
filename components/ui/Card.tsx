import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
  elevated,
}: {
  className?: string;
  children: React.ReactNode;
  elevated?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border p-5",
        elevated ? "bg-elevated" : "bg-card",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Petit label en capitales espacées — ton "club privé". */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[11px] uppercase tracking-[0.22em] text-ink-faint",
        className
      )}
    >
      {children}
    </span>
  );
}

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
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-ink-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
