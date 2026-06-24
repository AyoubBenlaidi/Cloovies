import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Eyebrow } from "@/components/ui/Card";
import { BackIcon } from "@/components/nav/icons";
import { getActiveCommunity, getMembers } from "@/lib/data";

export default async function MembresPage() {
  const community = await getActiveCommunity();
  const members = await getMembers(community.id);

  return (
    <div className="space-y-6">
      <Link href="/profil" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <BackIcon className="h-5 w-5" /> Profil
      </Link>

      <header className="animate-fade-up">
        <Eyebrow>{community.name}</Eyebrow>
        <h1 className="mt-2 font-display text-[1.9rem] leading-tight tracking-tight">
          Les membres
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{members.length} cinéphiles dans le cercle.</p>
      </header>

      <ul className="space-y-3">
        {members.map((m, i) => (
          <li
            key={m.profile.id}
            className="flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-card p-4 animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <Avatar pseudo={m.profile.pseudo} photoUrl={m.profile.photoUrl} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg text-ink">{m.profile.pseudo}</span>
                {m.role === "admin" ? (
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold">
                    Admin
                  </span>
                ) : null}
              </div>
              {m.profile.favoriteFilm ? (
                <p className="truncate text-sm text-ink-faint">
                  Aime · {m.profile.favoriteFilm}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
