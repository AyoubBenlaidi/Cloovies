import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import { getActiveCommunity, getCurrentUser } from "@/lib/data";

export async function AppHeader() {
  const [community, me] = await Promise.all([
    getActiveCommunity(),
    getCurrentUser(),
  ]);

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
      <Link href="/accueil" className="flex min-w-0 items-center gap-2.5">
        <Logo size={38} priority />
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-overline text-ink-faint">Le club</span>
          <span className="mt-1 truncate font-heading text-[17px] text-ink">
            {community.name}
          </span>
        </span>
      </Link>
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
