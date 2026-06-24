import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
};

export function Avatar({
  pseudo,
  photoUrl,
  size = "md",
  ring,
  className,
}: {
  pseudo: string;
  photoUrl?: string | null;
  size?: keyof typeof sizes;
  ring?: boolean;
  className?: string;
}) {
  const initials = pseudo.slice(0, 2).toUpperCase();
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-elevated font-medium text-ink-muted",
        ring && "ring-1 ring-gold/40",
        sizes[size],
        className
      )}
    >
      {photoUrl ? (
        <Image src={photoUrl} alt={pseudo} fill className="object-cover" sizes="80px" />
      ) : (
        initials
      )}
    </span>
  );
}
