import Link from "next/link";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, Input } from "@/components/ui/Field";
import { signInAction } from "@/app/(auth)/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check_email?: string }>;
}) {
  const { error, check_email } = await searchParams;
  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-[2.4rem] text-ink">Bon retour.</h1>
      <p className="mt-2.5 text-[15px] text-ink-muted">
        Le club a continué de tourner sans vous. Reprenez votre place.
      </p>

      {check_email ? (
        <p className="mt-5 rounded-[var(--radius-sm)] border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
          Compte créé. Vérifiez votre boîte mail pour confirmer, puis
          connectez-vous.
        </p>
      ) : null}
      {error ? (
        <p className="mt-5 rounded-[var(--radius-sm)] border border-red/30 bg-red/5 px-4 py-3 text-sm text-red">
          {error}
        </p>
      ) : null}

      <form action={signInAction} className="mt-8 space-y-4">
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
        <SubmitButton size="lg" className="mt-2" pendingText="Connexion…">
          Se connecter
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-faint">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
