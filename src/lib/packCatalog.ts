import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * ONE place that knows the lesson packs, so the homepage, the pricing page, the student billing tab and the family
 * dashboard cannot drift apart. The database (`credit_packs`, readable by everyone while a pack is active) is the
 * source of truth; FALLBACK_PACKS only fills in while it loads or if it cannot be reached, and mirrors what the
 * migrations in supabase/migrations leave in the table:
 *   - 20260221000946 seeds Academy / Success; 20261007100000 doubles their counts, 20261007140000 halves counts AND
 *     prices again (packs start at 5 lessons everywhere) -> Academy 37.50 / 72.50 / 145, Success 50 / 97.50 / 195.
 *   - Playground 5 / 10 / 20 lessons at 37.50 / 75 / 150 (EUR 7.50 a lesson).
 *   - 20261007230000 + 20261009180000 add the FAMILY packs (20 / 30 / 40 lessons, same price per lesson as each hub's
 *     20-lesson pack): Playground 150 / 225 / 300, Academy 145 / 217.50 / 290, Success 195 / 292.50 / 390.
 * A lesson is 25 minutes (booked in a 30-minute slot) = 1 lesson, in every hub.
 */
export type PackHub = 'playground' | 'academy' | 'professional';

export interface CatalogPack {
  id?: string;
  name: string;
  hub: PackHub;
  sessions: number;
  price: number;
  originalPrice: number;
  savings: number;
  familyOnly: boolean;
}

const regular = (hub: PackHub, rows: Array<[number, number, number]>): CatalogPack[] =>
  rows.map(([sessions, price, originalPrice]) => ({
    name: `${sessions} lessons`,
    hub,
    sessions,
    price,
    originalPrice,
    savings: Math.round((originalPrice - price) * 100) / 100,
    familyOnly: false,
  }));

const family = (hub: PackHub, rows: Array<[number, number]>): CatalogPack[] =>
  rows.map(([sessions, price]) => ({
    name: `Family ${sessions}`,
    hub,
    sessions,
    price,
    originalPrice: price,
    savings: 0,
    familyOnly: true,
  }));

export const FALLBACK_PACKS: CatalogPack[] = [
  ...regular('playground', [[5, 37.5, 37.5], [10, 75, 85], [20, 150, 170]]),
  ...regular('academy', [[5, 37.5, 37.5], [10, 72.5, 75], [20, 145, 150]]),
  ...regular('professional', [[5, 50, 50], [10, 97.5, 100], [20, 195, 200]]),
  ...family('playground', [[20, 150], [30, 225], [40, 300]]),
  ...family('academy', [[20, 145], [30, 217.5], [40, 290]]),
  ...family('professional', [[20, 195], [30, 292.5], [40, 390]]),
];

/** "€150", "€37.50": whole euros stay whole, otherwise two decimals (rounding 37.50 to "€38" under-states the price). */
export const euroLabel = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;

const HUBS: PackHub[] = ['playground', 'academy', 'professional'];

/** Turn `credit_packs` rows into catalogue packs (ignores hubs we do not know). Exported for the tests. */
export function packsFromRows(rows: unknown[] | null | undefined): CatalogPack[] {
  const out: CatalogPack[] = [];
  for (const r of (rows ?? []) as Array<Record<string, unknown>>) {
    const hub = r.student_level as PackHub;
    if (!HUBS.includes(hub)) continue;
    const price = Number(r.price_eur);
    const sessions = Number(r.session_count);
    if (!Number.isFinite(price) || !Number.isFinite(sessions) || sessions <= 0) continue;
    out.push({
      id: r.id as string | undefined,
      name: String(r.name ?? ''),
      hub,
      sessions,
      price,
      originalPrice: Number(r.original_price_eur ?? price),
      savings: Number(r.savings_eur ?? 0),
      familyOnly: Boolean(r.family_only),
    });
  }
  return out;
}

/** Regular pack of a hub with this many lessons (database first, then the fallback). */
export function findPack(packs: CatalogPack[], hub: PackHub, sessions: number): CatalogPack {
  return (
    packs.find((p) => !p.familyOnly && p.hub === hub && p.sessions === sessions) ??
    FALLBACK_PACKS.find((p) => !p.familyOnly && p.hub === hub && p.sessions === sessions)!
  );
}

/** Family packs of a hub, smallest first. A hub with none in the database shows the fallback ones. */
export function familyPacks(packs: CatalogPack[], hub: PackHub): CatalogPack[] {
  const fromDb = packs.filter((p) => p.familyOnly && p.hub === hub).sort((a, b) => a.sessions - b.sessions);
  return fromDb.length > 0 ? fromDb : FALLBACK_PACKS.filter((p) => p.familyOnly && p.hub === hub);
}

let cache: CatalogPack[] | null = null;
let inflight: Promise<CatalogPack[]> | null = null;

function loadCatalog(): Promise<CatalogPack[]> {
  if (cache) return Promise.resolve(cache);
  inflight ??= (async () => {
    const { data, error } = await supabase
      .from('credit_packs')
      .select('id, name, student_level, session_count, price_eur, original_price_eur, savings_eur, family_only, sort_order')
      .eq('is_active', true)
      .order('sort_order');
    const packs = error ? [] : packsFromRows(data);
    if (packs.length > 0) cache = packs;
    inflight = null;
    return packs;
  })();
  return inflight;
}

/** The packs to show. Starts with the fallback so a page never flashes empty; swaps to the database rows when they arrive. */
export function usePackCatalog(): { packs: CatalogPack[]; fromDb: boolean } {
  const [packs, setPacks] = useState<CatalogPack[]>(cache ?? FALLBACK_PACKS);
  const [fromDb, setFromDb] = useState(!!cache);
  useEffect(() => {
    let alive = true;
    loadCatalog()
      .then((p) => {
        if (alive && p.length > 0) {
          setPacks(p);
          setFromDb(true);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  return { packs, fromDb };
}
