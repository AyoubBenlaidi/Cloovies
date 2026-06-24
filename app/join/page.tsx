import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { joinAction } from "./actions";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-7 py-10">
      <Link href="/" className="text-[11px] uppercase tracking-[0.32em] text-ink-faint">
        Cloovies
      </Link>

      <div className="flex flex-1 flex-col justify-center animate-fade-up">
        <span className="text-[11px] uppercase tracking-[0.22em] text-ink-faint">
          Une invitation
        </span>
        <h1 className="mt-3 font-display text-3xl tracking-tight">
          Rejoindre une communauté
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Entrez le code partagé par un membre. Les portes du club s'ouvrent.
        </p>

        <form action={joinAction} className="mt-8 space-y-4">
          <Field label="Code d'invitation" hint="Essayez « CINE-7421 » pour la démo.">
            <Input
              name="code"
              defaultValue={code}
              placeholder="CINE-0000"
              autoCapitalize="characters"
              className="text-center text-lg tracking-[0.3em] uppercase"
              required
            />
          </Field>
          {error ? (
            <p className="text-sm text-emo-malaise">Code invalide. Vérifiez et réessayez.</p>
          ) : null}
          <Button type="submit" size="lg">
            Rejoindre
          </Button>
        </form>
      </div>
    </div>
  );
}
