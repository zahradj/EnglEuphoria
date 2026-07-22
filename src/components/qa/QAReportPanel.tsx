import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { QADomain, QAReport } from '@/qa/types';
import QABadge from './QABadge';
import SafetyAlertBanner from './SafetyAlertBanner';

interface Props {
  report: QAReport;
}

const DOMAIN_LABEL: Record<QADomain, string> = {
  academic: 'Academic',
  cefr: 'CEFR',
  age: 'Age',
  safety: 'Safety',
  language: 'Language',
  activity: 'Activity',
  narrative: 'Narrative',
  structural: 'Structural',
  hallucination: 'Hallucination',
  duplicate: 'Duplicate',
};

export default function QAReportPanel({ report }: Props) {
  const domains = Object.entries(report.scorecard) as [QADomain, { score: number; passing: boolean }][];

  return (
    <div className="space-y-4">
      <SafetyAlertBanner report={report} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quality Control Report</CardTitle>
          <QABadge verdict={report.verdict} />
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {domains.map(([d, s]) => (
              <div key={d} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>{DOMAIN_LABEL[d]}</span>
                  <Badge variant={s.passing ? 'outline' : 'destructive'}>{s.score}</Badge>
                </div>
                <Progress value={s.score} />
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 font-medium">Issues ({report.issues.length})</p>
            {report.issues.length === 0 ? (
              <p className="text-muted-foreground">No issues found.</p>
            ) : (
              <ul className="space-y-2">
                {report.issues.map((i, idx) => (
                  <li key={idx} className="rounded-md border bg-muted/30 p-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          i.severity === 'block'
                            ? 'destructive'
                            : i.severity === 'warn'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {i.severity}
                      </Badge>
                      <span className="font-mono text-xs">{i.code}</span>
                      <span className="text-xs text-muted-foreground">{DOMAIN_LABEL[i.domain]}</span>
                    </div>
                    <p className="mt-1">{i.message}</p>
                    {i.suggestion && (
                      <p className="mt-1 text-xs text-muted-foreground">→ {i.suggestion}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
