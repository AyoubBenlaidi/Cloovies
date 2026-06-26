import { Sparkles, Ticket } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, Input } from "@/components/ui/Field";
import { Eyebrow } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { createCommunityAction } from "./actions";
import { joinAction } from "@/app/join/actions";

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center px-7 py-10">
      <div className="animate-fade-up">
        <Logo size={44} glow />
        <Eyebrow tone="accent" className="mt-6 block">
          Première étape
        </Eyebrow>
        <h1 className="mt-3 font-display text-[2.2rem] text-ink">
          Fondez votre cercle
        </h1>
        <p className="mt-2.5 text-[15px] text-ink-muted">
          Créez votre club de cinéma — vous en serez l'administrateur — ou
          rejoignez-en un avec un code d'invitation.
        </p>
      </div>

      {error ? (
        <p className="mt-5 rounded-[var(--radius-sm)] border border-red/30 bg-red/5 px-4 py-3 text-sm text-red">
          {error}
        </p>
      ) : null}

      {/* Créer */}
      <form
        action={createCommunityAction}
        className="mt-8 rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-[var(--shadow-sm)]"
      >
        <Eyebrow className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
          Créer un club
        </Eyebrow>
        <div className="mt-3 space-y-4">
          <Field label="Nom du club">
            <Input name="name" placeholder="Le Cercle" required />
          </Field>
          <SubmitButton size="lg" pendingText="Création…">
            Créer et devenir admin
          </SubmitButton>
        </div>
      </form>

      {/* Rejoindre */}
      <form
        action={joinAction}
        className="mt-4 rounded-[var(--radius-card)] border border-dashed border-border-strong p-5"
      >
        <Eyebrow className="flex items-center gap-1.5">
          <Ticket className="h-3.5 w-3.5" strokeWidth={2.5} />
          Rejoindre avec un code
        </Eyebrow>
        <div className="mt-3 space-y-4">
          <Field label="Code d'invitation">
            <Input
              name="code"
              placeholder="CINE-0000"
              autoCapitalize="characters"
              className="text-center uppercase tracking-[0.2em]"
              required
            />
          </Field>
          <SubmitButton variant="secondary" size="md" pendingText="…">
            Rejoindre
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
