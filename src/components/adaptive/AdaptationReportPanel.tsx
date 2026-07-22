import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AdaptationContext, AdaptationValidationReport } from '@/adaptive/types';

interface Props {
  context: AdaptationContext;
  validation?: AdaptationValidationReport;
}

export default function AdaptationReportPanel({ context, validation }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adaptation Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Difficulty tier" value={String(context.difficulty.challenge_tier)} />
          <Stat label="Scaffolding" value={context.difficulty.scaffolding_level} />
          <Stat label="Reading" value={context.difficulty.reading_complexity} />
          <Stat label="Speaking tier" value={context.speaking.tier} />
          <Stat label="Confidence" value={`${context.engagement.confidence}%`} />
          <Stat label="Frustration risk" value={`${context.engagement.frustration_risk}%`} />
        </div>

        <div>
          <p className="mb-1 font-medium">Why this lesson was adapted</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {context.adjustments.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>

        {context.review_queue.length > 0 && (
          <div>
            <p className="mb-1 font-medium">Spiral review injected</p>
            <div className="flex flex-wrap gap-1">
              {context.review_queue.slice(0, 10).map((i) => (
                <Badge key={`${i.item_type}-${i.item_key}`} variant="outline">
                  {i.item_type}:{i.item_key}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {validation && (
          <div>
            <p className="mb-1 font-medium">
              Validation: {validation.ok ? '✅ Passing' : '❌ Blocked'}
            </p>
            {validation.issues.length > 0 && (
              <ul className="list-disc space-y-1 pl-5">
                {validation.issues.map((i, idx) => (
                  <li
                    key={idx}
                    className={i.severity === 'error' ? 'text-destructive' : 'text-yellow-600'}
                  >
                    [{i.severity}] {i.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
