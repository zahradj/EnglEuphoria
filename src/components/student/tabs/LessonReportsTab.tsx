import { ClipboardCheck } from 'lucide-react';
import { RecentLessonReports } from '@/components/student/RecentLessonReports';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { cn } from '@/lib/utils';

const HUB_ACCENT: Record<string, string> = {
  playground: 'text-orange-600',
  academy: 'text-purple-600',
  professional: 'text-emerald-600',
};

/**
 * "Lesson Reports" sidebar tab: the teacher's feedback for recent classes.
 * (This used to sit on the dashboard home page, which made the first page long.)
 */
export function LessonReportsTab() {
  const { studentLevel } = useStudentLevel();
  const hubId = studentLevel === 'academy' || studentLevel === 'professional' ? studentLevel : 'playground';
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className={cn('text-3xl font-bold flex items-center gap-2', HUB_ACCENT[hubId])}>
          <ClipboardCheck className="w-7 h-7" />
          Lesson Reports
        </h1>
        <p className="text-muted-foreground mt-1">What your teacher wrote about your recent classes.</p>
      </div>
      <RecentLessonReports hubId={hubId} limit={20} />
    </div>
  );
}

export default LessonReportsTab;
