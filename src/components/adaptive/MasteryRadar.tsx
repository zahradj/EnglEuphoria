import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SkillMasteryRecord } from '@/adaptive/types';

interface Props {
  mastery: SkillMasteryRecord[];
}

const DOMAIN_LABEL: Record<string, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  pronunciation: 'Pronunciation',
  reading: 'Reading',
  listening: 'Listening',
  speaking: 'Speaking',
  fluency: 'Fluency',
  communication_goal: 'Communication',
};

export default function MasteryRadar({ mastery }: Props) {
  const byDomain = new Map<string, { sum: number; count: number }>();
  for (const m of mastery) {
    const e = byDomain.get(m.skill_domain) ?? { sum: 0, count: 0 };
    e.sum += m.mastery;
    e.count += 1;
    byDomain.set(m.skill_domain, e);
  }

  const rows = Array.from(byDomain.entries()).map(([k, v]) => ({
    domain: k,
    avg: Math.round(v.sum / v.count),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mastery by Skill</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No mastery data yet.</p>
        )}
        {rows.map((r) => (
          <div key={r.domain} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{DOMAIN_LABEL[r.domain] ?? r.domain}</span>
              <span className="font-medium">{r.avg}%</span>
            </div>
            <Progress value={r.avg} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
