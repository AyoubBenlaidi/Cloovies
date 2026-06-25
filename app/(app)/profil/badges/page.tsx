import Link from "next/link";
import { Card, Eyebrow } from "@/components/ui/Card";
import { BadgeGrid } from "@/components/badges/BadgeGrid";
import {
  getActiveCommunity,
  getCommunityBadgeHolders,
  getCurrentUserId,
  getMyBadges,
} from "@/lib/data";
import {
  BADGES,
  BADGE_BY_KEY,
  CATEGORY_META,
  RARITY_META,
  type BadgeCategory,
} from "@/lib/badges/catalog";

export default async function BadgesPage() {
  const userId = await getCurrentUserId();
  const community = await getActiveCommunity();
  const [myBadgesList, holdersList] = await Promise.all([
    getMyBadges(userId),
    getCommunityBadgeHolders(community.id),
  ]);

  const unlockedMap = new Map(myBadgesList.map((b) => [b.key, b.unlockedAt]));

  // Stats par catégorie + rareté
  const byCategory = new Map<BadgeCategory, { total: number; unlocked: number }>();
  for (const b of BADGES) {
    const e = byCategory.get(b.category) ?? { total: 0, unlocked: 0 };
    e.total += 1;
    if (unlockedMap.has(b.key)) e.unlocked += 1;
    byCategory.set(b.category, e);
  }

  // Les plus rares du club : badges détenus par 1 à 2 membres, triés par rareté puis nb holders.
  const rarestOfClub = holdersList
    .filter((h) => h.holders > 0 && h.holders <= 2)
    .map((h) => ({ ...h, def: BADGE_BY_KEY.get(h.badgeKey) }))
    .filter((h): h is typeof h & { def: NonNullable<typeof h.def> } => !!h.def)
    .sort((a, b) => {
      const r = RARITY_META[b.def.rarity].order - RARITY_META[a.def.rarity].order;
      return r !== 0 ? r : a.holders - b.holders;
    })
    .slice(0, 6);

  return (
    <div className="space-y-7">
      <header className="animate-fade-up">
        <Link href="/profil" className="text-xs text-ink-faint hover:text-ink">
          ← Profil
        </Link>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Trophées</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Une trace de tout ce que vous avez fait ici.
        </p>
      </header>

      {/* Compteur global */}
      <Card>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-display text-4xl text-gold">
              {unlockedMap.size}
              <span className="text-xl text-ink-faint"> / {BADGES.length}</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-faint">
              débloqués
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl text-ink">
              {Math.round((unlockedMap.size / BADGES.length) * 100)}%
            </p>
            <p className="mt-1 text-xs text-ink-faint">complétion</p>
          </div>
        </div>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface">
          <div
            className="h-full bg-gold transition-all duration-500"
            style={{ width: `${(unlockedMap.size / BADGES.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Les plus rares du club */}
      {rarestOfClub.length ? (
        <section>
          <Eyebrow>Les plus rares du club</Eyebrow>
          <p className="mt-2 text-xs text-ink-faint">
            Détenus par {rarestOfClub[0].holders === 1 ? "une seule personne" : "très peu de monde"}.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {rarestOfClub.map((r) => {
              const meta = RARITY_META[r.def.rarity];
              const hasIt = unlockedMap.has(r.badgeKey);
              return (
                <div
                  key={r.badgeKey}
                  className="flex flex-col items-center rounded-[var(--radius-card)] border bg-card p-3 text-center"
                  style={{
                    borderColor: hasIt ? meta.color : "var(--color-border)",
                    boxShadow: hasIt
                      ? `0 0 0 1px ${meta.color}22, 0 8px 24px -16px ${meta.glow}`
                      : undefined,
                  }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                    style={{
                      background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)`,
                    }}
                  >
                    {r.def.icon}
                  </div>
                  <p className="mt-2 font-display text-sm text-ink">{r.def.name}</p>
                  <p className="mt-1 text-[11px] text-ink-faint">
                    {r.holders} / {r.total} membre{r.total > 1 ? "s" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Récap catégories */}
      <section>
        <Eyebrow>Catégories</Eyebrow>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[...byCategory.entries()]
            .sort(
              (a, b) =>
                CATEGORY_META[a[0]].order - CATEGORY_META[b[0]].order
            )
            .map(([cat, s]) => (
              <div
                key={cat}
                className="rounded-[var(--radius-card)] border border-border bg-card p-3"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">
                  {CATEGORY_META[cat].label}
                </p>
                <p className="mt-1 font-display text-lg text-ink">
                  {s.unlocked}
                  <span className="text-sm text-ink-faint"> / {s.total}</span>
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* Grille complète */}
      <BadgeGrid unlocked={unlockedMap} />
    </div>
  );
}
