import Link from "next/link";
import { VoteGrid } from "@/components/vote/VoteGrid";
import { Eyebrow } from "@/components/ui/Card";
import { PlusIcon } from "@/components/nav/icons";
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
    return <div className="mt-24 text-center text-ink-muted">Aucun cycle en cours.</div>;
  }

  const userId = await getCurrentUserId();
  const [films, role] = await Promise.all([
    getFilms(moovie.id, userId),
    getMyRole(community.id, userId),
  ]);
  const votingOpen = moovie.status === "voting";

  return (
    <div>
      <section className="mb-6 animate-fade-up">
        <Eyebrow>La sélection · Moovie #{moovie.number}</Eyebrow>
        <h1 className="mt-2 font-display text-[1.9rem] leading-tight tracking-tight">
          {votingOpen ? "À vous de choisir" : "La sélection retenue"}
        </h1>
      </section>

      <VoteGrid
        films={films}
        moovieId={moovie.id}
        maxVotes={moovie.maxVotes}
        votingOpen={votingOpen}
      />

      {role === "admin" && votingOpen ? (
        <Link
          href="/films/nouveau"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter un film candidat
        </Link>
      ) : null}
    </div>
  );
}
