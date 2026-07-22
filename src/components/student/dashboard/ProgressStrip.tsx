import React, { useEffect, useRef, useState } from 'react';
import { Zap, Flame, Coins, Target, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAcademyCoinBalance } from '@/hooks/useAcademyCoinBalance';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Hub = 'playground' | 'academy' | 'professional';

const HUB_CHIP: Record<Hub, string> = {
  playground:
    'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-400/30 dark:bg-orange-500/10 dark:text-orange-100',
  academy:
    'border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-100',
  professional:
    'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-100',
};

const HUB_ACCENT: Record<Hub, string> = {
  playground: 'text-orange-600 dark:text-orange-300',
  academy: 'text-indigo-600 dark:text-indigo-300',
  professional: 'text-emerald-600 dark:text-emerald-300',
};

const HUB_BAR: Record<Hub, string> = {
  playground: 'bg-orange-500',
  academy: 'bg-indigo-500',
  professional: 'bg-emerald-500',
};

interface Stats {
  xp: number;
  level: number;
  streak: number;
  mastery: number;
}

const XP_PER_LEVEL = 1000;

/** Animated integer count-up. */
function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

/**
 * Gamified progress cards — interactive, animated, tappable. Each card
 * navigates to its detail surface and shows a live progress signal
 * (level bar, streak pulse, coin sheen, mastery ring).
 */
export const ProgressStrip: React.FC<{ hub: Hub }> = ({ hub }) => {
  const { user } = useAuth();
  const { coins } = useAcademyCoinBalance();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ xp: 0, level: 1, streak: 0, mastery: 0 });

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const [currencyRes, masteryRes] = await Promise.all([
        supabase
          .from('learning_currency' as any)
          .select('total_xp, level, current_streak')
          .eq('student_id', user.id)
          .maybeSingle(),
        supabase
          .from('student_mastery' as any)
          .select('mastery_score')
          .eq('student_id', user.id),
      ]);
      if (cancelled) return;
      const c: any = currencyRes.data || {};
      const m: any[] = (masteryRes.data as any[]) || [];
      const avg =
        m.length > 0
          ? Math.round(
              (m.reduce((s, r) => s + (Number(r.mastery_score) || 0), 0) / m.length) * 100,
            )
          : 0;
      setStats({
        xp: Number(c.total_xp) || 0,
        level: Number(c.level) || 1,
        streak: Number(c.current_streak) || 0,
        mastery: avg,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const xpAnim = useCountUp(stats.xp);
  const streakAnim = useCountUp(stats.streak);
  const coinsAnim = useCountUp(coins);
  const masteryAnim = useCountUp(stats.mastery);

  const xpToNext = stats.xp % XP_PER_LEVEL;
  const xpPct = Math.round((xpToNext / XP_PER_LEVEL) * 100);

  const chip = HUB_CHIP[hub];
  const accent = HUB_ACCENT[hub];
  const bar = HUB_BAR[hub];

  const cards: Array<{
    key: string;
    icon: typeof Zap;
    label: string;
    value: string;
    onClick: () => void;
    extra?: React.ReactNode;
    iconClass?: string;
  }> = [
    {
      key: 'xp',
      icon: Zap,
      label: 'XP',
      value: `${xpAnim.toLocaleString()} · L${stats.level}`,
      onClick: () => navigate('/achievements'),
      extra: (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className={cn('h-full rounded-full transition-[width] duration-700', bar)}
            style={{ width: `${xpPct}%` }}
          />
        </div>
      ),
    },
    {
      key: 'streak',
      icon: Flame,
      label: 'Streak',
      value: `${streakAnim} day${streakAnim === 1 ? '' : 's'}`,
      onClick: () => navigate('/quest-log'),
      iconClass: stats.streak > 0 ? 'animate-pulse text-orange-500' : '',
    },
    {
      key: 'coins',
      icon: Coins,
      label: 'Coins',
      value: coinsAnim.toLocaleString(),
      onClick: () => navigate('/vault'),
      iconClass: 'text-amber-500',
    },
    {
      key: 'mastery',
      icon: Target,
      label: 'Mastery',
      value: `${masteryAnim}%`,
      onClick: () => navigate('/mastery'),
      extra: <MasteryRing value={masteryAnim} className={accent} />,
    },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.key}
            type="button"
            onClick={c.onClick}
            aria-label={`Open ${c.label} details`}
            className={cn(
              'group relative flex items-center gap-2 rounded-2xl border px-3 py-2 min-w-[150px] flex-1 snap-start text-left',
              'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/40',
              chip,
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0 opacity-80', c.iconClass)} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">
                  {c.label}
                </span>
                <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-60 group-hover:translate-x-0" />
              </div>
              <div className="text-sm font-bold tabular-nums truncate">{c.value}</div>
              {c.extra}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const MasteryRing: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const r = 10;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" className={cn('mt-0.5', className)}>
      <circle cx="13" cy="13" r={r} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <circle
        cx="13"
        cy="13"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 13 13)"
        style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
      />
    </svg>
  );
};

export default ProgressStrip;
