import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useStudentHubTheme } from '@/hooks/useStudentHubTheme';
import { PlayCircle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { HubBackButton } from '@/components/student/common/HubBackButton';

const HUB_LABEL: Record<string, string> = {
  playground: 'Playground Hub',
  academy: 'Academy Hub',
  professional: 'Success Hub',
};

export function MyLessonsTab() {
  const { studentLevel } = useStudentLevel();
  const theme = useStudentHubTheme();
  const hubLabel = HUB_LABEL[studentLevel || 'playground'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <HubBackButton label="Back to dashboard" />
      </div>
      <div>
        <h1 className={cn('text-3xl font-bold flex items-center gap-2', theme.accentText)}>
          <PlayCircle className="w-7 h-7" />
          My Lessons
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse your unlocked lessons and continue where you left off.
        </p>

        {/* Hub + level filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filtered
          </span>
          <Badge
            variant="outline"
            className={cn('text-xs border', theme.chipBg, theme.chipText, theme.panelBorder)}
          >
            {hubLabel}
          </Badge>
        </div>
      </div>
      <div
        className={cn(
          'rounded-2xl border bg-card/40 backdrop-blur-xl p-8 text-center text-muted-foreground',
          theme.panelBorder,
        )}
      >
        Your lesson library is loading. Lessons unlock as you progress along your learning path.
      </div>
    </div>
  );
}
