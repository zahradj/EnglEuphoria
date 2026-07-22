import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { QAReport } from '@/qa/types';

interface Props {
  report: QAReport;
}

export default function SafetyAlertBanner({ report }: Props) {
  const safetyBlocks = report.issues.filter(
    (i) => i.domain === 'safety' && i.severity === 'block',
  );
  if (safetyBlocks.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Emotional safety violation — publication blocked</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {safetyBlocks.map((i, idx) => (
            <li key={idx}>{i.message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
