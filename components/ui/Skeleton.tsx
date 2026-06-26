import { cn } from "@/lib/utils/cn";

/** Placeholder shimmer — jamais de spinner centré. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("skeleton rounded-[var(--radius-sm)]", className)} />
  );
}

/** Squelette d'affiche, ratio 2/3. */
export function PosterSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "skeleton aspect-[2/3] rounded-[var(--radius-card)] border border-border",
        className
      )}
    />
  );
}
