/**
 * <MemoryBank /> — student dashboard widget showing long-term vocabulary mastery.
 *
 * Backed by the `student_mastery` table (see `src/lib/srs.ts`). Items are
 * categorized as Mastered (≥ 80) or Learning (< 80). Items past their
 * `next_review_at` are surfaced as "Due Today" and a Quick Review CTA appears.
 */
import React, { useEffect, useState } from 'react';
import { Brain, Sparkles, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMemoryBank, type MemoryBankSummary } from '@/lib/srs';

interface Props {
  /** Optional hub filter (Playground / Academy / Success). Defaults to all hubs. */
  hub?: 'Playground' | 'Academy' | 'Success';
  /** Optional click-through for the "Quick Review" CTA. */
  onQuickReview?: () => void;
}

export const MemoryBank: React.FC<Props> = ({ hub, onQuickReview }) => {
  const { user } = useAuth();
  const [data, setData] = useState<MemoryBankSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchMemoryBank(user.id, hub)
      .then((d) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user?.id, hub]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your memory bank…
        </CardContent>
      </Card>
    );
  }

  const total = data?.total ?? 0;
  const mastered = data?.mastered ?? 0;
  const learning = data?.learning ?? 0;
  const due = data?.due_today ?? 0;
  const masteredPct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <Card className="overflow-hidden border-violet-200/60 dark:border-violet-900/40 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-violet-950/40 dark:via-slate-950 dark:to-fuchsia-950/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span>Memory Bank</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Start a lesson to begin building your long-term memory. Every word you
            practice will appear here. ✨
          </p>
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-extrabold tracking-tight text-violet-700 dark:text-violet-300">
                  {mastered}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  Words mastered
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {learning} learning
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  {total} total
                </div>
              </div>
            </div>

            {/* Heatmap: 60 cells colored by mastery */}
            <Heatmap recent={data?.recent_words ?? []} mastered={mastered} learning={learning} />

            {/* Mastery meter */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <span>Mastery</span>
                <span>{masteredPct}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-violet-100 dark:bg-violet-950/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${masteredPct}%` }}
                />
              </div>
            </div>

            {/* Quick Review CTA */}
            {due > 0 && (
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-amber-900 dark:text-amber-200">
                    {due} {due === 1 ? 'word is' : 'words are'} due for review today
                  </div>
                  <div className="text-amber-700 dark:text-amber-400/80 leading-tight">
                    A quick 5-min refresh keeps them in your long-term memory.
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={onQuickReview}
                  className="h-9 px-3 gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white border-0 shrink-0"
                >
                  <Zap className="h-3.5 w-3.5" /> Review
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Heatmap: React.FC<{ recent: string[]; mastered: number; learning: number }> = ({
  recent,
}) => {
  // 60 cells, lit from left based on combined activity. Recent words get a tooltip.
  const cells = Array.from({ length: 60 });
  const lit = Math.min(60, recent.length * 5);
  return (
    <div
      className="grid grid-cols-12 gap-1"
      title={recent.length ? `Recent: ${recent.slice(0, 6).join(', ')}` : undefined}
    >
      {cells.map((_, i) => {
        const on = i < lit;
        const intensity = on ? Math.max(0.4, 1 - i / lit) : 0;
        return (
          <div
            key={i}
            className="h-3 rounded-sm transition-colors"
            style={{
              background: on
                ? `hsl(280 80% ${75 - intensity * 35}%)`
                : 'hsl(270 20% 90% / 0.5)',
            }}
          />
        );
      })}
    </div>
  );
};
