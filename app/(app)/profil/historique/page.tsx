import Link from "next/link";
import { ChevronLeft, Library } from "lucide-react";
import { Poster } from "@/components/film/Poster";
import { Eyebrow } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getActiveCommunity,
  getArchivedMoovies,
  getClubLibrary,
} from "@/lib/data";
import { formatDate } from "@/lib/utils/format";

export default async function HistoriquePage() {
  const community = await getActiveCommunity();
  const [moovies, library] = await Promise.all([
    getArchivedMoovies(community.id),
    getClubLibrary(community.id),
  ]);

  const isEmpty = library.length === 0 && moovies.length === 0;

  return (
    <div className="space-y-8">
      <Link
        href="/profil"
        className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-elevated py-1.5 pl-2 pr-3.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ink active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} /> Profil
      </Link>

      <header className="animate-fade-up">
        <Eyebrow tone="accent">La mémoire du club</Eyebrow>
        <h1 className="mt-2 font-display text-[2rem] text-ink">Historique</h1>
      </header>

      {isEmpty ? (
        <EmptyState
          icon={Library}
          color="blue"
          title="La bibliothèque est vide"
          description="Les films projetés et les cycles passés s'archiveront ici, séance après séance."
        />
      ) : null}

      {/* Bibliothèque du club */}
      {library.length ? (
        <section>
          <Eyebrow>Bibliothèque · {library.length} films vus</Eyebrow>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {library.map(({ film, moovie }) => (
              <Link
                key={film.id}
                href={`/films/${film.id}`}
                className="group active:scale-[0.97] transition-transform"
              >
                <Poster
                  title={film.title}
                  year={film.year}
                  posterUrl={film.posterUrl}
                  sizes="33vw"
                />
                <p className="mt-1.5 truncate text-xs font-semibold text-ink-muted">
                  {film.title}
                </p>
                <p className="truncate text-[10px] text-ink-faint">
                  Moovie #{moovie.number}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Moovies passés */}
      {moovies.length ? (
        <section>
          <Eyebrow>Cycles passés</Eyebrow>
          <ul className="mt-3 space-y-3">
            {moovies.map((m) => (
              <li
                key={m.id}
                className="rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-overline text-accent/80">
                    Moovie #{m.number}
                  </span>
                  {m.meetingDate ? (
                    <span className="text-[11px] text-ink-faint">
                      {formatDate(m.meetingDate)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 font-subheading text-lg text-ink">
                  {m.theme}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  {m.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
