import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Zap, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

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
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{t('pd.progress.empty')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('pd.progress.selectStudent')}</h3>
        <Select value={activeStudentId} onValueChange={onSelectStudent}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem key={student.student_id} value={student.student_id}>
                {student.student.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {isLoading ? (
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </Card>
      ) : (progressData as any)?.error ? (
        <Card className="p-8 text-center">
          <p className="text-destructive">{(progressData as any).error}</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('pd.progress.totalLessons')}</p>
                  <p className="text-2xl font-bold">{(progressData as any)?.total_lessons || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('pd.progress.upcoming')}</p>
                  <p className="text-2xl font-bold">{(progressData as any)?.upcoming_lessons || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('pd.progress.achievements')}</p>
                  <p className="text-2xl font-bold">{(progressData as any)?.achievements_count || 0}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('pd.progress.totalXp')}</p>
                  <p className="text-2xl font-bold">{(progressData as any)?.total_xp || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('pd.progress.learningProgress')}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{t('pd.progress.level')} {(progressData as any)?.current_level || 1}</span>
                  <span className="text-sm text-muted-foreground">
                    {(progressData as any)?.total_xp || 0} XP
                  </span>
                </div>
                <Progress value={(((progressData as any)?.total_xp || 0) % 500) / 5} />
              </div>

              {(progressData as any)?.cefr_level && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">{t('pd.progress.cefrLevel')}</p>
                  <p className="text-lg font-semibold">{(progressData as any).cefr_level}</p>
                </div>
              )}

              {(progressData as any)?.last_lesson_date && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">{t('pd.progress.lastLesson')}</p>
                  <p className="text-lg font-semibold">
                    {format(new Date((progressData as any).last_lesson_date), "PPP")}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
