import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { BackIcon } from "@/components/nav/icons";
import {
  CURRENT_USER_ID,
  getActiveCommunity,
  getMyRole,
} from "@/lib/data";
import { createMoovieAction } from "../actions";

export default async function NouveauMooviePage() {
  const community = await getActiveCommunity();
  const role = await getMyRole(community.id, CURRENT_USER_ID);
  if (role !== "admin") {
    return (
      <div className="mt-24 text-center text-ink-muted">
        Seuls les administrateurs peuvent lancer un Moovie.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/accueil" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <BackIcon className="h-5 w-5" /> Accueil
      </Link>

      <header className="animate-fade-up">
        <Eyebrow>Nouveau cycle</Eyebrow>
        <h1 className="mt-2 font-display text-[1.9rem] leading-tight tracking-tight">
          Lancer un Moovie
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Une thématique, une période, et le vote s'ouvre.
        </p>
      </header>

      <form action={createMoovieAction} className="space-y-4">
        <Field label="Nom">
          <Input name="name" placeholder="Voyage dans le temps" required />
        </Field>
        <Field label="Thématique">
          <Input name="theme" placeholder="Films de voyage dans le temps" required />
        </Field>
        <Field label="Description">
          <Textarea name="description" placeholder="Quelques mots pour donner le ton…" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Début">
            <Input type="date" name="startDate" required />
          </Field>
          <Field label="Fin">
            <Input type="date" name="endDate" required />
          </Field>
        </div>
        <Field label="Clôture du vote">
          <Input type="date" name="voteDeadline" required />
        </Field>
        <Button type="submit" size="lg">
          Lancer le cycle
        </Button>
      </form>
    </div>
  );
}
