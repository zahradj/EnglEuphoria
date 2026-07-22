import { useStudentLevel } from '@/hooks/useStudentLevel';
import { Route } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LearningPathTab } from '@/components/student/LearningPathTab';
import ExtraPracticeCard from '@/components/student/ExtraPracticeCard';
import AutoAssignedQueue from '@/components/student/AutoAssignedQueue';
import PlacementSummaryCard from '@/components/student/path/PlacementSummaryCard';

const HUB_ACCENT: Record<string, string> = {
  playground: 'text-orange-600',
  academy: 'text-indigo-600',
  professional: 'text-emerald-600',
};

export function MyPathTab() {
  const { studentLevel } = useStudentLevel();
  const accent = HUB_ACCENT[studentLevel || 'playground'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={cn('text-3xl font-bold flex items-center gap-2', accent)}>
          <Route className="w-7 h-7" />
          My Learning Path
        </h1>
        <p className="text-muted-foreground mt-1">
          Your placement result is your starting point. Continue right where you left off.
        </p>
      </div>
      <PlacementSummaryCard hub={studentLevel || 'academy'} />
      <ExtraPracticeCard />
      <AutoAssignedQueue />
      <LearningPathTab />
    </div>
  );
}
