"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Poster } from "@/components/film/Poster";
import { Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import {
  addFilmFromTmdbAction,
  searchTmdbAction,
} from "@/app/(app)/films/actions";
import type { TmdbResult } from "@/lib/tmdb";

export function TmdbImport({ moovieId }: { moovieId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    const res = await searchTmdbAction(query.trim());
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Erreur");
      setResults([]);
      return;
    }
    setResults(res.results);
  }

  function add(tmdbId: number) {
    setAddingId(tmdbId);
    startTransition(() => addFilmFromTmdbAction(moovieId, tmdbId));
  }

  return (
    <div>
      <form onSubmit={runSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un film…"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-accent px-5 text-sm font-bold text-accent-ink shadow-[var(--shadow-pop)] transition-opacity disabled:opacity-40"
        >
          {loading ? (
            <Spinner className="text-accent-ink" />
          ) : (
            <Search className="h-4 w-4" strokeWidth={2.5} />
          )}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red">{error}</p> : null}

      {results && results.length === 0 && !error ? (
        <p className="mt-4 text-sm text-ink-muted">
          Aucun film trouvé pour « {query} ».
        </p>
      ) : null}

      {results && results.length > 0 ? (
        <ul className="mt-4 grid grid-cols-3 gap-3">
          {results.map((r) => {
            const isAdding = addingId === r.tmdbId;
            return (
              <li key={r.tmdbId}>
                <button
                  onClick={() => add(r.tmdbId)}
                  disabled={addingId !== null}
                  className={cn(
                    "group block w-full text-left transition-opacity active:scale-[0.97]",
                    addingId !== null && !isAdding && "opacity-40"
                  )}
                >
                  <div className="relative">
                    <Poster
                      title={r.title}
                      year={r.year}
                      posterUrl={r.posterUrl}
                      sizes="33vw"
                      className="transition-all duration-[250ms] group-hover:ring-2 group-hover:ring-accent/60"
                    />
                    {isAdding ? (
                      <span className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-[var(--radius-card)] bg-black/70 text-xs font-semibold text-accent">
                        <Spinner className="text-accent" /> Ajout…
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 truncate text-xs font-semibold text-ink-muted">
                    {r.title}
                  </p>
                  {r.year ? (
                    <p className="text-[10px] text-ink-faint">{r.year}</p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <p className="mt-4 text-[11px] text-ink-faint">
        Données et affiches fournies par TMDB. Ce produit utilise l'API TMDB
        sans être affilié à TMDB.
      </p>
    </div>
  );
}
