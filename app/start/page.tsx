import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Eyebrow } from "@/components/ui/Card";
import { createCommunityAction } from "./actions";
import { joinAction } from "@/app/join/actions";

export default function StartPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-center px-7 py-10">
      <div className="animate-fade-up">
        <Eyebrow>Première étape</Eyebrow>
        <h1 className="mt-3 font-display text-3xl tracking-tight">
          Fondez votre cercle
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Créez votre club de cinéma — vous en serez l'administrateur — ou
          rejoignez-en un avec un code d'invitation.
        </p>
      </div>

      {/* Créer */}
      <form
        action={createCommunityAction}
        className="mt-8 rounded-[var(--radius-card)] border border-border bg-card p-5"
      >
        <Eyebrow>Créer une communauté</Eyebrow>
        <div className="mt-3 space-y-4">
          <Field label="Nom du club">
            <Input name="name" placeholder="Le Cercle" required />
          </Field>
          <Button type="submit" size="lg">
            Créer et devenir admin
          </Button>
        </div>
      </form>

      {/* Rejoindre */}
      <form
        action={joinAction}
        className="mt-4 rounded-[var(--radius-card)] border border-dashed border-border p-5"
      >
        <Eyebrow>Rejoindre avec un code</Eyebrow>
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
          <Button type="submit" variant="outline" size="md">
            Rejoindre
          </Button>
        </div>
      </form>
    </div>
  );
}
