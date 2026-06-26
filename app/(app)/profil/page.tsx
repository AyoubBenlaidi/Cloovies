import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  Film,
  History,
  LogOut,
  Quote,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card, Eyebrow, Tag } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { InviteCode } from "@/components/community/InviteCode";
import {
  getActiveCommunity,
  getCurrentUser,
  getCurrentUserId,
  getMembers,
  getMyBadges,
  getMyRole,
  getPersonalStats,
} from "@/lib/data";
import { BADGES, BADGE_BY_KEY, RARITY_META } from "@/lib/badges/catalog";
import { updateProfileAction } from "./actions";
import { signOutAction } from "@/app/(auth)/actions";

export default async function ProfilPage() {
  const userId = await getCurrentUserId();
  const [me, community, stats, myBadges] = await Promise.all([
    getCurrentUser(),
    getActiveCommunity(),
    getPersonalStats(userId),
    getMyBadges(userId),
  ]);
  const [members, role] = await Promise.all([
    getMembers(community.id),
    getMyRole(community.id, userId),
  ]);

  const recentBadges = [...myBadges]
    .sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt))
    .slice(0, 4)
    .map((u) => BADGE_BY_KEY.get(u.key))
    .filter((b): b is NonNullable<typeof b> => !!b);

  const completion = Math.round((myBadges.length / BADGES.length) * 100);

  return (
    <div className="space-y-7">
      {/* Vitrine — en-tête */}
      <header className="flex flex-col items-center pt-3 text-center animate-fade-up">
        <Avatar pseudo={me.pseudo} photoUrl={me.photoUrl} size="xl" ring />
        <div className="mt-4 flex items-center gap-2">
          <h1 className="font-display text-[1.75rem] text-ink">{me.pseudo}</h1>
          {role === "admin" ? (
            <span className="rounded-pill bg-accent/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent">
              Admin
            </span>
          ) : null}
        </div>
        <p className="text-sm text-ink-faint">{community.name}</p>
        {me.favoriteQuote ? (
          <p className="mt-4 max-w-[20rem] text-balance font-display text-lg italic leading-snug text-ink-muted">
            « {me.favoriteQuote} »
          </p>
        ) : null}
      </header>

      {/* Statistiques */}
      <section>
        <Eyebrow tone="accent">Mon parcours</Eyebrow>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <StatCard value={stats.filmsSeen} label="films vus" />
          <StatCard
            value={stats.averageScore ?? "—"}
            label="note moyenne"
            accent
          />
          <StatCard value={`${completion}%`} label="trophées" />
        </div>
      </section>

      {/* Favoris */}
      {me.favoriteFilm || me.favoriteDirector ? (
        <section className="grid grid-cols-1 gap-3">
          {me.favoriteFilm ? (
            <Card className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink/15 text-pink">
                <Film className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <Eyebrow>Film fétiche</Eyebrow>
                <p className="mt-0.5 truncate font-subheading text-[15px] text-ink">
                  {me.favoriteFilm}
                </p>
              </div>
            </Card>
          ) : null}
          {me.favoriteDirector ? (
            <Card className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue/15 text-blue">
                <Clapperboard className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <Eyebrow>Réalisateur de cœur</Eyebrow>
                <p className="mt-0.5 truncate font-subheading text-[15px] text-ink">
                  {me.favoriteDirector}
                </p>
              </div>
            </Card>
          ) : null}
        </section>
      ) : null}

      {/* Goûts : genres + réalisateurs les plus vus */}
      {stats.topGenres.length || stats.topDirectors.length ? (
        <section className="space-y-3">
          {stats.topGenres.length ? (
            <Card>
              <Eyebrow>Genres préférés</Eyebrow>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {stats.topGenres.map((g) => (
                  <Tag key={g.genre}>
                    {g.genre} <span className="text-ink-faint">· {g.count}</span>
                  </Tag>
                ))}
              </div>
            </Card>
          ) : null}
          {stats.topDirectors.length ? (
            <Card>
              <Eyebrow>Réalisateurs les plus regardés</Eyebrow>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {stats.topDirectors.map((d) => (
                  <Tag key={d.director}>{d.director}</Tag>
                ))}
              </div>
            </Card>
          ) : null}
        </section>
      ) : null}

      {/* Trophées */}
      <section>
        <div className="flex items-baseline justify-between">
          <Eyebrow>Trophées</Eyebrow>
          <Link
            href="/profil/badges"
            className="text-xs font-semibold text-accent hover:underline"
          >
            Tout voir
          </Link>
        </div>
        <Link
          href="/profil/badges"
          className="mt-3 block rounded-[var(--radius-card)] border border-border bg-card p-4 transition-colors hover:border-border-strong active:scale-[0.99]"
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl text-ink">
              {myBadges.length}
              <span className="text-base text-ink-faint"> / {BADGES.length}</span>
            </p>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Trophy className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
          </div>
          {recentBadges.length ? (
            <div className="mt-3 flex items-center gap-2.5">
              {recentBadges.map((b) => {
                const meta = RARITY_META[b.rarity];
                return (
                  <div
                    key={b.key}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
                    style={{
                      background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)`,
                      boxShadow: `inset 0 0 0 1px ${meta.color}33`,
                    }}
                    title={b.name}
                  >
                    {b.icon}
                  </div>
                );
              })}
              <span className="ml-1 text-xs text-ink-faint">Derniers gagnés</span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-ink-faint">
              Pas encore de trophée. Le générique attend.
            </p>
          )}
        </Link>
      </section>

      {/* Liens */}
      <div className="grid grid-cols-2 gap-3">
        <NavCard
          href="/profil/membres"
          icon={Users}
          title="Membres"
          sub={`${members.length} cinéphiles`}
        />
        <NavCard
          href="/profil/historique"
          icon={History}
          title="Historique"
          sub="Mémoire du club"
        />
      </div>

      {/* Code d'invitation */}
      <InviteCode code={community.inviteCode} />

      {/* Édition du profil */}
      <section>
        <Eyebrow>Modifier mon profil</Eyebrow>
        <form action={updateProfileAction} className="mt-3 space-y-4">
          <Field label="Pseudo">
            <Input name="pseudo" defaultValue={me.pseudo} required />
          </Field>
          <Field label="Photo (URL)">
            <Input
              name="photoUrl"
              defaultValue={me.photoUrl ?? ""}
              placeholder="https://…"
            />
          </Field>
          <Field label="Film préféré">
            <Input name="favoriteFilm" defaultValue={me.favoriteFilm ?? ""} />
          </Field>
          <Field label="Réalisateur préféré">
            <Input
              name="favoriteDirector"
              defaultValue={me.favoriteDirector ?? ""}
            />
          </Field>
          <Field label="Citation cinéma favorite">
            <Textarea
              name="favoriteQuote"
              defaultValue={me.favoriteQuote ?? ""}
            />
          </Field>
          <SubmitButton size="lg" pendingText="Enregistrement…">
            Enregistrer
          </SubmitButton>
        </form>
      </section>

      {/* Déconnexion */}
      <form action={signOutAction} className="pt-2">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-pill border border-border py-3 text-sm font-semibold text-ink-muted transition-colors hover:border-red/40 hover:text-red"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Se déconnecter
        </button>
      </form>
    </div>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-4 text-center">
      <p
        className={`font-display text-3xl ${accent ? "text-accent" : "text-ink"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] font-medium leading-tight text-ink-faint">
        {label}
      </p>
    </div>
  );
}

function NavCard({
  href,
  icon: Icon,
  title,
  sub,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[var(--radius-card)] border border-border bg-card p-4 transition-colors hover:border-border-strong active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-ink-muted" strokeWidth={2} />
        <ArrowRight
          className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5"
          strokeWidth={2}
        />
      </div>
      <p className="mt-3 font-subheading text-[17px] text-ink">{title}</p>
      <p className="mt-0.5 text-xs text-ink-faint">{sub}</p>
    </Link>
  );
}
