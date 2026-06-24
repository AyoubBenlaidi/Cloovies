import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { signInAction } from "@/app/(auth)/actions";

export default function LoginPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-3xl tracking-tight">Bon retour.</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Le club a continué de tourner sans vous. Reprenez votre place.
      </p>

      <form action={signInAction} className="mt-8 space-y-4">
        <Field label="Email">
          <Input type="email" name="email" placeholder="vous@exemple.com" required />
        </Field>
        <Field label="Mot de passe">
          <Input type="password" name="password" placeholder="••••••••" required />
        </Field>
        <Button type="submit" size="lg" className="mt-2">
          Se connecter
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-faint">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-gold underline-offset-4 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
