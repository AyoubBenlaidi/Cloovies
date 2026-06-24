import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";

// Données lues à chaque requête (reflète l'état du mode démo / Supabase).
export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
      <AppHeader />
      <main className="flex-1 px-5 pb-32 pt-1">{children}</main>
      <BottomNav />
    </div>
  );
}
