import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { getActiveCommunity, getCurrentUser } from "@/lib/data";

export async function AppHeader() {
  const [community, me] = await Promise.all([
    getActiveCommunity(),
    getCurrentUser(),
  ]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 backdrop-blur-md">
      <Link href="/accueil" className="flex flex-col leading-none">
        <span className="text-[11px] uppercase tracking-[0.28em] text-ink-faint">
          Le club
        </span>
        <span className="font-display text-lg tracking-tight text-ink">
          {community.name}
        </span>
      </Link>
      <Link href="/profil" aria-label="Mon profil">
        <Avatar pseudo={me.pseudo} photoUrl={me.photoUrl} ring />
      </Link>
    </header>
  );
}
