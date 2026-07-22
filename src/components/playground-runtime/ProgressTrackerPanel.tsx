import { Progress } from '@/components/ui/progress';

interface Props {
  current: number; // 0-based
  total: number;
  title: string;
}

export function ProgressTrackerPanel({ current, total, title }: Props) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round(((current + 1) / total) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">{title}</span>
        <span className="text-muted-foreground">
          Scene {Math.min(current + 1, total)} / {total}
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
