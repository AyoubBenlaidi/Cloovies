import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Poster } from "@/components/film/Poster";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Eyebrow } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import {
  getActiveCommunity,
  getCurrentMoovie,
  getCurrentUserId,
  getFilms,
  getMembers,
  getMyRole,
} from "@/lib/data";
import { formatMeeting, formatDay } from "@/lib/utils/format";

export default async function AccueilPage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  const userId = await getCurrentUserId();

  if (!moovie) {
    const role = await getMyRole(community.id, userId);
    return (
      <div className="mt-20 flex flex-col items-center text-center animate-fade-up">
        <Eyebrow>{community.name}</Eyebrow>
        <h1 className="mt-3 font-display text-[2rem] leading-tight tracking-tight">
          Le club est prêt.
        </h1>
        <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-ink-muted">
          {role === "admin"
            ? "Lancez le premier Moovie : une thématique, une sélection de films, un vote."
            : "Aucun cycle en cours. En attente du lancement par un administrateur."}
        </p>

        {role === "admin" ? (
          <div className="mt-7 w-full max-w-[16rem]">
            <ButtonLink href="/moovies/nouveau" size="lg">
              Lancer le premier Moovie
            </ButtonLink>
          </div>
        ) : null}

        <div className="mt-8 rounded-[var(--radius-card)] border border-border bg-card px-6 py-4">
          <Eyebrow>Inviter au club</Eyebrow>
          <p className="mt-1 font-display text-xl tracking-[0.15em] text-gold">
            {community.inviteCode}
          </p>
        </div>
      </div>
    );
  }

  const [films, members, role] = await Promise.all([
    getFilms(moovie.id, userId),
    getMembers(community.id),
    getMyRole(community.id, userId),
  ]);
  const leader = films[0];
  const totalVotes = films.reduce((s, f) => s + f.voteCount, 0);

  // Progression du cycle (0 → 100%).
  const start = new Date(moovie.startDate).getTime();
  const end = new Date(moovie.endDate).getTime();
  const progress = Math.min(
    100,
    Math.max(0, Math.round(((Date.now() - start) / (end - start)) * 100))
  );

  const phaseLabel =
    moovie.status === "voting"
      ? "Le vote ferme dans"
      : moovie.status === "meeting"
        ? "La réunion commence"
        : "Projection en cours";

  return (
    <div className="space-y-8">
      {/* En-tête thématique */}
      <section className="animate-fade-up">
        <Eyebrow>
          Moovie #{moovie.number} · {members.length} membres
        </Eyebrow>
        <h1 className="mt-2 font-display text-[2rem] leading-tight tracking-tight">
          {moovie.theme}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {moovie.description}
        </p>
      </section>

      {/* Hero — film en tête */}
      {leader ? (
        <Link
          href={`/films/${leader.id}`}
          className="group relative block animate-fade-up overflow-hidden rounded-[var(--radius-lg)] border border-border"
          style={{ animationDelay: "60ms" }}
        >
          <Poster
            title={leader.title}
            year={leader.year}
            posterUrl={leader.posterUrl}
            priority
            className="aspect-[3/4] rounded-none border-0"
            sizes="(max-width: 480px) 100vw, 480px"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-5 pt-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gold">
              En tête du classement
            </span>
            <h2 className="mt-3 font-display text-2xl tracking-tight">
              {leader.title}
            </h2>
            {leader.tagline ? (
              <p className="mt-1 text-sm italic text-ink-muted">
                {leader.tagline}
              </p>
            ) : null}
            <p className="mt-3 text-xs text-ink-faint">
              {leader.voteCount} vote{leader.voteCount > 1 ? "s" : ""} ·{" "}
              {totalVotes} au total
            </p>
          </div>
        </Link>
      ) : null}

      {/* Compte à rebours */}
      <Card className="animate-fade-up">
        <Eyebrow>{phaseLabel}</Eyebrow>
        <div className="mt-4">
          <Countdown
            target={moovie.status === "voting" ? moovie.voteDeadline : moovie.endDate}
          />
        </div>
      </Card>

      {/* Réunion + progression */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <Eyebrow>Prochaine réunion</Eyebrow>
          {moovie.meetingDate ? (
            <p className="mt-3 font-display text-base leading-snug text-ink">
              {formatMeeting(moovie.meetingDate)}
            </p>
          ) : (
            <Link
              href="/reunion"
              className="mt-3 block text-sm leading-snug text-gold underline-offset-4 hover:underline"
            >
              À fixer — votez pour un créneau →
            </Link>
          )}
        </Card>

        <Card>
          <Eyebrow>Progression</Eyebrow>
          <p className="mt-3 font-display text-2xl text-ink">{progress}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-ink-faint">
            {formatDay(moovie.startDate)} → {formatDay(moovie.endDate)}
          </p>
        </Card>
      </div>

      {/* Membres */}
      <Link href="/profil/membres" className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {members.slice(0, 6).map((m) => (
            <Avatar
              key={m.profile.id}
              pseudo={m.profile.pseudo}
              photoUrl={m.profile.photoUrl}
              size="sm"
              className="ring-2 ring-bg"
            />
          ))}
        </div>
        <span className="text-sm text-ink-muted">Voir les membres →</span>
      </Link>

      {role === "admin" ? (
        <Link
          href="/moovies/nouveau"
          className="block rounded-[var(--radius-card)] border border-dashed border-border p-4 text-center text-sm text-ink-muted transition-colors hover:border-gold/40 hover:text-gold"
        >
          Lancer un nouveau Moovie
        </Link>
      ) : null}
    </div>
  );
}
