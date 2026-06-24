import Link from "next/link";
import { Poster } from "@/components/film/Poster";
import { Eyebrow } from "@/components/ui/Card";
import { BackIcon } from "@/components/nav/icons";
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

  return (
    <div className="space-y-8">
      <Link href="/profil" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <BackIcon className="h-5 w-5" /> Profil
      </Link>

      <header className="animate-fade-up">
        <Eyebrow>La mémoire du club</Eyebrow>
        <h1 className="mt-2 font-display text-[1.9rem] leading-tight tracking-tight">
          Historique
        </h1>
      </header>

      {/* Bibliothèque du club */}
      <section>
        <Eyebrow>Bibliothèque · {library.length} films vus</Eyebrow>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {library.map(({ film, moovie }) => (
            <div key={film.id}>
              <Poster
                title={film.title}
                year={film.year}
                posterUrl={film.posterUrl}
                sizes="33vw"
              />
              <p className="mt-1.5 truncate text-xs text-ink-muted">{film.title}</p>
              <p className="truncate text-[10px] text-ink-faint">#{moovie.number}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Moovies passés */}
      <section>
        <Eyebrow>Cycles passés</Eyebrow>
        <ul className="mt-3 space-y-3">
          {moovies.map((m) => (
            <li
              key={m.id}
              className="rounded-[var(--radius-card)] border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  Moovie #{m.number}
                </span>
                {m.meetingDate ? (
                  <span className="text-[11px] text-ink-faint">
                    {formatDate(m.meetingDate)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 font-display text-lg text-ink">{m.theme}</p>
              <p className="mt-1 text-sm text-ink-muted">{m.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
