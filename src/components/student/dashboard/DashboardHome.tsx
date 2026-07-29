import React from 'react';
import { JoinLessonHero } from '@/components/student/JoinLessonHero';
import { ProgressStrip } from './ProgressStrip';
import { JumpBackInCard } from './JumpBackInCard';
import { HomeworkForestWidget } from '@/components/student/kids/HomeworkForestWidget';
import { RecentLessonReports } from '@/components/student/RecentLessonReports';
import { SkillsRadarChart } from '@/components/student/hub/SkillsRadarChart';
import { AcademyJourneyHub } from '@/components/student/hub/AcademyJourneyHub';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useStudentSkills } from '@/hooks/useStudentSkills';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type Hub = 'playground' | 'academy' | 'professional';

interface DashboardHomeProps {
  hub: Hub;
  studentName?: string;
}

/**
 * Shared above-the-fold for every hub dashboard. Only renders:
 *   1) Today's class CTA (next 1-on-1 booking)
 *   2) Compact progress strip (XP / Streak / Coins / Mastery)
 *   3) Single "Jump back in" lesson card
 *   4) Playground only: Homework Forest (pending quests)
 */
export const DashboardHome: React.FC<DashboardHomeProps> = ({ hub, studentName }) => {
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';
  const { overallCefr, percentToNext, loading: levelLoading } = useStudentSkills();

  // Hub-branded accent for the level pill.
  const pillAccent =
    hub === 'playground'
      ? { ring: 'border-orange-300/70 bg-orange-50 text-orange-900', dot: '#FE6A2F', dark: 'bg-orange-950/40 border-orange-800/40 text-orange-100' }
      : hub === 'academy'
        ? { ring: 'border-violet-300/70 bg-violet-50 text-violet-900', dot: '#6B21A8', dark: 'bg-violet-950/40 border-violet-800/40 text-violet-100' }
        : { ring: 'border-emerald-300/70 bg-emerald-50 text-emerald-900', dot: '#047857', dark: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-100' };

  return (
    <div className="space-y-5 animate-fade-in">
      {(studentName || (!levelLoading && overallCefr)) && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          {studentName && (
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Welcome back, {studentName.split(' ')[0]}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pick up where you left off, or jump into today's class.
              </p>
            </div>
          )}

          {!levelLoading && overallCefr && (
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium shrink-0',
                isDark ? pillAccent.dark : pillAccent.ring
              )}
              title="Your current CEFR level, synced from your placement test and lesson mastery."
            >
              <TrendingUp className="w-3.5 h-3.5" style={{ color: pillAccent.dot }} />
              <span>Your Level</span>
              <span className="font-bold" style={{ color: pillAccent.dot }}>{overallCefr}</span>
              <span className="opacity-70">· {percentToNext}% to next</span>
            </div>
          )}
        </div>
      )}

      <JoinLessonHero hubId={hub} isDark={isDark} />

      <ProgressStrip hub={hub} />

      <JumpBackInCard hub={hub} />

      {hub === 'professional' && <SkillsRadarChart isDarkMode={isDark} />}

      {hub === 'academy' && <AcademyJourneyHub isDarkMode={isDark} />}

      {/* Homework surface — Playground shows the forest, Academy mirrors it
          (the gate that locks the next lesson behind ≥80% homework score is
          enforced inside the homework attempt flow, not the dashboard). */}
      {(hub === 'playground' || hub === 'academy') && (
        <HomeworkForestWidget isDark={isDark} />
      )}

      {/* Teacher's session reports — progress verification the student can
          actually see, right where they already look for "what's next". */}
      <RecentLessonReports hubId={hub} limit={3} />
    </div>
  );
};

export default DashboardHome;
