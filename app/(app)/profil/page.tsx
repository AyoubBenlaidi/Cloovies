import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, Eyebrow } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import {
  CURRENT_USER_ID,
  getActiveCommunity,
  getCurrentUser,
  getMembers,
  getPersonalStats,
} from "@/lib/data";
import { updateProfileAction } from "./actions";

export default async function ProfilPage() {
  const [me, community, stats] = await Promise.all([
    getCurrentUser(),
    getActiveCommunity(),
    getPersonalStats(CURRENT_USER_ID),
  ]);
  const members = await getMembers(community.id);

  return (
    <div className="space-y-7">
      <header className="flex flex-col items-center pt-2 text-center animate-fade-up">
        <Avatar pseudo={me.pseudo} photoUrl={me.photoUrl} size="lg" ring />
        <h1 className="mt-4 font-display text-2xl tracking-tight">{me.pseudo}</h1>
        <p className="text-sm text-ink-faint">{community.name}</p>
      </header>

      {/* Stats personnelles (US25) */}
      <section>
        <Eyebrow>Mon parcours</Eyebrow>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Card>
            <p className="font-display text-3xl text-ink">{stats.filmsSeen}</p>
            <p className="mt-1 text-xs text-ink-faint">films vus</p>
          </Card>
          <Card>
            <p className="font-display text-3xl text-gold">
              {stats.averageScore ?? "—"}
            </p>
            <p className="mt-1 text-xs text-ink-faint">note moyenne donnée</p>
          </Card>
        </div>
        {stats.topGenres.length ? (
          <Card className="mt-3">
            <Eyebrow>Genres préférés</Eyebrow>
            <div className="mt-2 flex flex-wrap gap-2">
              {stats.topGenres.map((g) => (
                <span key={g.genre} className="rounded-full bg-surface px-3 py-1 text-sm text-ink-muted">
                  {g.genre} · {g.count}
                </span>
              ))}
            </div>
          </Card>
        ) : null}
        {stats.topDirectors.length ? (
          <Card className="mt-3">
            <Eyebrow>Réalisateurs les plus regardés</Eyebrow>
            <div className="mt-2 flex flex-wrap gap-2">
              {stats.topDirectors.map((d) => (
                <span key={d.director} className="rounded-full bg-surface px-3 py-1 text-sm text-ink-muted">
                  {d.director}
                </span>
              ))}
            </div>
          </Card>
        ) : null}
      </section>

      {/* Liens */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/profil/membres" className="rounded-[var(--radius-card)] border border-border bg-card p-4 transition-colors hover:border-gold/40">
          <p className="font-display text-lg text-ink">Membres</p>
          <p className="mt-1 text-xs text-ink-faint">{members.length} cinéphiles</p>
        </Link>
        <Link href="/profil/historique" className="rounded-[var(--radius-card)] border border-border bg-card p-4 transition-colors hover:border-gold/40">
          <p className="font-display text-lg text-ink">Historique</p>
          <p className="mt-1 text-xs text-ink-faint">Bibliothèque du club</p>
        </Link>
      </div>

      {/* Code d'invitation */}
      <Card>
        <Eyebrow>Inviter au club</Eyebrow>
        <p className="mt-2 font-display text-2xl tracking-[0.15em] text-gold">
          {community.inviteCode}
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          Partagez ce code pour faire entrer un nouveau membre.
        </p>
      </Card>

      {/* Édition du profil (US3) */}
      <section>
        <Eyebrow>Modifier mon profil</Eyebrow>
        <form action={updateProfileAction} className="mt-3 space-y-4">
          <Field label="Pseudo">
            <Input name="pseudo" defaultValue={me.pseudo} required />
          </Field>
          <Field label="Photo (URL)">
            <Input name="photoUrl" defaultValue={me.photoUrl ?? ""} placeholder="https://…" />
          </Field>
          <Field label="Film préféré">
            <Input name="favoriteFilm" defaultValue={me.favoriteFilm ?? ""} />
          </Field>
          <Field label="Réalisateur préféré">
            <Input name="favoriteDirector" defaultValue={me.favoriteDirector ?? ""} />
          </Field>
          <Field label="Citation cinéma favorite">
            <Textarea name="favoriteQuote" defaultValue={me.favoriteQuote ?? ""} />
          </Field>
          <Button type="submit" size="lg">
            Enregistrer
          </Button>
        </form>
      </section>
    </div>
  );
}
