import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Clock, CheckCircle2, Wallet, BookOpen } from 'lucide-react';

interface TeacherEarningsProps {
  teacherId: string;
}

interface EarningRow {
  id: string;
  amount: number | null;
  teacher_amount: number | null;
  status: string;
  created_at: string;
  booking_id: string | null;
}

export const TeacherEarnings: React.FC<TeacherEarningsProps> = ({ teacherId }) => {
  const [rows, setRows] = useState<EarningRow[]>([]);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      const [{ data: earnings }, { data: profile }] = await Promise.all([
        supabase
          .from('teacher_earnings')
          .select('id, amount, teacher_amount, status, created_at, booking_id')
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('teacher_profiles')
          .select('per_class_rate, hourly_rate_eur')
          .eq('user_id', teacherId)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      setRows((earnings as EarningRow[] | null) ?? []);
      setHourlyRate(Number((profile as any)?.per_class_rate ?? (profile as any)?.hourly_rate_eur ?? 0));
      setLoading(false);
    })();

    // Realtime: live updates as the cron promotes pending → payable
    const channel = supabase
      .channel(`teacher-earnings:${teacherId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teacher_earnings', filter: `teacher_id=eq.${teacherId}` },
        () => {
          // simplest: refetch
          supabase
            .from('teacher_earnings')
            .select('id, amount, teacher_amount, status, created_at, booking_id')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false })
            .limit(200)
            .then(({ data }) => setRows((data as EarningRow[] | null) ?? []));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [teacherId]);

  const sumOf = (status: string) =>
    rows
      .filter(r => r.status === status)
      .reduce((s, r) => s + Number(r.amount ?? r.teacher_amount ?? 0), 0);

  const pending = sumOf('pending_clearance');
  const payable = sumOf('payable');
  const paid = sumOf('paid');

  // This week lesson count from earnings rows
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekLessons = rows.filter(r => new Date(r.created_at) >= weekStart).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#6B21A8] tracking-tight">My Earnings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earnings appear automatically when each lesson finishes. After a 24-hour clearance window they move to <span className="font-medium text-emerald-700">Available for Payout</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Clearance — greyed out */}
        <Card className="border-l-4 border-l-muted-foreground/40 bg-muted/30">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-muted-foreground/10 rounded-xl">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending Clearance</p>
                <p className="text-2xl font-bold text-muted-foreground">€{pending.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">clears in 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available for Payout — green hero */}
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/15 rounded-xl">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-700/80 uppercase tracking-wider font-medium">Available for Payout</p>
                <p className="text-2xl font-bold text-emerald-700">€{payable.toFixed(2)}</p>
                <p className="text-xs text-emerald-700/70">ready to withdraw</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#6B21A8]">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#6B21A8]/10 rounded-xl">
                <BookOpen className="h-5 w-5 text-[#6B21A8]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">This Week</p>
                <p className="text-2xl font-bold text-[#6B21A8]">{weekLessons}</p>
                <p className="text-xs text-muted-foreground">lessons taught</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Per-Class Rate</p>
                <p className="text-2xl font-bold text-amber-600">€{hourlyRate}</p>
                <p className="text-xs text-muted-foreground">credited per lesson</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent ledger */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-[#6B21A8]">Recent earnings</CardTitle>
          <span className="text-xs text-muted-foreground">
            Total paid out: <span className="font-semibold text-foreground">€{paid.toFixed(2)}</span>
          </span>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No earnings yet. Once you complete your first lesson, it will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.slice(0, 15).map(r => {
                const amt = Number(r.amount ?? r.teacher_amount ?? 0);
                const badge =
                  r.status === 'pending_clearance' ? (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" /> Pending clearance
                    </Badge>
                  ) : r.status === 'payable' ? (
                    <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> Available
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Wallet className="h-3 w-3" /> Paid
                    </Badge>
                  );
                return (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">€{amt.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                    {badge}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
