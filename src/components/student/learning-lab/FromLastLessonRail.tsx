import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FromLastLessonRailProps<T> {
  /** Supabase table name to query (typed loosely so it works on `any` client). */
  table: string;
  /** Column on the row that names the item (e.g. "word", "phoneme"). */
  labelField: keyof T & string;
  /** Optional column to show as small caption (e.g. "definition"). */
  captionField?: (keyof T & string);
  /** Title shown above the rail. */
  title?: string;
  /** Visual accent classes. */
  accent?: string;
  /** Lookback window in days (default 7). */
  days?: number;
  /** Optional client-side filter. */
  filter?: (row: any) => boolean;
}

/**
 * "🆕 From your last lesson" strip — shows items added or updated in the
 * last N days for the currently signed-in student. Used at the top of
 * Vocab Vault, Map of Sounds, and Grammar Journal.
 */
export function FromLastLessonRail<T = any>({
  table,
  labelField,
  captionField,
  title = 'From your last lesson',
  accent = 'text-indigo-600',
  days = 7,
  filter,
}: FromLastLessonRailProps<T>) {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from(table)
        .select('*')
        .eq('student_id', user.id)
        .or(`updated_at.gte.${sinceIso},created_at.gte.${sinceIso}`)
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(12);
      if (cancelled) return;
      const items = (data ?? []).filter((r: any) => (filter ? filter(r) : true));
      setRows(items);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id, table, days, filter]);

  if (loading) {
    return <div className="h-20 rounded-2xl bg-muted/40 animate-pulse" />;
  }
  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className={cn('w-4 h-4', accent)} />
        <h2 className={cn('font-bold text-sm', accent)}>{title}</h2>
        <span className="text-[11px] text-muted-foreground">added in the last {days} days</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {rows.map((r) => (
          <div
            key={r.id ?? `${r[labelField]}-${r.created_at}`}
            className="shrink-0 rounded-xl bg-background/80 ring-1 ring-emerald-200/60 dark:ring-emerald-800/50 px-3 py-2 min-w-[8rem] max-w-[14rem]"
          >
            <div className="font-bold text-sm truncate">{r[labelField] ?? '—'}</div>
            {captionField && r[captionField] && (
              <div className="text-[11px] text-muted-foreground truncate">{r[captionField]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FromLastLessonRail;
