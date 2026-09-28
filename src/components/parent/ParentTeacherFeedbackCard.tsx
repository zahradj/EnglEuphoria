import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Star, MessageSquareText, Sparkles, ClipboardCheck } from 'lucide-react';
import { HUB_SKILL_PROFILE, normalizeSkillHub } from '@/hooks/useStudentSkills';

interface Props {
  studentId: string;
}

interface FeedbackContent {
  areas_for_improvement?: string[];
  quick_notes?: string;
  skill_scores?: Record<string, number>;
}

/**
 * Read-only card showing the most recent teacher feedback report for a
 * parent's child — rating, notes, focus areas, and per-skill scores.
 * Parents previously had no visibility into this at all: their dashboard
 * only ever showed XP/level counters, never what the teacher actually
 * wrote after class. Skill labels are hub-aware (HUB_SKILL_PROFILE), same
 * source of truth as the teacher's own wrap-up form and the student's
 * Skill Radar, so a Playground parent never sees "Business Writing".
 */
export function ParentTeacherFeedbackCard({ studentId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['parent-teacher-feedback', studentId],
    queryFn: async () => {
      const { data: fb } = await supabase
        .from('lesson_feedback_submissions')
        .select('id, teacher_id, submitted_at, feedback_content, student_performance_rating, lesson_id')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!fb) return null;

      const [{ data: teacher }, { data: booking }] = await Promise.all([
        supabase.from('users').select('full_name').eq('id', fb.teacher_id).maybeSingle(),
        fb.lesson_id
          ? supabase.from('class_bookings').select('hub_type').eq('id', fb.lesson_id).maybeSingle()
          : Promise.resolve({ data: null as { hub_type: string } | null }),
      ]);

      let content: FeedbackContent = {};
      try {
        content = typeof fb.feedback_content === 'string'
          ? JSON.parse(fb.feedback_content)
          : (fb.feedback_content as FeedbackContent) ?? {};
      } catch {
        content = {};
      }

      return {
        submittedAt: fb.submitted_at as string,
        rating: (fb.student_performance_rating as number) ?? 0,
        content,
        teacherName: teacher?.full_name || 'Teacher',
        hubType: booking?.hub_type ?? null,
      };
    },
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-3/4" />
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-5 text-center">
        <ClipboardCheck className="h-7 w-7 mx-auto text-muted-foreground/60 mb-2" />
        <p className="text-sm text-muted-foreground">
          No teacher feedback yet — it appears here after the first completed lesson.
        </p>
      </Card>
    );
  }

  const skillLabels = HUB_SKILL_PROFILE[normalizeSkillHub(data.hubType)].labels;
  const areas = data.content.areas_for_improvement ?? [];
  const notes = data.content.quick_notes ?? '';
  const skillScores = data.content.skill_scores ?? {};

  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-90">
          <Sparkles className="h-3.5 w-3.5" />
          Latest Teacher Feedback
        </div>
        <p className="text-sm font-semibold mt-1">
          {data.teacherName} · {format(new Date(data.submittedAt), 'MMM d, yyyy')}
        </p>
      </div>

      <div className="p-5 space-y-4">
        {data.rating > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Performance</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${s <= data.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/25'}`}
                />
              ))}
            </div>
          </div>
        )}

        {notes && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <MessageSquareText className="h-3.5 w-3.5" /> Teacher's Notes
            </p>
            <p className="text-sm p-3 rounded-lg bg-muted/50 border border-border/50 whitespace-pre-wrap leading-relaxed">
              {notes}
            </p>
          </div>
        )}

        {areas.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Focus Areas</p>
            <div className="flex flex-wrap gap-1.5">
              {areas.map((area) => (
                <span
                  key={area}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {Object.keys(skillScores).length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Skill Scores</p>
            <div className="space-y-2.5">
              {Object.entries(skillScores).map(([key, score]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{skillLabels[key] || key}</span>
                    <span className="font-mono font-semibold text-indigo-600">{Number(score).toFixed(1)}/10</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{ width: `${Math.min(100, Number(score) * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
