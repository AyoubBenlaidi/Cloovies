import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import { ClubSwitcher } from "@/components/nav/ClubSwitcher";
import {
  getActiveCommunity,
  getCurrentUser,
  getMyCommunities,
} from "@/lib/data";

export async function AppHeader() {
  const [community, communities, me] = await Promise.all([
    getActiveCommunity(),
    getMyCommunities(),
    getCurrentUser(),
  ]);

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Link href="/accueil" aria-label="Accueil" className="shrink-0">
          <Logo size={38} priority />
        </Link>
        <ClubSwitcher
          communities={communities}
          activeId={community.id}
          activeName={community.name}
        />
      </div>
      <Link
        href="/profil"
        aria-label="Mon profil"
        className="shrink-0 transition-transform active:scale-95"
      >
        <Avatar pseudo={me.pseudo} photoUrl={me.photoUrl} ring />
      </Link>
    </header>
  );
}
