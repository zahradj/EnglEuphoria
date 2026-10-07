import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Trophy, Zap, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ParentTeacherFeedbackCard } from "./ParentTeacherFeedbackCard";
import { LearningPlanCard } from "@/components/student/LearningPlanCard";

interface Student {
  student_id: string;
  student: {
    id: string;
    full_name: string;
  };
}

interface ParentStudentProgressProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string) => void;
}

export function ParentStudentProgress({
  students,
  selectedStudentId,
  onSelectStudent,
}: ParentStudentProgressProps) {
  const { t } = useTranslation();
  const activeStudentId = selectedStudentId || students[0]?.student_id;

  const { data: progressData, isLoading } = useQuery({
    // Same key + function as the dashboard's per-child snapshot, so this is usually already cached.
    queryKey: ["student-progress", activeStudentId],
    queryFn: async () => {
      if (!activeStudentId) return null;

      const { data, error } = await supabase.rpc(
        "get_student_progress_for_parent",
        {
          p_parent_id: (await supabase.auth.getUser()).data.user?.id,
          p_student_id: activeStudentId,
        }
      );

      if (error) throw error;
      return data;
    },
    enabled: !!activeStudentId,
  });

  if (students.length === 0) {
    return (
      <div className="fd-surface fd-empty">
        <p style={{ color: "var(--fd-ink-soft)" }}>{t('pd.progress.empty')}</p>
      </div>
    );
  }

  const p = progressData as any;
  const tiles = [
    { key: "lessons", icon: BookOpen, label: t('pd.progress.totalLessons'), value: p?.total_lessons || 0 },
    { key: "upcoming", icon: Calendar, label: t('pd.progress.upcoming'), value: p?.upcoming_lessons || 0 },
    { key: "achievements", icon: Trophy, label: t('pd.progress.achievements'), value: p?.achievements_count || 0 },
    { key: "xp", icon: Zap, label: t('pd.progress.totalXp'), value: p?.total_xp || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--fd-ink-soft)" }}>
          {t('pd.progress.selectStudent')}
        </h2>
        <div className="fd-chips">
          {students.map((s) => (
            <button
              key={s.student_id}
              type="button"
              className="fd-chip"
              aria-pressed={s.student_id === activeStudentId}
              onClick={() => onSelectStudent(s.student_id)}
            >
              <span className="fd-chip__face" aria-hidden>{s.student.full_name.slice(0, 1).toUpperCase()}</span>
              {s.student.full_name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="fd-tiles" aria-busy="true">
          {[0, 1, 2, 3].map((i) => <div key={i} className="fd-skel h-[110px] rounded-[22px]" />)}
        </div>
      ) : p?.error ? (
        <div className="fd-surface fd-empty">
          <p className="text-destructive">{p.error}</p>
        </div>
      ) : (
        <>
          <div className="fd-tiles">
            {tiles.map(({ key, icon: Icon, label, value }) => (
              <div key={key} className="fd-tile">
                <div className="fd-tile__label"><Icon className="h-4 w-4" aria-hidden /> {label}</div>
                <div className="fd-tile__value fd-num">{value}</div>
              </div>
            ))}
          </div>

          <section className="fd-surface p-5 md:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <TrendingUp className="h-5 w-5" aria-hidden />
              {t('pd.progress.learningProgress')}
            </h3>

            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-bold">{t('pd.progress.level')} <span className="fd-num">{p?.current_level || 1}</span></span>
              <span className="fd-num text-sm" style={{ color: "var(--fd-ink-soft)" }}>{p?.total_xp || 0} XP</span>
            </div>
            <div className="fd-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(((p?.total_xp || 0) % 500) / 5)}>
              <span style={{ width: `${Math.max(4, ((p?.total_xp || 0) % 500) / 5)}%` }} />
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {p?.cefr_level && (
                <div>
                  <dt className="text-xs font-bold" style={{ color: "var(--fd-ink-soft)" }}>{t('pd.progress.cefrLevel')}</dt>
                  <dd className="fd-num mt-1 text-2xl font-bold">{p.cefr_level}</dd>
                </div>
              )}
              {p?.last_lesson_date && (
                <div>
                  <dt className="text-xs font-bold" style={{ color: "var(--fd-ink-soft)" }}>{t('pd.progress.lastLesson')}</dt>
                  <dd className="mt-1 text-lg font-bold">{format(new Date(p.last_lesson_date), "PPP")}</dd>
                </div>
              )}
            </dl>
          </section>

          {activeStudentId && <LearningPlanCard studentId={activeStudentId} />}
          {activeStudentId && <ParentTeacherFeedbackCard studentId={activeStudentId} />}
        </>
      )}
    </div>
  );
}
