import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Color = "accent" | "pink" | "red" | "blue" | "green";

const HUES: Record<Color, string> = {
  accent: "#fef102",
  pink: "#fdabe9",
  red: "#fe4237",
  blue: "#0e82e9",
  green: "#33b47c",
};

/**
 * État vide illustré — jamais une page nue.
 * Une icône posée dans un halo coloré, un mot chaleureux, un CTA optionnel.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  color = "accent",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  color?: Color;
  className?: string;
}) {
  const hue = HUES[color];
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-14 text-center animate-fade-up",
        className
      )}
    >
      <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ background: hue, opacity: 0.16 }}
        />
        <span
          className="relative flex h-20 w-20 items-center justify-center rounded-[26px] border"
          style={{
            borderColor: `${hue}33`,
            background: `radial-gradient(120% 120% at 50% 0%, ${hue}1f, transparent 70%)`,
          }}
        >
          <Icon className="h-9 w-9" style={{ color: hue }} strokeWidth={1.75} />
        </span>
      </div>
      <h3 className="font-heading text-xl text-ink text-balance">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-ink-muted text-balance">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6 w-full max-w-[16rem]">{action}</div> : null}
    </div>
  );
}
