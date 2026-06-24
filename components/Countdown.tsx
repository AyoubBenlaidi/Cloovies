"use client";

import { useEffect, useState } from "react";
import { countdown } from "@/lib/utils/format";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-3xl tabular-nums leading-none text-ink">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-ink-faint">
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
    <div className="flex items-start justify-between px-1">
      <Unit value={t.days} label="jours" />
      <span className="font-display text-2xl text-ink-faint">:</span>
      <Unit value={t.hours} label="heures" />
      <span className="font-display text-2xl text-ink-faint">:</span>
      <Unit value={t.minutes} label="min" />
      <span className="font-display text-2xl text-ink-faint">:</span>
      <Unit value={t.seconds} label="sec" />
    </div>
  );
}
