// Daily Warm-Up — dashboard card showing FSRS items due today.
// Auto-dismisses when count = 0. Hub-themed via semantic tokens.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  studentId: string;
  hub?: 'playground' | 'academy' | 'success';
}

export function DailyWarmupCard({ studentId, hub }: Props) {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const practicePath =
    hub === 'playground'
      ? '/playground/practice'
      : hub === 'academy'
        ? '/academy/practice'
        : hub === 'success'
          ? '/hub/practice'
          : '/practice';

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { count, error } = await supabase
        .from('memory_items')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .lte('next_due_at', new Date().toISOString());
      if (mounted && !error) setDueCount(count ?? 0);
    })();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  if (dueCount === null || dueCount === 0) return null;

  return (
    <Card className="p-4 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Daily Warm-Up</p>
            <p className="text-xs text-muted-foreground">
              {dueCount} {dueCount === 1 ? 'card' : 'cards'} ready to review
            </p>
          </div>
        </div>
        <Button asChild size="sm">
          <Link to={practicePath} aria-label="Start daily warm-up">
            Start <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
