import Link from "next/link";
import { ChevronLeft, Clapperboard, Film } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Eyebrow } from "@/components/ui/Card";
import { getActiveCommunity, getMembers } from "@/lib/data";

export default async function MembresPage() {
  const community = await getActiveCommunity();
  const members = await getMembers(community.id);

  return (
    <div className="space-y-6">
      <Link
        href="/profil"
        className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-elevated py-1.5 pl-2 pr-3.5 text-sm font-semibold text-ink-muted transition-colors hover:text-ink active:scale-95"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} /> Profil
      </Link>

      <header className="animate-fade-up">
        <Eyebrow tone="accent">{community.name}</Eyebrow>
        <h1 className="mt-2 font-display text-[2rem] text-ink">Les membres</h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          {members.length} cinéphile{members.length > 1 ? "s" : ""} dans le
          cercle.
        </p>
      </header>

      <ul className="space-y-3">
        {members.map((m, i) => (
          <li
            key={m.profile.id}
            className="flex items-start gap-4 rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-[var(--shadow-sm)] animate-fade-up"
            style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
          >
            <Avatar
              pseudo={m.profile.pseudo}
              photoUrl={m.profile.photoUrl}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-subheading text-[17px] text-ink">
                  {m.profile.pseudo}
                </span>
                {m.role === "admin" ? (
                  <span className="rounded-pill bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                    Admin
                  </span>
                ) : null}
              </div>
              <div className="mt-1.5 space-y-1">
                {m.profile.favoriteFilm ? (
                  <p className="flex items-center gap-1.5 truncate text-sm text-ink-muted">
                    <Film className="h-3.5 w-3.5 shrink-0 text-pink" strokeWidth={2} />
                    {m.profile.favoriteFilm}
                  </p>
                ) : null}
                {m.profile.favoriteDirector ? (
                  <p className="flex items-center gap-1.5 truncate text-sm text-ink-muted">
                    <Clapperboard
                      className="h-3.5 w-3.5 shrink-0 text-blue"
                      strokeWidth={2}
                    />
                    {m.profile.favoriteDirector}
                  </p>
                ) : null}
                {!m.profile.favoriteFilm && !m.profile.favoriteDirector ? (
                  <p className="text-sm text-ink-faint">Membre du cercle</p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
