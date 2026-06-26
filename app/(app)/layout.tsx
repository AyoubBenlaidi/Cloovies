import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { BadgeUnlockToast } from "@/components/badges/BadgeUnlockToast";
import { ToastViewport } from "@/components/ui/Toast";
import { consumePendingUnlocks } from "@/lib/badges/evaluator";

// Données lues à chaque requête (reflète l'état du mode démo / Supabase).
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pending = await consumePendingUnlocks();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
      <AppHeader />
      <main className="flex-1 px-5 pb-32 pt-2">{children}</main>
      <BottomNav />
      <ToastViewport />
      {pending.length ? (
        <BadgeUnlockToast badgeKeys={pending.map((b) => b.key)} />
      ) : null}
    </div>
  );
}
