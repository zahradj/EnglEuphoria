import React from 'react';
import DashboardHome from '../dashboard/DashboardHome';
import { KidsWorldMap } from '@/components/student/kids/KidsWorldMap';
import { usePlaygroundLessons } from '@/hooks/usePlaygroundLessons';
import { useStudentLanguageSync } from '@/hooks/useStudentLanguageSync';


interface PlaygroundDashboardProps {
  studentName?: string;
}

/**
 * Playground (Kids) dashboard.
 *
 * Top: shared above-the-fold (Today's class + progress strip + jump-back-in +
 *      Homework Forest widget).
 * Below: the animated Kids World Map — the jungle-themed game-world with the
 *      winding path of lesson nodes. This IS the "animated forest" experience.
 */
export const PlaygroundDashboard: React.FC<PlaygroundDashboardProps> = ({
  studentName = 'Explorer',
}) => {
  useStudentLanguageSync();
  const { lessons, loading, markLessonComplete, getTotalStars } = usePlaygroundLessons();

  return (
    <div className="space-y-6">
      <DashboardHome hub="playground" studentName={studentName} />





      <section
        aria-label="Adventure World"
        className="relative w-full overflow-hidden rounded-3xl border border-emerald-200/60 dark:border-emerald-800/40 shadow-lg"
        style={{ height: 'min(70vh, 640px)' }}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-200 to-emerald-100 dark:from-slate-800 dark:to-emerald-950">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              Growing the forest…
            </div>
          </div>
        ) : (
          <KidsWorldMap
            theme="jungle"
            totalStars={getTotalStars()}
            studentName={studentName}
            lessons={lessons}
            onLessonComplete={(id, score) => markLessonComplete(id, score)}
          />
        )}
      </section>
    </div>
  );
};

export default PlaygroundDashboard;
