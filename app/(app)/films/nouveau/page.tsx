import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Eyebrow } from "@/components/ui/Card";
import { BackIcon } from "@/components/nav/icons";
import { TmdbImport } from "@/components/film/TmdbImport";
import { addFilmAction } from "@/app/(app)/films/actions";
import { getActiveCommunity, getCurrentMoovie } from "@/lib/data";
import { isTmdbConfigured } from "@/lib/tmdb";

export default async function NouveauFilmPage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  if (!moovie) return null;

  const tmdbEnabled = isTmdbConfigured();

  return (
    <div className="space-y-6">
      <Link
        href="/films"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <BackIcon className="h-5 w-5" /> Films
      </Link>

      <header className="animate-fade-up">
        <Eyebrow>Réservé aux administrateurs</Eyebrow>
        <h1 className="mt-2 font-display text-[1.9rem] leading-tight tracking-tight">
          Ajouter un film candidat
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Il rejoindra la liste de vote du Moovie #{moovie.number}.
        </p>
      </header>

      {/* Import automatique TMDB (US9) */}
      {tmdbEnabled ? (
        <section>
          <Eyebrow>Import automatique · TMDB</Eyebrow>
          <p className="mb-3 mt-1 text-sm text-ink-muted">
            Recherchez un film : affiche, synopsis, année, durée, réalisateur,
            genres et note sont récupérés automatiquement.
          </p>
          <TmdbImport moovieId={moovie.id} />
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-ink-muted">
          💡 Définissez <code className="text-gold">TMDB_API_KEY</code> pour
          activer l'import automatique. En attendant, l'ajout manuel reste
          disponible.
        </p>
      )}

      {/* Ajout manuel (basique) */}
      <details className="group rounded-[var(--radius-card)] border border-border bg-card" open={!tmdbEnabled}>
        <summary className="cursor-pointer list-none px-5 py-4 text-sm text-ink-muted transition-colors hover:text-ink">
          <span className="font-medium">Ajout manuel</span>
          <span className="ml-2 text-ink-faint">(basique)</span>
          <span className="float-right text-ink-faint transition-transform group-open:rotate-180">
            ⌄
          </span>
        </summary>
        <form action={addFilmAction} className="space-y-4 px-5 pb-5">
          <input type="hidden" name="moovieId" value={moovie.id} />
          <Field label="Titre">
            <Input name="title" placeholder="Le titre du film" required />
          </Field>
          <Field label="Description">
            <Textarea name="description" placeholder="De quoi ça parle ?" />
          </Field>
          <Field label="Affiche (URL)" hint="Optionnel — sinon une affiche est générée.">
            <Input name="posterUrl" placeholder="https://…" />
          </Field>
          <Field label="Bande-annonce (URL)">
            <Input name="trailerUrl" placeholder="https://youtube.com/…" />
          </Field>
          <Button type="submit" variant="outline" size="md">
            Ajouter manuellement
          </Button>
        </form>
      </details>
    </div>
  );
}
