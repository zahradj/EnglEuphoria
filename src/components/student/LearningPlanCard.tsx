import React, { useEffect, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { readLearningPlan, type LearningPlan } from '@/lib/learningPlan';

interface Props {
  /** The learner whose plan to show; defaults to the signed-in student. */
  studentId?: string;
  /** Where the "get lessons" button goes; no button when omitted. */
  ctaHref?: string;
}

/**
 * The learning plan the teacher sent after the free trial lesson (saved in the trial report's
 * feedback_content.trial.plan). Shows nothing until a trial report with a plan exists.
 */
export const LearningPlanCard: React.FC<Props> = ({ studentId, ctaHref }) => {
  const { user } = useAuth();
  const id = studentId ?? user?.id;
  const [plan, setPlan] = useState<LearningPlan | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('lesson_feedback_submissions')
          .select('feedback_content, submitted_at')
          .eq('student_id', id)
          .order('submitted_at', { ascending: false })
          .limit(10);
        for (const row of data ?? []) {
          let content: any = row.feedback_content;
          if (typeof content === 'string') { try { content = JSON.parse(content); } catch { content = null; } }
          const found = readLearningPlan(content?.trial?.plan);
          if (found) { if (!cancelled) setPlan(found); return; }
        }
        if (!cancelled) setPlan(null);
      } catch {
        if (!cancelled) setPlan(null);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (!plan) return null;

  return (
    <Card className="border-2 border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapIcon className="h-5 w-5 text-primary" />
          Your learning plan · {plan.level}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ol className="space-y-1.5 text-sm">
          {plan.weeks.map((w) => (
            <li key={w.week} className="flex gap-3">
              <span className="w-16 shrink-0 font-semibold text-muted-foreground">Week {w.week}</span>
              <span>{w.title}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">
          {plan.unitsAfter > 0 ? `Then the rest of ${plan.level}. ` : ''}
          About {plan.totalWeeks} weeks in total at {plan.lessonsPerWeek} lesson{plan.lessonsPerWeek === 1 ? '' : 's'} a week.
        </p>
        {ctaHref && (
          <Button asChild>
            <Link to={ctaHref}>Get lessons to start the plan</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningPlanCard;
