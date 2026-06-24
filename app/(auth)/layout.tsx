import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-7 py-10">
      <Link
        href="/"
        className="text-[11px] uppercase tracking-[0.32em] text-ink-faint"
      >
        Cloovies
      </Link>
      <div className="flex flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}
