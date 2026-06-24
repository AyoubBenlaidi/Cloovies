import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Eyebrow } from "@/components/ui/Card";
import { BackIcon } from "@/components/nav/icons";
import { addFilmAction } from "@/app/(app)/films/actions";
import { getActiveCommunity, getCurrentMoovie } from "@/lib/data";

export default async function NouveauFilmPage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  if (!moovie) return null;

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
          Une fois soumis, il rejoindra la liste de vote du Moovie #{moovie.number}.
        </p>
      </header>

      <form action={addFilmAction} className="space-y-4">
        <input type="hidden" name="moovieId" value={moovie.id} />
        <Field label="Titre">
          <Input name="title" placeholder="Le titre du film" required />
        </Field>
        <Field label="Description">
          <Textarea name="description" placeholder="De quoi ça parle ?" required />
        </Field>
        <Field label="Affiche (URL)" hint="Optionnel — sinon une affiche est générée.">
          <Input name="posterUrl" placeholder="https://…" />
        </Field>
        <Field label="Bande-annonce (URL)">
          <Input name="trailerUrl" placeholder="https://youtube.com/…" />
        </Field>
        <p className="text-xs text-ink-faint">
          V2 — l'import automatique via TMDB remplira ces champs pour vous.
        </p>
        <Button type="submit" size="lg">
          Ajouter au vote
        </Button>
      </form>
    </div>
  );
}
