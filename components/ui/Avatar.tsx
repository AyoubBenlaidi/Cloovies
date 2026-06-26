import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const sizes = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-4xl",
};

/* Identité couleur par membre — déterministe, palette Cinoche. */
const IDENTITY = [
  { bg: "#fef102", ink: "#111014" }, // jaune
  { bg: "#fdabe9", ink: "#111014" }, // rose
  { bg: "#fe4237", ink: "#ffffff" }, // rouge
  { bg: "#0e82e9", ink: "#ffffff" }, // bleu
  { bg: "#33b47c", ink: "#06140e" }, // vert
];

function identity(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return IDENTITY[Math.abs(h) % IDENTITY.length];
}

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
  const id = identity(pseudo);
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold",
        ring && "ring-2 ring-accent ring-offset-2 ring-offset-bg",
        sizes[size],
        className
      )}
      style={photoUrl ? undefined : { backgroundColor: id.bg, color: id.ink }}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={pseudo}
          fill
          className="object-cover"
          sizes="112px"
        />
      ) : (
        initials
      )}
    </span>
  );
}
