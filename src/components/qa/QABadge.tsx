import { Badge } from '@/components/ui/badge';
import type { QAVerdict } from '@/qa/types';

interface Props {
  verdict: QAVerdict | null | undefined;
}

const LABEL: Record<QAVerdict, string> = {
  publish: 'Ready to publish',
  repair: 'Needs repair',
  block: 'Blocked',
};

export default function QABadge({ verdict }: Props) {
  if (!verdict) {
    return <Badge variant="outline">QA pending</Badge>;
  }
  const variant =
    verdict === 'publish' ? 'default' : verdict === 'repair' ? 'secondary' : 'destructive';
  return <Badge variant={variant as never}>{LABEL[verdict]}</Badge>;
}
