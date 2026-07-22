/**
 * TeacherVocabInsightCard — surfaces the nightly Vocab Arc rollup
 * ("Students recalled 82% of vocab in the last 7 days") in the teacher
 * dashboard. Drop-in card; safe to render even before the rollup runs.
 *
 * Uses `getTeacherVocabInsight` which reads pre-aggregated `beta_insights`
 * first and falls back to raw events.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { getTeacherVocabInsight, type TeacherVocabInsight } from '@/lib/teacherVocabInsight';
import type { Hub } from '@/governance/types';

interface Props {
  hub: Hub;
}

export function TeacherVocabInsightCard({ hub }: Props) {
  const [data, setData] = useState<TeacherVocabInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTeacherVocabInsight(hub)
      .then((d) => { if (!cancelled) setData(d); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [hub]);

  if (loading || !data) return null;

  const pct = Math.round(data.medianAccuracy * 100);
  const tone = pct >= 80 ? 'default' : pct >= 60 ? 'secondary' : 'destructive';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Vocab Recall (last {data.windowDays}d)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-semibold">{pct}%</div>
          <Badge variant={tone as any}>median</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Students recalled {pct}% of target vocabulary across{' '}
          {data.sampleSize} completed reinforcement arcs.
          {data.source === 'raw' && ' (live)'}
        </p>
      </CardContent>
    </Card>
  );
}
