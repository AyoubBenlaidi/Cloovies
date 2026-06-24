import Link from "next/link";
import { notFound } from "next/navigation";
import { ParallaxPoster } from "@/components/film/ParallaxPoster";
import { RatingStars } from "@/components/film/RatingStars";
import { Card, Eyebrow, Tag } from "@/components/ui/Card";
import { BackIcon, PlayIcon } from "@/components/nav/icons";
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
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <BackIcon className="h-5 w-5" /> Films
      </Link>

      <ParallaxPoster
        title={film.title}
        year={film.year}
        posterUrl={film.posterUrl}
      />

      <header className="animate-fade-up">
        <h1 className="font-display text-[2rem] leading-tight tracking-tight">
          {film.title}
        </h1>
        {film.tagline ? (
          <p className="mt-1 font-display text-lg italic text-gold/90">
            {film.tagline}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
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
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          {film.description}
        </p>
      </section>

      {film.trailerUrl ? (
        <a
          href={film.trailerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:border-gold/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-black">
            <PlayIcon className="h-4 w-4" />
          </span>
          <span className="text-sm text-ink">Regarder la bande-annonce</span>
        </a>
      ) : null}

      {/* Votes */}
      <Card>
        <div className="flex items-center justify-between">
          <Eyebrow>Votes du cercle</Eyebrow>
          <span className="font-display text-2xl text-gold">
            {film.voteCount}
          </span>
        </div>
      </Card>

      {/* Notation */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <Eyebrow>Votre note</Eyebrow>
          {rating.average !== null ? (
            <span className="text-sm text-ink-muted">
              Moyenne du groupe{" "}
              <span className="font-display text-lg text-ink">
                {rating.average}
              </span>
              <span className="text-ink-faint">/10 · {rating.count}</span>
            </span>
          ) : null}
        </div>
        {moovie ? (
          <RatingStars
            moovieId={moovie.id}
            filmId={film.id}
            initial={myRating}
          />
        ) : null}
      </Card>
    </div>
  );
}
