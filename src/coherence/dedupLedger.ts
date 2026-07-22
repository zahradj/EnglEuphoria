// In-memory dedup ledger. Persistence happens via observer → DB.
// runCoherence operates synchronously and receives optional recent history.
export interface RecentEntry { key: string; lastUsedAt: string; useCount: number }

export interface DedupArgs {
  history?: RecentEntry[];
  withinDays?: number;
}

export function isRecentlyUsed(key: string, args: DedupArgs): boolean {
  const within = args.withinDays ?? 3;
  const cutoff = Date.now() - within * 86400000;
  const h = args.history?.find(e => e.key === key);
  if (!h) return false;
  return new Date(h.lastUsedAt).getTime() > cutoff;
}
