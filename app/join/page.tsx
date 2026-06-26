import Link from "next/link";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field, Input } from "@/components/ui/Field";
import { Eyebrow } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";

import { joinAction } from "./actions";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-7 py-10">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo size={32} />
        <span className="text-overline text-ink-faint">Club Cinoche</span>
      </Link>

      <div className="flex flex-1 flex-col justify-center animate-fade-up">
        <Eyebrow tone="accent">Une invitation</Eyebrow>
        <h1 className="mt-3 font-display text-[2.2rem] text-ink">
          Rejoindre un club
        </h1>
        <p className="mt-2.5 text-[15px] text-ink-muted">
          Entrez le code partagé par un membre. Les portes du club s'ouvrent.
        </p>

        <form action={joinAction} className="mt-8 space-y-4">
          <Field
            label="Code d'invitation"
            hint="Essayez « CINE-7421 » pour la démo."
          >
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
            <p className="text-sm text-red">
              Code invalide. Vérifiez et réessayez.
            </p>
          ) : null}
          <SubmitButton size="lg" pendingText="Ouverture…">
            Rejoindre
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
