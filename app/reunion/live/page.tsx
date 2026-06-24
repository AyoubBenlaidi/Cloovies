import Link from "next/link";
import { EmotionReveal } from "@/components/reunion/EmotionReveal";
import { BackIcon } from "@/components/nav/icons";
import { EMOTION_META, type EmotionKind } from "@/lib/data/types";
import {
  getActiveCommunity,
  getCurrentMoovie,
  getFilmRating,
  getRevealedEmotions,
  getSelectedFilms,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReunionLivePage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  if (!moovie) {
    return <div className="mt-24 text-center text-ink-muted">Aucun cycle en cours.</div>;
  }

  const [films, emotions] = await Promise.all([
    getSelectedFilms(moovie.id),
    getRevealedEmotions(moovie.id),
  ]);

  const filmsWithRating = await Promise.all(
    films.map(async (f) => ({ film: f, rating: await getFilmRating(f.id) }))
  );

  // Distribution des émotions
  const dist = new Map<EmotionKind, number>();
  for (const e of emotions) dist.set(e.kind, (dist.get(e.kind) ?? 0) + 1);
  const distSorted = [...dist.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div
      className="mx-auto min-h-dvh w-full max-w-[480px] px-6 py-8"
      style={{ background: "#060606" }}
    >
      <Link
        href="/reunion"
        className="inline-flex items-center gap-1 text-sm text-ink-faint hover:text-ink-muted"
      >
        <BackIcon className="h-5 w-5" /> Quitter
      </Link>

      <header className="mt-6 text-center animate-fade-up">
        <span className="text-[11px] uppercase tracking-[0.32em] text-gold/70">
          Mode réunion
        </span>
        <h1 className="mt-3 font-display text-[2.2rem] leading-tight tracking-tight">
          {moovie.theme}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">Le cercle se réunit. Tout se révèle.</p>
      </header>

      {/* Notes moyennes */}
      <section className="mt-10">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink-faint">
          Le verdict du groupe
        </h2>
        <div className="space-y-3">
          {filmsWithRating.map(({ film, rating }) => (
            <div
              key={film.id}
              className="flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4"
            >
              <span className="font-display text-lg text-ink">{film.title}</span>
              <span className="text-right">
                <span className="font-display text-2xl text-gold">
                  {rating.average ?? "—"}
                </span>
                <span className="text-sm text-ink-faint">/10</span>
                <span className="ml-2 text-xs text-ink-faint">
                  {rating.count} note{rating.count > 1 ? "s" : ""}
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Émotion collective */}
      <section className="mt-10">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink-faint">
          Émotion collective
        </h2>
        <div className="mb-5 flex flex-wrap gap-2">
          {distSorted.map(([kind, count]) => (
            <span
              key={kind}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm"
              style={{
                borderColor: `${EMOTION_META[kind].color}55`,
                color: EMOTION_META[kind].color,
              }}
            >
              {EMOTION_META[kind].label}
              <span className="text-ink-faint">{count}</span>
            </span>
          ))}
        </div>
        <EmotionReveal emotions={emotions} />
      </section>

      {/* Questions de débat */}
      <section className="mt-10">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.22em] text-ink-faint">
          Pour lancer le débat
        </h2>
        <ul className="space-y-2 text-[15px] leading-relaxed text-ink-muted">
          <li className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
            Quelle émotion vous a surpris chez un autre membre ?
          </li>
          <li className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
            Le film aurait-il mérité une meilleure note que la moyenne ?
          </li>
          <li className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
            Quelle scène a divisé le cercle ?
          </li>
        </ul>
      </section>
    </div>
  );
}
