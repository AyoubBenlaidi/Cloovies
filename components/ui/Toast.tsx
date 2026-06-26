"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, X } from "lucide-react";
import { EASE } from "@/components/motion";

type Variant = "success" | "info" | "error";
type ToastItem = { id: number; message: string; variant: Variant };

const EVENT = "cinoche:toast";

/** Déclenche un toast depuis n'importe quel composant client. */
export function toast(message: string, opts?: { variant?: Variant }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT, {
      detail: { message, variant: opts?.variant ?? "success" },
    })
  );
}

const ICONS: Record<Variant, typeof Check> = {
  success: Check,
  info: Info,
  error: X,
};
const HUES: Record<Variant, string> = {
  success: "#33b47c",
  info: "#0e82e9",
  error: "#fe4237",
};

/** Pile de toasts, en haut d'écran. Doux, jamais intrusif. */
export function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const remove = useCallback(
    (id: number) => setItems((s) => s.filter((t) => t.id !== id)),
    []
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Omit<ToastItem, "id">;
      const id = Date.now() + Math.random();
      setItems((s) => [...s.slice(-2), { id, ...detail }]);
      setTimeout(() => remove(id), 3400);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [remove]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),12px)]">
      <AnimatePresence>
        {items.map((t) => {
          const Icon = ICONS[t.variant];
          const hue = HUES[t.variant];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={() => remove(t.id)}
              className="glass pointer-events-auto flex w-full max-w-[400px] items-center gap-3 rounded-[var(--radius-card)] border border-border-strong px-4 py-3 shadow-[var(--shadow-lg)]"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: `${hue}22`, color: hue }}
              >
                <Icon className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <p className="flex-1 text-sm font-medium leading-snug text-ink">
                {t.message}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
