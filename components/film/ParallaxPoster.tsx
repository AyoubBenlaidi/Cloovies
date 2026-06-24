"use client";

import { useEffect, useRef } from "react";
import { Poster } from "./Poster";

/** Parallax léger sur le poster (amplitude faible, jamais gadget). */
export function ParallaxPoster({
  title,
  year,
  posterUrl,
}: {
  title: string;
  year?: number | null;
  posterUrl?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (ref.current) {
          // amplitude max ~24px
          ref.current.style.transform = `translateY(${Math.min(y * 0.12, 24)}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
      <div ref={ref} className="will-change-transform">
        <Poster
          title={title}
          year={year}
          posterUrl={posterUrl}
          priority
          className="aspect-[3/4] rounded-none border-0"
          sizes="(max-width: 480px) 100vw, 480px"
        />
      </div>
    </div>
  );
}
