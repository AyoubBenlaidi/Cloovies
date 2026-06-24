"use client";

import { useEffect } from "react";

/** Bottom sheet modal, glassmorphism léger, animation ease-out. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className="relative mx-auto w-full max-w-[480px] rounded-t-[24px] border-t border-border bg-elevated p-5 pb-[max(env(safe-area-inset-bottom),20px)]"
        style={{ animation: "fade-up 0.4s var(--ease) both" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        {title ? (
          <h2 className="mb-4 font-display text-xl tracking-tight">{title}</h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}
