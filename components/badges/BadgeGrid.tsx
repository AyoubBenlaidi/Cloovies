import { Eyebrow } from "@/components/ui/Card";
import { BadgeCard } from "./BadgeCard";
import {
  BADGES,
  CATEGORY_META,
  RARITY_META,
  type BadgeDef,
} from "@/lib/badges/catalog";

interface Props {
  unlocked: Map<string, string>;
  /** Si vrai, regroupe par catégorie. Sinon affiche en une grille plate. */
  grouped?: boolean;
}

export function BadgeGrid({ unlocked, grouped = true }: Props) {
  if (!grouped) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {BADGES.map((b) => (
          <BadgeCard
            key={b.key}
            badge={b}
            unlocked={unlocked.has(b.key)}
            unlockedAt={unlocked.get(b.key)}
            size="sm"
          />
        ))}
      </div>
    );
  }

  const byCat = new Map<string, BadgeDef[]>();
  for (const b of BADGES) {
    if (!byCat.has(b.category)) byCat.set(b.category, []);
    byCat.get(b.category)!.push(b);
  }
  const categories = [...byCat.entries()].sort(
    (a, b) => CATEGORY_META[a[0] as keyof typeof CATEGORY_META].order - CATEGORY_META[b[0] as keyof typeof CATEGORY_META].order
  );

  return (
    <div className="space-y-7">
      {categories.map(([cat, list]) => {
        const sorted = [...list].sort(
          (a, b) => RARITY_META[a.rarity].order - RARITY_META[b.rarity].order
        );
        const unlockedHere = sorted.filter((b) => unlocked.has(b.key)).length;
        return (
          <section key={cat}>
            <div className="flex items-baseline justify-between">
              <Eyebrow>
                {CATEGORY_META[cat as keyof typeof CATEGORY_META].label}
              </Eyebrow>
              <span className="text-[11px] text-ink-faint">
                {unlockedHere} / {sorted.length}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {sorted.map((b) => (
                <BadgeCard
                  key={b.key}
                  badge={b}
                  unlocked={unlocked.has(b.key)}
                  unlockedAt={unlocked.get(b.key)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
