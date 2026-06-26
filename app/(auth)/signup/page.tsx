import Link from "next/link";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, Input } from "@/components/ui/Field";
import { signUpAction } from "@/app/(auth)/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-[2.4rem] leading-[0.95] text-ink text-balance">
        Rejoignez le cercle.
      </h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Quelques mots sur vous, et la séance peut commencer.
      </p>

      {error ? (
        <p className="mt-5 rounded-[var(--radius-sm)] border border-red/30 bg-red/5 px-4 py-3 text-sm text-red">
          {error}
        </p>
      ) : null}

      <form action={signUpAction} className="mt-8 space-y-4">
        <Field label="Pseudo">
          <Input name="pseudo" placeholder="Votre nom de cinéphile" required />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            name="email"
            placeholder="vous@exemple.com"
            required
          />
        </Field>
        <Field label="Mot de passe">
          <Input
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </Field>
        <SubmitButton size="lg" className="mt-2" pendingText="Création…">
          Créer mon compte
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-faint">
        Déjà membre ?{" "}
        <Link
          href="/login"
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
