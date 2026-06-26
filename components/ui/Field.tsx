import { cn } from "@/lib/utils/cn";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      {label ? (
        <span className="mb-2 block text-overline text-ink-muted">{label}</span>
      ) : null}
      {children}
      {hint ? (
        <span className="mt-2 block text-xs leading-relaxed text-ink-faint">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-3 text-[15px] font-medium text-ink " +
  "placeholder:font-normal placeholder:text-ink-faint outline-none " +
  "transition-[border-color,box-shadow,background-color] duration-200 " +
  "focus:border-accent/70 focus:bg-elevated focus:shadow-[0_0_0_3px_rgba(254,241,2,0.12)]";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={cn(inputBase, className)} {...rest} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cn(inputBase, "min-h-32 resize-none leading-relaxed", className)}
      {...rest}
    />
  );
}
