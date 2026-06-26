"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

/** Code d'invitation au club — tap pour copier. */
export function InviteCode({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast("Code copié — partagez-le au club", { variant: "success" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Copie impossible", { variant: "error" });
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "group flex w-full items-center justify-between gap-4 rounded-[var(--radius-card)] border border-dashed border-border-strong bg-card px-5 py-4 text-left transition-colors duration-200 hover:border-accent/60 active:scale-[0.99]",
        className
      )}
    >
      <span className="flex flex-col">
        <span className="text-overline text-ink-faint">Inviter au club</span>
        <span className="mt-1.5 font-display text-2xl tracking-[0.12em] text-accent">
          {code}
        </span>
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-elevated text-ink-muted transition-colors group-hover:text-accent">
        {copied ? (
          <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />
        ) : (
          <Copy className="h-[18px] w-[18px]" strokeWidth={2} />
        )}
      </span>
    </button>
  );
}
