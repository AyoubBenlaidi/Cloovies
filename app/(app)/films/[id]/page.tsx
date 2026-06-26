import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Play, Star, Ticket } from "lucide-react";
import { ParallaxPoster } from "@/components/film/ParallaxPoster";
import { RatingStars } from "@/components/film/RatingStars";
import { Card, Eyebrow, Tag } from "@/components/ui/Card";
import {
  getActiveCommunity,
  getCurrentMoovie,
  getCurrentUserId,
  getFilm,
  getFilmRating,
  getMyRating,
} from "@/lib/data";

export default async function FilmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const film = await getFilm(id, userId);
  if (!film) notFound();

  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  const [rating, myRating] = await Promise.all([
    getFilmRating(film.id),
    getMyRating(film.id, userId),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/films"
        className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-elevated py-1.5 pl-2 pr-3.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ink active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} /> Films
      </Link>

      <ParallaxPoster
        title={film.title}
        year={film.year}
        posterUrl={film.posterUrl}
      />

      <header className="animate-fade-up">
        <h1 className="font-display text-[2.1rem] text-ink text-balance">
          {film.title}
        </h1>
        {film.tagline ? (
          <p className="mt-1.5 text-lg font-medium italic text-accent">
            {film.tagline}
          </p>
        ) : null}
        <div className="mt-3.5 flex flex-wrap gap-2">
          {film.year ? <Tag>{film.year}</Tag> : null}
          {film.runtime ? <Tag>{film.runtime} min</Tag> : null}
          {film.director ? <Tag>{film.director}</Tag> : null}
          {film.genres.map((g) => (
            <Tag key={g}>{g}</Tag>
          ))}
        </div>
      </header>

      <section className="animate-fade-up">
        <Eyebrow>Synopsis</Eyebrow>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
          {film.description}
        </p>
      </section>

      {film.trailerUrl ? (
        <a
          href={film.trailerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3.5 rounded-[var(--radius-card)] border border-border bg-card px-4 py-3.5 transition-colors hover:border-accent/50 active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[var(--shadow-pop)] transition-transform group-hover:scale-105">
            <Play className="h-[18px] w-[18px] translate-x-0.5 fill-current" />
          </span>
          <span className="flex flex-col">
            <span className="font-subheading text-[15px] text-ink">
              Bande-annonce
            </span>
            <span className="text-xs text-ink-faint">Voir sur la source</span>
          </span>
        </a>
      ) : null}

      {/* Stats : votes + moyenne */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Ticket className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <Eyebrow className="mt-3 block">Votes du cercle</Eyebrow>
          <p className="mt-1.5 font-display text-3xl text-ink">
            {film.voteCount}
          </p>
        </Card>
        <Card>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pink/15 text-pink">
            <Star className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <Eyebrow className="mt-3 block">Moyenne du groupe</Eyebrow>
          {rating.average !== null ? (
            <p className="mt-1.5 font-display text-3xl text-ink">
              {rating.average}
              <span className="text-base text-ink-faint">/10</span>
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-ink-faint">Pas encore de note</p>
          )}
        </Card>
      </div>

      {/* Notation */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <Eyebrow>Votre note</Eyebrow>
          {rating.average !== null ? (
            <span className="text-xs text-ink-faint">
              {rating.count} note{rating.count > 1 ? "s" : ""}
            </span>
          ) : null}
        </div>
        {moovie ? (
          <RatingStars moovieId={moovie.id} filmId={film.id} initial={myRating} />
        ) : null}
      </Card>
    </div>
  );
}
