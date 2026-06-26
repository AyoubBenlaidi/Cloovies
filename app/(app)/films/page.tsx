import Link from "next/link";
import { Clapperboard, Plus } from "lucide-react";
import { VoteGrid } from "@/components/vote/VoteGrid";
import { Eyebrow } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import {
  getActiveCommunity,
  getCurrentMoovie,
  getCurrentUserId,
  getFilms,
  getMyRole,
} from "@/lib/data";

export default async function FilmsPage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  if (!moovie) {
    return (
      <EmptyState
        icon={Clapperboard}
        title="Aucun cycle en cours"
        description="La sélection apparaîtra ici dès qu'un Moovie sera lancé."
      />
    );
  }

  const userId = await getCurrentUserId();
  const [films, role] = await Promise.all([
    getFilms(moovie.id, userId),
    getMyRole(community.id, userId),
  ]);
  const votingOpen = moovie.status === "voting";
  const isAdmin = role === "admin";

  return (
    <div>
      <section className="mb-6 animate-fade-up pt-2">
        <Eyebrow tone="accent">La sélection · Moovie #{moovie.number}</Eyebrow>
        <h1 className="mt-2 font-display text-[2rem] text-ink text-balance">
          {votingOpen ? "À vous de choisir" : "La sélection retenue"}
        </h1>
      </section>

      {films.length === 0 ? (
        <EmptyState
          icon={Clapperboard}
          title="La sélection est vide"
          description={
            isAdmin
              ? "Ajoutez les films candidats pour ouvrir le vote au club."
              : "Les films candidats arrivent. Revenez bientôt pour voter."
          }
          action={
            isAdmin ? (
              <ButtonLink href="/films/nouveau" size="lg">
                <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
                Ajouter un film
              </ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <VoteGrid
          films={films}
          moovieId={moovie.id}
          maxVotes={moovie.maxVotes}
          votingOpen={votingOpen}
        />
      )}

      {isAdmin && votingOpen && films.length > 0 ? (
        <Link
          href="/films/nouveau"
          className="mt-6 flex items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-border-strong py-4 text-sm font-semibold text-ink-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Ajouter un film candidat
        </Link>
      ) : null}
    </div>
  );
}
