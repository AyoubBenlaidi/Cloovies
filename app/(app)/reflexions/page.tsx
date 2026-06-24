import { ReflexionsClient } from "@/components/reflexion/ReflexionsClient";
import {
  getActiveCommunity,
  getCurrentMoovie,
  getCurrentUserId,
  getJournal,
  getMyEmotions,
  getRevealedEmotions,
  getSelectedFilms,
} from "@/lib/data";

export default async function ReflexionsPage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  if (!moovie) {
    return <div className="mt-24 text-center text-ink-muted">Aucun cycle en cours.</div>;
  }

  const userId = await getCurrentUserId();
  const [films, entries, myEmotions, allEmotions] = await Promise.all([
    getSelectedFilms(moovie.id, userId),
    getJournal(moovie.id, userId),
    getMyEmotions(moovie.id, userId),
    getRevealedEmotions(moovie.id),
  ]);

  const othersCount = new Set(
    allEmotions.filter((e) => e.userId !== userId).map((e) => e.userId)
  ).size;

  return (
    <ReflexionsClient
      moovieId={moovie.id}
      films={films.map((f) => ({ id: f.id, title: f.title }))}
      entries={entries}
      emotions={myEmotions}
      othersCount={othersCount}
    />
  );
}
