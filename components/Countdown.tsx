"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { countdown } from "@/lib/utils/format";

function Unit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative flex h-16 w-full items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-border bg-surface">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={v}
            initial={{ y: "60%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-60%", opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-3xl tabular-nums leading-none text-ink"
          >
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
    </div>
  );
}

export function Countdown({ target }: { target: string }) {
  const [t, setT] = useState(() => countdown(target));

  useEffect(() => {
    const id = setInterval(() => setT(countdown(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex items-start gap-2">
      <Unit value={t.days} label="jours" />
      <Unit value={t.hours} label="heures" />
      <Unit value={t.minutes} label="min" />
      <Unit value={t.seconds} label="sec" />
    </div>
  );
}
