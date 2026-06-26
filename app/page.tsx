import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function Landing() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-between overflow-hidden px-7 pb-12 pt-16">
      {/* Halo cinéma */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%]"
        style={{
          backgroundImage:
            "radial-gradient(80% 60% at 50% 0%, rgba(254,241,2,0.14), transparent 70%)",
        }}
      />

      <div className="relative animate-fade-up">
        <Logo size={72} radius="lg" glow priority />
        <span className="mt-7 block text-overline text-ink-faint">
          Club Cinoche
        </span>
        <h1 className="mt-4 font-display text-[3rem] leading-[0.92] text-ink">
          Le cinéma
          <br />
          comme un <span className="text-accent">rituel</span>.
        </h1>
        <p className="mt-6 max-w-[20rem] text-[15px] leading-relaxed text-ink-muted">
          Un club privé pour choisir un film, le regarder seul, garder ses
          émotions secrètes — puis tout révéler le soir de la réunion.
        </p>
      </div>

      <div className="relative mt-12 space-y-3">
        <ButtonLink href="/accueil" size="lg">
          Entrer dans le club
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
        </ButtonLink>
        <div className="flex gap-3">
          <ButtonLink
            href="/signup"
            variant="secondary"
            size="md"
            className="flex-1"
          >
            Créer un compte
          </ButtonLink>
          <ButtonLink
            href="/join"
            variant="outline"
            size="md"
            className="flex-1"
          >
            Rejoindre via un code
          </ButtonLink>
        </div>
        <p className="pt-2 text-center text-sm text-ink-faint">
          Déjà membre ?{" "}
          <Link
            href="/login"
            className="font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
