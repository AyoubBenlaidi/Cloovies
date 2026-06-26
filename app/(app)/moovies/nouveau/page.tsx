import Link from "next/link";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Eyebrow } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Field";
import {
  getActiveCommunity,
  getCurrentUserId,
  getMyRole,
} from "@/lib/data";
import { createMoovieAction } from "../actions";

export default async function NouveauMooviePage() {
  const community = await getActiveCommunity();
  const role = await getMyRole(community.id, await getCurrentUserId());
  if (role !== "admin") {
    return (
      <EmptyState
        icon={ShieldAlert}
        color="red"
        title="Réservé aux administrateurs"
        description="Seuls les administrateurs du club peuvent lancer un nouveau Moovie."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/accueil"
        className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-elevated py-1.5 pl-2 pr-3.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ink active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} /> Accueil
      </Link>

      <header className="animate-fade-up">
        <Eyebrow tone="accent">Nouveau cycle</Eyebrow>
        <h1 className="mt-2 font-display text-[2rem] text-ink">
          Lancer un Moovie
        </h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          Une thématique, une période, et le vote s'ouvre.
        </p>
      </header>

      <form action={createMoovieAction} className="space-y-4">
        <Field label="Nom">
          <Input name="name" placeholder="Voyage dans le temps" required />
        </Field>
        <Field label="Thématique">
          <Input
            name="theme"
            placeholder="Films de voyage dans le temps"
            required
          />
        </Field>
        <Field label="Description">
          <Textarea
            name="description"
            placeholder="Quelques mots pour donner le ton…"
          />
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
        <SubmitButton size="lg" pendingText="Lancement…">
          Lancer le cycle
        </SubmitButton>
      </form>
    </div>
  );
}
