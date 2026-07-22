import { useEffect, useState } from 'react';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { Target, Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const HUB_ACCENT: Record<string, string> = {
  playground: 'text-orange-600',
  academy: 'text-indigo-600',
  professional: 'text-emerald-600',
};

interface BadgeTier {
  id: string;
  label: string;
  threshold: number;
  ring: string;        // tailwind colour for the badge gradient
  icon: string;
}

const BADGE_TIERS: BadgeTier[] = [
  { id: 'bronze', label: 'Bronze Scholar',   threshold: 100,  ring: 'from-amber-400 to-orange-500', icon: '🥉' },
  { id: 'silver', label: 'Silver Linguist',  threshold: 500,  ring: 'from-slate-300 to-slate-500',  icon: '🥈' },
  { id: 'gold',   label: 'Gold Master',      threshold: 1000, ring: 'from-yellow-300 to-yellow-500', icon: '🥇' },
];

export function MasteryMilestonesTab() {
  const { studentLevel } = useStudentLevel();
  const accent = HUB_ACCENT[studentLevel || 'playground'];
  const [totalXp, setTotalXp] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('users').select('total_xp').eq('id', user.id).maybeSingle();
      if (!cancelled) setTotalXp(((data as any)?.total_xp as number) ?? 0);
    })();
    return () => { cancelled = true; };
  }, []);

  const nextTier = BADGE_TIERS.find((t) => totalXp < t.threshold);
  const progressPct = nextTier
    ? Math.min(100, Math.round((totalXp / nextTier.threshold) * 100))
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={cn('text-3xl font-bold flex items-center gap-2', accent)}>
          <Target className="w-7 h-7" />
          Mastery Milestones
        </h1>
        <p className="text-muted-foreground mt-1">
          Earn XP from homework and lessons. Unlock badges as you grow.
        </p>
      </div>

      {/* XP banner */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Total XP</p>
            <p className={cn('text-4xl font-extrabold', accent)}>{totalXp.toLocaleString()}</p>
          </div>
          {nextTier && (
            <p className="text-sm text-slate-500">
              Next badge in <span className="font-bold text-slate-800">{(nextTier.threshold - totalXp).toLocaleString()}</span> XP
            </p>
          )}
        </div>
        <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className={cn('h-full bg-gradient-to-r transition-all duration-700', nextTier?.ring || 'from-yellow-300 to-yellow-500')} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Tier badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BADGE_TIERS.map((t) => {
          const earned = totalXp >= t.threshold;
          return (
            <div
              key={t.id}
              className={cn(
                'rounded-2xl p-5 border text-center transition-all',
                earned
                  ? 'bg-white border-slate-200 shadow-md'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              )}
            >
              <div className={cn(
                'mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-gradient-to-br shadow-inner',
                earned ? t.ring : 'from-slate-300 to-slate-400 grayscale'
              )}>
                {earned ? t.icon : <Lock className="w-7 h-7 text-white" />}
              </div>
              <h3 className="mt-3 font-bold text-slate-800 flex items-center justify-center gap-1">
                {earned && <Award className="w-4 h-4 text-amber-500" />}
                {t.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{t.threshold.toLocaleString()} XP</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-5 text-sm text-muted-foreground">
        Tip: Complete an interactive Homework Player to earn <strong>+50 XP</strong> instantly. Lesson 6 Mastery Quizzes give bigger boosts.
      </div>
    </div>
  );
}
