import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PlacementResult {
  cefr_level: string | null;
  hub: string | null;
  ability_theta: number | null;
  items_answered: number | null;
  created_at: string | null;
  trail: any | null;
}

const HUB_ACCENT: Record<string, { text: string; ring: string; bg: string }> = {
  playground: { text: 'text-orange-600', ring: 'ring-orange-300/50', bg: 'from-orange-50 to-amber-50/60 dark:from-orange-950/30 dark:to-amber-950/20' },
  academy:    { text: 'text-indigo-600', ring: 'ring-indigo-300/50', bg: 'from-indigo-50 to-violet-50/60 dark:from-indigo-950/30 dark:to-violet-950/20' },
  professional:{ text: 'text-emerald-600', ring: 'ring-emerald-300/50', bg: 'from-emerald-50 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-950/20' },
};

export function PlacementSummaryCard({ hub = 'academy' }: { hub?: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<PlacementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const accent = HUB_ACCENT[hub] ?? HUB_ACCENT.academy;

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: rows } = await (supabase as any)
        .from('placement_results')
        .select('cefr_level, hub, ability_theta, items_answered, created_at, trail')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setData((rows as PlacementResult) ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) return <Skeleton className="h-32 rounded-2xl" />;
  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
        Take the placement test to see your starting level and recommended path.
      </div>
    );
  }

  // Strengths / gaps from trail (best-effort — trail shape varies).
  const trail = Array.isArray(data.trail) ? data.trail : [];
  const bySkill: Record<string, { correct: number; total: number }> = {};
  for (const t of trail) {
    const skill = (t?.skill || t?.tag || t?.area || '').toString();
    if (!skill) continue;
    if (!bySkill[skill]) bySkill[skill] = { correct: 0, total: 0 };
    bySkill[skill].total += 1;
    if (t?.correct) bySkill[skill].correct += 1;
  }
  const ranked = Object.entries(bySkill)
    .map(([k, v]) => ({ skill: k, ratio: v.total ? v.correct / v.total : 0 }))
    .sort((a, b) => b.ratio - a.ratio);
  const strengths = ranked.slice(0, 2).map((r) => r.skill);
  const gaps = ranked.slice(-2).map((r) => r.skill).filter((s) => !strengths.includes(s));

  const cefr = (data.cefr_level || '').toUpperCase();
  const taken = data.created_at ? new Date(data.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className={cn('rounded-2xl border ring-1 p-5 bg-gradient-to-br', accent.ring, accent.bg)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className={cn('w-4 h-4', accent.text)} />
            <h2 className={cn('font-bold text-lg', accent.text)}>Your placement result</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Where you started · taken {taken || 'recently'}
          </p>
        </div>
        <div className={cn('rounded-full px-3 py-1 text-sm font-extrabold bg-background/70 ring-1', accent.text, accent.ring)}>
          {cefr || '—'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-background/60 p-3 ring-1 ring-border/30">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            <TrendingUp className="w-3 h-3" /> Strengths
          </div>
          <div className="mt-1 font-medium capitalize">
            {strengths.length ? strengths.join(' · ') : 'Balanced across skills'}
          </div>
        </div>
        <div className="rounded-xl bg-background/60 p-3 ring-1 ring-border/30">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            <Target className="w-3 h-3" /> Focus next
          </div>
          <div className="mt-1 font-medium capitalize">
            {gaps.length ? gaps.join(' · ') : 'Keep building from your start level'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span>{data.items_answered ?? '—'} questions answered</span>
        {typeof data.ability_theta === 'number' && (
          <span>ability θ {data.ability_theta.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}

export default PlacementSummaryCard;
