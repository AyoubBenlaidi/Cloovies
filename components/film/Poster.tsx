import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/* Affiche de film. Si posterUrl existe (ex. TMDB en V2), on l'affiche.
   Sinon on génère une affiche cinématographique déterministe à partir du
   titre — premium, sobre, sans dépendance externe (zéro image cassée). */

// Dégradés sobres, jamais criards (cf. design : pas de glow/néon).
const GRADIENTS = [
  ["#1a1a22", "#2a2230"],
  ["#181f1e", "#23302d"],
  ["#201a18", "#322723"],
  ["#15181f", "#222a38"],
  ["#1f181d", "#30222c"],
  ["#1a1c18", "#2a2e22"],
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Poster({
  title,
  year,
  posterUrl,
  className,
  sizes,
  priority,
}: {
  title: string;
  year?: number | null;
  posterUrl?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const wrap = cn(
    "relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface",
    className
  );

  if (posterUrl) {
    return (
      <div className={wrap}>
        <Image
          src={posterUrl}
          alt={title}
          fill
          sizes={sizes ?? "(max-width: 480px) 50vw, 240px"}
          className="object-cover"
          priority={priority}
        />
      </div>
    );
  }

  const [a, b] = GRADIENTS[hash(title) % GRADIENTS.length];
  return (
    <div
      className={wrap}
      style={{ backgroundImage: `linear-gradient(150deg, ${a}, ${b})` }}
    >
      {/* grain / vignette discrète */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <span className="mb-1 h-px w-8 bg-gold/60" />
        <h3 className="font-display text-lg leading-tight text-ink">{title}</h3>
        {year ? (
          <span className="mt-1 text-xs tracking-wide text-ink-faint">
            {year}
          </span>
        ) : null}
      </div>
    </div>
  );
}
