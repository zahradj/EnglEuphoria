import { useCEFRProgress } from '@/hooks/useCEFRProgress';
import { useHubTheme } from '@/components/dashboard/DashboardShell';
import { GraduationCap } from 'lucide-react';

export function CEFRBar() {
  const { data, isLoading } = useCEFRProgress();
  const { accent, solid } = useHubTheme();

  if (isLoading || !data) {
    return <div className="h-12 animate-pulse rounded-xl bg-muted/40" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <GraduationCap className={`h-4 w-4 ${accent}`} />
        <span className="font-medium">
          {data.level} <span className="text-muted-foreground">→</span> {data.nextLevel}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {data.percentToNext}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${solid} transition-all duration-700`}
          style={{ width: `${data.percentToNext}%` }}
        />
      </div>
    </div>
  );
}
