import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface EarningsState {
  total: number;
  thisMonth: number;
  thisWeek: number;
  lessonCount: number;
  rate: number;
}

/**
 * Teacher earnings overview — totals across all completed lessons,
 * with month and week breakdowns. Uses teacher_profiles.hourly_rate
 * as the per-lesson rate fallback when lessons.teacher_rate is null.
 */
export const EarningsCard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EarningsState>({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
    lessonCount: 0,
    rate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      // Fetch teacher rate
      const { data: profile } = await supabase
        .from('teacher_profiles')
        .select('hourly_rate')
        .eq('user_id', user.id)
        .maybeSingle();

      const fallbackRate = profile?.hourly_rate ?? 20;

      // Fetch completed lessons
      const { data: lessons } = await supabase
        .from('lessons')
        .select('teacher_rate, completed_at, scheduled_at, status')
        .eq('teacher_id', user.id)
        .eq('status', 'completed');

      if (cancelled) return;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      let total = 0;
      let thisMonth = 0;
      let thisWeek = 0;

      (lessons || []).forEach((l: any) => {
        const amount = Number(l.teacher_rate) || fallbackRate;
        total += amount;
        const when = l.completed_at ? new Date(l.completed_at) : l.scheduled_at ? new Date(l.scheduled_at) : null;
        if (when && when >= monthStart) thisMonth += amount;
        if (when && when >= weekStart) thisWeek += amount;
      });

      setData({
        total,
        thisMonth,
        thisWeek,
        lessonCount: lessons?.length ?? 0,
        rate: fallbackRate,
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          Earnings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20 p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total earned</p>
          <p className="text-4xl font-bold text-foreground mt-1">
            {loading ? '—' : fmt(data.total)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            From {data.lessonCount} completed {data.lessonCount === 1 ? 'lesson' : 'lessons'} · {fmt(data.rate)}/lesson
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">This month</p>
              <p className="text-lg font-bold text-foreground">{loading ? '—' : fmt(data.thisMonth)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">This week</p>
              <p className="text-lg font-bold text-foreground">{loading ? '—' : fmt(data.thisWeek)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
