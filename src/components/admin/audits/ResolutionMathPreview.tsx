import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';

interface Props {
  teacherId: string;
  durationMinutes: number;
  pct: number;
  refund: boolean;
}

/**
 * Reads teacher hourly rate and shows the exact € amount that will be paid
 * plus the credit delta. Pure preview — no mutations.
 */
export function ResolutionMathPreview({ teacherId, durationMinutes, pct, refund }: Props) {
  const [hourly, setHourly] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('teacher_profiles')
        .select('hourly_rate_eur')
        .eq('user_id', teacherId)
        .maybeSingle();
      if (!cancelled) setHourly(((data as any)?.hourly_rate_eur ?? 0) as number);
    })();
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  const hours = durationMinutes / 60;
  const pay = hourly != null ? +(hourly * hours * pct / 100).toFixed(2) : null;

  return (
    <Card className="bg-muted/40 p-3 space-y-1 font-mono text-xs">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Hourly rate</span>
        <span>{hourly != null ? `€${hourly.toFixed(2)}` : '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Duration</span>
        <span>{durationMinutes}m ({hours.toFixed(2)}h)</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Pay %</span>
        <span>{pct}%</span>
      </div>
      <div className="flex justify-between border-t border-border pt-1">
        <span className="text-foreground font-semibold">Teacher payout</span>
        <span className="font-semibold">{pay != null ? `€${pay.toFixed(2)}` : '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-foreground font-semibold">Student credit</span>
        <span className={refund ? 'text-success' : 'text-muted-foreground'}>
          {refund ? '+1 refunded' : 'consumed'}
        </span>
      </div>
    </Card>
  );
}
