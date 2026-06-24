import { ReflexionsClient } from "@/components/reflexion/ReflexionsClient";
import {
  CURRENT_USER_ID,
  getActiveCommunity,
  getCurrentMoovie,
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

  const [films, entries, myEmotions, allEmotions] = await Promise.all([
    getSelectedFilms(moovie.id),
    getJournal(moovie.id, CURRENT_USER_ID),
    getMyEmotions(moovie.id, CURRENT_USER_ID),
    getRevealedEmotions(moovie.id),
  ]);

  const othersCount = new Set(
    allEmotions.filter((e) => e.userId !== CURRENT_USER_ID).map((e) => e.userId)
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
