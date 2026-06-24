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
        <span className="mb-1.5 block text-[11px] uppercase tracking-[0.18em] text-ink-faint">
          {label}
        </span>
      ) : null}
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-ink-faint">{hint}</span> : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint outline-none transition-colors duration-200 focus:border-gold/60";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={cn(inputBase, className)} {...rest} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cn(inputBase, "min-h-28 resize-none leading-relaxed", className)}
      {...rest}
    />
  );
}
