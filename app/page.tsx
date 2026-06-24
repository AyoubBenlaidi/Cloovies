import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function Landing() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col justify-between overflow-hidden px-7 pb-12 pt-20">
      {/* Halo cinéma */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60%]"
        style={{
          backgroundImage:
            "radial-gradient(80% 60% at 50% 0%, rgba(200,155,60,0.12), transparent 70%)",
        }}
      />

      <div className="relative animate-fade-up">
        <span className="text-[11px] uppercase tracking-[0.32em] text-ink-faint">
          Cloovies
        </span>
        <h1 className="mt-6 font-display text-[2.9rem] leading-[1.05] tracking-tight">
          Le cinéma
          <br />
          comme un <span className="italic text-gold">rituel</span>.
        </h1>
        <p className="mt-6 max-w-[20rem] text-[15px] leading-relaxed text-ink-muted">
          Un club privé pour choisir un film, le regarder seul, garder ses
          émotions secrètes — puis tout révéler le soir de la réunion.
        </p>
      </div>

      <div className="relative mt-12 space-y-3">
        <ButtonLink href="/accueil" size="lg">
          Entrer dans le club
        </ButtonLink>
        <div className="flex gap-3">
          <ButtonLink href="/signup" variant="outline" size="md" className="flex-1">
            Créer un compte
          </ButtonLink>
          <ButtonLink href="/join" variant="outline" size="md" className="flex-1">
            Rejoindre via un code
          </ButtonLink>
        </div>
        <p className="pt-2 text-center text-sm text-ink-faint">
          Déjà membre ?{" "}
          <Link href="/login" className="text-ink-muted underline-offset-4 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
