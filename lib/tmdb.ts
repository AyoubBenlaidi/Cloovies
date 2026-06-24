/* ============================================================
   Client TMDB — UNIQUEMENT côté serveur.
   La clé (TMDB_API_KEY) n'est jamais exposée au navigateur :
   ce module n'est importé que depuis des Server Actions.

   Supporte les deux formats de clé :
   - API Key v3 (chaîne hex) → en query param ?api_key=
   - Read Access Token v4 (JWT "eyJ…") → en header Authorization: Bearer
   ============================================================ */

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

export function isTmdbConfigured(): boolean {
  return !!process.env.TMDB_API_KEY;
}

async function tmdbFetch(
  path: string,
  params: Record<string, string> = {},
  revalidate = false
): Promise<unknown> {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_NOT_CONFIGURED");

  const url = new URL(BASE + path);
  url.searchParams.set("language", "fr-FR");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const headers: Record<string, string> = { accept: "application/json" };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  else url.searchParams.set("api_key", key);

  const res = await fetch(url, {
    headers,
    ...(revalidate
      ? { next: { revalidate: 60 * 60 * 24 } } // détails : stables, cache 24h
      : { cache: "no-store" }), // recherche : toujours frais
  });
  if (!res.ok) throw new Error(`TMDB_${res.status}`);
  return res.json();
}

export interface TmdbResult {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
}

export interface TmdbFilmData {
  title: string;
  tagline: string | null;
  description: string;
  posterUrl: string | null;
  trailerUrl: string | null;
  year: number | null;
  runtime: number | null;
  director: string | null;
  genres: string[];
  tmdbRating: number | null;
}

const yearOf = (date?: string) =>
  date && date.length >= 4 ? Number(date.slice(0, 4)) : null;

export async function searchMovies(query: string): Promise<TmdbResult[]> {
  if (!query.trim()) return [];
  const data = (await tmdbFetch("/search/movie", {
    query,
    include_adult: "false",
  })) as { results?: Array<Record<string, unknown>> };

  return (data.results ?? []).slice(0, 12).map((m) => ({
    tmdbId: m.id as number,
    title: m.title as string,
    year: yearOf(m.release_date as string),
    posterUrl: m.poster_path ? `${IMG}/w342${m.poster_path}` : null,
  }));
}

export async function getFilmData(tmdbId: number): Promise<TmdbFilmData> {
  const m = (await tmdbFetch(
    `/movie/${tmdbId}`,
    { append_to_response: "credits,videos" },
    true
  )) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  const director: string | null =
    m.credits?.crew?.find((c: { job: string }) => c.job === "Director")?.name ??
    null;

  const videos: Array<{ site: string; type: string; key: string }> =
    m.videos?.results ?? [];
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube");

  return {
    title: m.title,
    tagline: m.tagline || null,
    description: m.overview || "",
    posterUrl: m.poster_path ? `${IMG}/w500${m.poster_path}` : null,
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    year: yearOf(m.release_date),
    runtime: m.runtime || null,
    director,
    genres: (m.genres ?? []).map((g: { name: string }) => g.name),
    tmdbRating: m.vote_average
      ? Math.round(m.vote_average * 10) / 10
      : null,
  };
}
