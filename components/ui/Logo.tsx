import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const RADIUS = {
  sm: "rounded-[10px]",
  md: "rounded-[14px]",
  lg: "rounded-[18px]",
} as const;

/**
 * Marque Club Cinoche — toujours l'asset original (jamais redessiné).
 * Le logo est un carré jaune ; on lui donne juste profondeur et coins doux.
 */
export function Logo({
  size = 40,
  radius = "md",
  className,
  priority,
  glow,
}: {
  size?: number;
  radius?: keyof typeof RADIUS;
  className?: string;
  priority?: boolean;
  glow?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden ring-1 ring-black/20",
        RADIUS[radius],
        className
      )}
      style={{
        width: size,
        height: size,
        boxShadow: glow
          ? "0 8px 30px -8px rgba(254,241,2,0.45)"
          : "var(--shadow-sm)",
      }}
    >
      <Image
        src="/logo.png"
        alt="Club Cinoche"
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

/** Mot-clé textuel "Cinoche" en Figtree Black — pour splash / titres de marque. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display leading-none", className)}>Cinoche</span>
  );
}
