import Link from "next/link";
import { ArrowRight, CalendarClock, Clapperboard, Sparkles, TrendingUp } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { Poster } from "@/components/film/Poster";
import { ButtonLink } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Card, Eyebrow } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { InviteCode } from "@/components/community/InviteCode";
import {
  getActiveCommunity,
  getCurrentMoovie,
  getCurrentUserId,
  getFilms,
  getMembers,
  getMyRole,
} from "@/lib/data";
import { setMooviePhaseAction } from "@/app/(app)/moovies/actions";
import { cn } from "@/lib/utils/cn";
import { formatMeeting, formatDay } from "@/lib/utils/format";

const PHASE_STEPS = [
  { key: "voting", label: "Vote" },
  { key: "watching", label: "Visionnage" },
  { key: "meeting", label: "Réunion" },
  { key: "archived", label: "Archive" },
] as const;

const NEXT_PHASE: Record<string, { status: string; label: string }> = {
  voting: { status: "watching", label: "Clôturer le vote" },
  watching: { status: "meeting", label: "Lancer la réunion" },
  meeting: { status: "archived", label: "Archiver le cycle" },
};

export default async function AccueilPage() {
  const community = await getActiveCommunity();
  const moovie = await getCurrentMoovie(community.id);
  const userId = await getCurrentUserId();

  if (!moovie) {
    const role = await getMyRole(community.id, userId);
    return (
      <div className="mt-6 animate-fade-up">
        <EmptyState
          icon={Sparkles}
          title="Le club est prêt."
          description={
            role === "admin"
              ? "Lancez le premier Moovie : une thématique, une sélection de films, un vote."
              : "Aucun cycle en cours. En attente du lancement par un administrateur."
          }
          action={
            role === "admin" ? (
              <ButtonLink href="/moovies/nouveau" size="lg">
                Lancer le premier Moovie
              </ButtonLink>
            ) : undefined
          }
        />
        <div className="mt-2">
          <InviteCode code={community.inviteCode} />
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
        ? "La réunion commence dans"
        : "Projection en cours · clôture dans";

  return (
    <div className="space-y-7">
      {/* En-tête thématique */}
      <section className="animate-fade-up pt-2">
        <Eyebrow tone="accent">
          Moovie #{moovie.number} · {members.length} membre
          {members.length > 1 ? "s" : ""}
        </Eyebrow>
        <h1 className="mt-2.5 font-display text-[2.3rem] text-ink text-balance">
          {moovie.theme}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
          {moovie.description}
        </p>
      </section>

      {/* Hero — film en tête */}
      {leader ? (
        <Link
          href={`/films/${leader.id}`}
          className="group relative block animate-fade-up overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-[var(--shadow-lg)] active:scale-[0.99] transition-transform duration-[250ms]"
          style={{ animationDelay: "60ms" }}
        >
          <Poster
            title={leader.title}
            year={leader.year}
            posterUrl={leader.posterUrl}
            priority
            className="aspect-[3/4] rounded-none border-0 shadow-none"
            sizes="(max-width: 480px) 100vw, 480px"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5 pt-20">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-accent-ink">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
              En tête du classement
            </span>
            <h2 className="mt-3 font-heading text-[26px] text-ink">
              {leader.title}
            </h2>
            {leader.tagline ? (
              <p className="mt-1 text-sm italic text-ink-muted">
                {leader.tagline}
              </p>
            ) : null}
            <p className="mt-3 text-xs font-medium text-ink-faint">
              {leader.voteCount} vote{leader.voteCount > 1 ? "s" : ""} ·{" "}
              {totalVotes} au total
            </p>
          </div>
        </Link>
      ) : null}

      {/* CTA films */}
      <ButtonLink
        href="/films"
        variant="secondary"
        size="lg"
        className="animate-fade-up"
      >
        <Clapperboard className="h-[18px] w-[18px]" strokeWidth={2} />
        Découvrir la sélection
        <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} />
      </ButtonLink>

      {/* Compte à rebours */}
      <Card className="animate-fade-up">
        <Eyebrow>{phaseLabel}</Eyebrow>
        <div className="mt-4">
          <Countdown
            target={
              moovie.status === "voting" ? moovie.voteDeadline : moovie.endDate
            }
          />
        </div>
      </Card>

      {/* Réunion + progression */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue/15 text-blue">
            <CalendarClock className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <Eyebrow className="mt-3 block">Prochaine réunion</Eyebrow>
          {moovie.meetingDate ? (
            <p className="mt-2 font-subheading text-[15px] leading-snug text-ink">
              {formatMeeting(moovie.meetingDate)}
            </p>
          ) : (
            <Link
              href="/reunion"
              className="mt-2 block text-sm font-medium leading-snug text-accent underline-offset-4 hover:underline"
            >
              À fixer — votez un créneau →
            </Link>
          )}
        </Card>

        <Card>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green/15 text-green">
            <TrendingUp className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <Eyebrow className="mt-3 block">Progression</Eyebrow>
          <p className="mt-2 font-display text-3xl text-ink">{progress}%</p>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] font-medium text-ink-faint">
            {formatDay(moovie.startDate)} → {formatDay(moovie.endDate)}
          </p>
        </Card>
      </div>

      {/* Membres */}
      <Link
        href="/profil/membres"
        className="flex items-center justify-between rounded-[var(--radius-card)] border border-border bg-card p-4 transition-colors hover:border-border-strong active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {members.slice(0, 5).map((m) => (
              <Avatar
                key={m.profile.id}
                pseudo={m.profile.pseudo}
                photoUrl={m.profile.photoUrl}
                size="sm"
                className="ring-2 ring-card"
              />
            ))}
          </div>
          <span className="text-sm font-medium text-ink-muted">
            {members.length} au club
          </span>
        </div>
        <ArrowRight className="h-[18px] w-[18px] text-ink-faint" strokeWidth={2} />
      </Link>

      {role === "admin" ? (
        <section className="rounded-[var(--radius-card)] border border-border bg-card p-5">
          <Eyebrow tone="accent">Cycle · admin</Eyebrow>
          <div className="mt-3 flex items-center gap-1.5">
            {PHASE_STEPS.map((step, i) => {
              const stepIndex = PHASE_STEPS.findIndex(
                (s) => s.key === moovie.status
              );
              const active = step.key === moovie.status;
              const done = i < stepIndex;
              return (
                <span
                  key={step.key}
                  className={cn(
                    "flex-1 rounded-pill py-1.5 text-center text-[11px] font-bold",
                    active
                      ? "bg-accent text-accent-ink"
                      : done
                        ? "bg-accent/15 text-accent"
                        : "bg-elevated text-ink-faint"
                  )}
                >
                  {step.label}
                </span>
              );
            })}
          </div>
          {NEXT_PHASE[moovie.status] ? (
            <form action={setMooviePhaseAction} className="mt-4">
              <input type="hidden" name="moovieId" value={moovie.id} />
              <input
                type="hidden"
                name="status"
                value={NEXT_PHASE[moovie.status].status}
              />
              <SubmitButton variant="secondary" size="md" className="w-full">
                {NEXT_PHASE[moovie.status].label}
                <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} />
              </SubmitButton>
            </form>
          ) : null}
          {moovie.status === "voting" ? (
            <p className="mt-2.5 text-[11px] leading-relaxed text-ink-faint">
              Clôturer le vote fige les 2 films en tête comme sélection du cycle.
            </p>
          ) : null}
        </section>
      ) : null}

      {role === "admin" ? (
        <Link
          href="/moovies/nouveau"
          className="flex items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-border-strong p-4 text-center text-sm font-semibold text-ink-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          Lancer un nouveau Moovie
        </Link>
      ) : null}
    </div>
  );
}
