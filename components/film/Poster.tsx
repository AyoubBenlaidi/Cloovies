import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/* Affiche de film — l'héroïne de l'app.
   Si posterUrl existe, on l'affiche (shimmer pendant le chargement).
   Sinon on génère une affiche déterministe, cinématographique : dégradé
   sombre teinté d'une couleur Cinoche + perforations de pellicule. */

// Teintes profondes dérivées de la palette Cinoche (jamais criardes).
const TINTS = [
  ["#1e1a07", "#0e0c05", "#fef102"], // jaune
  ["#1f0f1b", "#0d070c", "#fdabe9"], // rose
  ["#200c0a", "#0d0504", "#fe4237"], // rouge
  ["#08172a", "#040a14", "#0e82e9"], // bleu
  ["#0a1f17", "#04100b", "#33b47c"], // vert
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Hôtes optimisables via next/image. Toute autre URL → unoptimized (zéro crash).
function isOptimizableHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === "image.tmdb.org" ||
      hostname === "images.unsplash.com" ||
      hostname.endsWith(".supabase.co")
    );
  } catch {
    return false;
  }
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
    "relative aspect-[2/3] overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-md)]",
    className
  );

  if (posterUrl) {
    return (
      <div className={wrap}>
        {/* Shimmer en fond — recouvert dès que l'affiche est peinte. */}
        <div className="skeleton absolute inset-0" aria-hidden />
        <Image
          src={posterUrl}
          alt={title}
          fill
          sizes={sizes ?? "(max-width: 480px) 50vw, 240px"}
          className="object-cover"
          priority={priority}
          unoptimized={!isOptimizableHost(posterUrl)}
        />
        {/* Voile bas pour ancrer les overlays de titre. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    );
  }

  const [a, b, accent] = TINTS[hash(title) % TINTS.length];
  return (
    <div
      className={wrap}
      style={{ backgroundImage: `linear-gradient(155deg, ${a}, ${b})` }}
    >
      {/* Perforations de pellicule sur les bords */}
      <div
        className="absolute inset-y-0 left-0 w-3 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0 6px, transparent 6px 16px)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-y-0 right-0 w-3 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0 6px, transparent 6px 16px)",
        }}
        aria-hidden
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 80% at 50% 0%, transparent 35%, rgba(0,0,0,0.6) 100%)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <span
          className="mb-2 h-1 w-9 rounded-full"
          style={{ background: accent }}
        />
        <h3 className="font-heading text-lg leading-tight text-ink">{title}</h3>
        {year ? (
          <span className="mt-1 text-xs font-medium tracking-wide text-ink-faint">
            {year}
          </span>
        ) : null}
      </div>
    </div>
  );
}
