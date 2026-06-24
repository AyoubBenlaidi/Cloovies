import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { signUpAction } from "@/app/(auth)/actions";

export default function SignupPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-3xl tracking-tight">
        Rejoignez le cercle.
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Quelques mots sur vous, et la séance peut commencer.
      </p>

      <form action={signUpAction} className="mt-8 space-y-4">
        <Field label="Pseudo">
          <Input name="pseudo" placeholder="Votre nom de cinéphile" required />
        </Field>
        <Field label="Email">
          <Input type="email" name="email" placeholder="vous@exemple.com" required />
        </Field>
        <Field label="Mot de passe">
          <Input type="password" name="password" placeholder="••••••••" required />
        </Field>
        <Button type="submit" size="lg" className="mt-2">
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-faint">
        Déjà membre ?{" "}
        <Link href="/login" className="text-gold underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
