import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-7 py-10">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo size={32} />
        <span className="text-overline text-ink-faint">Club Cinoche</span>
      </Link>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}
