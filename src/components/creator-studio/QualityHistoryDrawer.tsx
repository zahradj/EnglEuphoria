// Surfaces cached judge results for the current lesson (qa_judge_cache)
// so creators can see prior critic verdicts without re-running Gemini.

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

interface CacheRow {
  judge_name: string;
  content_hash: string;
  created_at: string;
  result: any;
}

interface Props {
  contentHashes: string[]; // hashes for the lesson + prior revisions
  limit?: number;
}

export function QualityHistoryDrawer({ contentHashes, limit = 12 }: Props) {
  const [rows, setRows] = useState<CacheRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contentHashes.length) return;
    let alive = true;
    setLoading(true);
    supabase
      .from('qa_judge_cache')
      .select('judge_name, content_hash, created_at, result')
      .in('content_hash', contentHashes)
      .order('created_at', { ascending: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (!alive) return;
        if (!error && data) setRows(data as CacheRow[]);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [contentHashes.join('|'), limit]);

  if (!contentHashes.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Critic history
      </div>
      {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
      {!loading && rows.length === 0 && (
        <div className="text-xs text-muted-foreground italic">
          No cached judge results for this lesson yet.
        </div>
      )}
      <ul className="space-y-1.5 max-h-48 overflow-auto pr-1">
        {rows.map((r) => {
          const verdict = r.result?.verdict ?? r.result?.decision ?? 'unknown';
          const passed = verdict === 'pass' || verdict === 'publish' || r.result?.passed === true;
          const Icon = passed ? ShieldCheck : ShieldAlert;
          return (
            <li
              key={`${r.judge_name}-${r.content_hash}-${r.created_at}`}
              className="flex items-start gap-2 text-xs rounded-md bg-background/60 px-2 py-1.5"
            >
              <Icon
                className={`h-3.5 w-3.5 mt-0.5 ${
                  passed ? 'text-emerald-600' : 'text-amber-600'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono">{r.judge_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  verdict: {String(verdict)} · hash: {r.content_hash.slice(0, 10)}…
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
