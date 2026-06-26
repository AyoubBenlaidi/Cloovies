import Link from "next/link";
import { MessageCircleQuestion, Star, Trophy, X } from "lucide-react";
import { EmotionReveal } from "@/components/reunion/EmotionReveal";
import { Poster } from "@/components/film/Poster";
import { Logo } from "@/components/ui/Logo";
import { EmptyState } from "@/components/ui/EmptyState";
import { EMOTION_META, type EmotionKind } from "@/lib/data/types";
import {
  getActiveCommunity,
  getCurrentMoovie,
  getFilmRating,
  getRevealedEmotions,
  getSelectedFilms,
} from "@/lib/data";

export const dynamic = "force-dynamic";

const DEBATE = [
  "Quelle émotion vous a surpris chez un autre membre ?",
  "Le film aurait-il mérité une meilleure note que la moyenne ?",
  "Quelle scène a divisé le cercle ?",
];

export default async function ReunionLivePage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  if (!moovie) {
    return (
      <div className="min-h-dvh" style={{ background: "#060606" }}>
        <EmptyState
          icon={Trophy}
          title="Aucun cycle en cours"
          description="Le mode réunion s'ouvrira lors du prochain Moovie."
        />
      </div>
    );
  }

  const [films, emotions] = await Promise.all([
    getSelectedFilms(moovie.id),
    getRevealedEmotions(moovie.id),
  ]);

  const filmsWithRating = (
    await Promise.all(
      films.map(async (f) => ({ film: f, rating: await getFilmRating(f.id) }))
    )
  ).sort((a, b) => (b.rating.average ?? -1) - (a.rating.average ?? -1));

  const dist = new Map<EmotionKind, number>();
  for (const e of emotions) dist.set(e.kind, (dist.get(e.kind) ?? 0) + 1);
  const distSorted = [...dist.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div
      className="relative mx-auto min-h-dvh w-full max-w-[480px] px-6 pb-16 pt-7"
      style={{
        background:
          "radial-gradient(120% 50% at 50% 0%, rgba(254,241,2,0.07), transparent 55%), #060606",
      }}
    >
      <Link
        href="/reunion"
        className="inline-flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/5 py-1.5 pl-2 pr-3.5 text-sm font-semibold text-ink-faint transition-colors hover:text-ink-muted"
      >
        <X className="h-4 w-4" strokeWidth={2.5} /> Quitter
      </Link>

      <header
        className="mt-8 flex flex-col items-center text-center animate-fade-up"
        style={{ animationDuration: "0.6s" }}
      >
        <Logo size={52} glow />
        <span className="mt-5 text-[11px] font-bold uppercase tracking-[0.34em] text-accent/80">
          Mode réunion
        </span>
        <h1 className="mt-3 font-display text-[2.4rem] leading-[0.95] text-ink text-balance">
          {moovie.theme}
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Le cercle se réunit. Tout se révèle.
        </p>
      </header>

      {/* Le verdict du groupe */}
      <section
        className="mt-12 animate-fade-up"
        style={{ animationDuration: "0.6s", animationDelay: "0.1s" }}
      >
        <h2 className="mb-4 flex items-center gap-2 text-overline text-ink-faint">
          <Star className="h-3.5 w-3.5" strokeWidth={2.5} /> Le verdict du groupe
        </h2>
        <div className="space-y-3">
          {filmsWithRating.map(({ film, rating }, i) => (
            <div
              key={film.id}
              className={cardClass(i)}
            >
              {i === 0 && rating.average !== null ? (
                <span className="absolute -left-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[var(--shadow-pop)]">
                  <Trophy className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              ) : null}
              <div className="h-16 w-11 shrink-0">
                <Poster
                  title={film.title}
                  year={film.year}
                  posterUrl={film.posterUrl}
                  className="h-full w-full rounded-[10px] shadow-none"
                  sizes="44px"
                />
              </div>
              <span className="min-w-0 flex-1 truncate font-subheading text-[15px] text-ink">
                {film.title}
              </span>
              <span className="shrink-0 text-right">
                <span className="font-display text-2xl text-accent">
                  {rating.average ?? "—"}
                </span>
                <span className="text-sm text-ink-faint">/10</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Émotion collective */}
      <section
        className="mt-12 animate-fade-up"
        style={{ animationDuration: "0.6s", animationDelay: "0.15s" }}
      >
        <h2 className="mb-4 text-overline text-ink-faint">Émotion collective</h2>
        {distSorted.length ? (
          <div className="mb-5 flex flex-wrap gap-2">
            {distSorted.map(([kind, count]) => (
              <span
                key={kind}
                className="inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-sm font-semibold"
                style={{
                  borderColor: `${EMOTION_META[kind].color}55`,
                  color: EMOTION_META[kind].color,
                  backgroundColor: `${EMOTION_META[kind].color}12`,
                }}
              >
                {EMOTION_META[kind].label}
                <span className="text-ink-faint">{count}</span>
              </span>
            ))}
          </div>
        ) : null}
        <EmotionReveal emotions={emotions} />
      </section>

      {/* Questions de débat */}
      <section
        className="mt-12 animate-fade-up"
        style={{ animationDuration: "0.6s", animationDelay: "0.2s" }}
      >
        <h2 className="mb-4 flex items-center gap-2 text-overline text-ink-faint">
          <MessageCircleQuestion className="h-3.5 w-3.5" strokeWidth={2.5} />
          Pour lancer le débat
        </h2>
        <ul className="space-y-2.5">
          {DEBATE.map((q) => (
            <li
              key={q}
              className="rounded-[var(--radius-card)] border border-white/10 bg-white/[0.03] p-4 text-[15px] leading-relaxed text-ink-muted"
            >
              {q}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function cardClass(i: number): string {
  return [
    "relative flex items-center gap-3 rounded-[var(--radius-card)] border p-3 pr-4",
    i === 0
      ? "border-accent/40 bg-accent/[0.06]"
      : "border-white/10 bg-white/[0.03]",
  ].join(" ");
}
