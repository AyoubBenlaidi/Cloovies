import Link from "next/link";
import { ChevronDown, ChevronLeft, Sparkles } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Eyebrow } from "@/components/ui/Card";
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
        className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-elevated py-1.5 pl-2 pr-3.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ink active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} /> Films
      </Link>

      <header className="animate-fade-up">
        <Eyebrow tone="accent">Réservé aux administrateurs</Eyebrow>
        <h1 className="mt-2 font-display text-[2rem] text-ink text-balance">
          Ajouter un film candidat
        </h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          Il rejoindra la liste de vote du Moovie #{moovie.number}.
        </p>
      </header>

      {/* Import automatique TMDB */}
      {tmdbEnabled ? (
        <section>
          <Eyebrow className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            Import automatique · TMDB
          </Eyebrow>
          <p className="mb-3 mt-1.5 text-sm text-ink-muted">
            Recherchez un film : affiche, synopsis, année, durée, réalisateur,
            genres et note sont récupérés automatiquement.
          </p>
          <TmdbImport moovieId={moovie.id} />
        </section>
      ) : (
        <p className="rounded-[var(--radius-card)] border border-dashed border-border-strong p-4 text-sm text-ink-muted">
          💡 Définissez <code className="text-accent">TMDB_API_KEY</code> pour
          activer l'import automatique. En attendant, l'ajout manuel reste
          disponible.
        </p>
      )}

      {/* Ajout manuel */}
      <details
        className="group rounded-[var(--radius-card)] border border-border bg-card"
        open={!tmdbEnabled}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm transition-colors hover:text-ink">
          <span>
            <span className="font-semibold text-ink">Ajout manuel</span>
            <span className="ml-2 text-ink-faint">(basique)</span>
          </span>
          <ChevronDown
            className="h-4 w-4 text-ink-faint transition-transform group-open:rotate-180"
            strokeWidth={2}
          />
        </summary>
        <form action={addFilmAction} className="space-y-4 px-5 pb-5">
          <input type="hidden" name="moovieId" value={moovie.id} />
          <Field label="Titre">
            <Input name="title" placeholder="Le titre du film" required />
          </Field>
          <Field label="Description">
            <Textarea name="description" placeholder="De quoi ça parle ?" />
          </Field>
          <Field
            label="Affiche (URL)"
            hint="Optionnel — sinon une affiche est générée."
          >
            <Input name="posterUrl" placeholder="https://…" />
          </Field>
          <Field label="Bande-annonce (URL)">
            <Input name="trailerUrl" placeholder="https://youtube.com/…" />
          </Field>
          <SubmitButton variant="secondary" size="md" pendingText="Ajout…">
            Ajouter manuellement
          </SubmitButton>
        </form>
      </details>
    </div>
  );
}
