/**
 * Public Unit Progress Report — accessible via /reports/:token.
 *
 * Anon-readable single row lookup by share_token (RLS grants SELECT to anon
 * on rows with a non-null token). Parents/teachers can open without login.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnitProgressReport } from '@/components/student/UnitProgressReport';
import type { UnitReport } from '@/lib/unitProgressReport';

export default function UnitProgressReportPublic() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<UnitReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      const { data, error } = await supabase
        .from('unit_progress_reports')
        .select('*')
        .eq('share_token', token)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setError('This report link is invalid or has expired.');
        return;
      }
      setReport({
        unitId: data.unit_id,
        unitTitle: data.unit_title ?? undefined,
        hub: data.hub as UnitReport['hub'],
        cefr: data.cefr as UnitReport['cefr'],
        studentName: data.student_name ?? undefined,
        quizAccuracy: data.quiz_accuracy ?? undefined,
        lessonsCompleted: data.lessons_completed ?? undefined,
        lessonsTotal: data.lessons_total ?? undefined,
        accuracy: Number(data.accuracy),
        totalAttempts: data.total_attempts,
        totalCorrect: data.total_correct,
        totalDurationMs: Number(data.total_duration_ms),
        masteredWords: data.mastered_words ?? [],
        weakWords: data.weak_words ?? [],
        stars: data.stars as 1 | 2 | 3,
        generatedAt: data.created_at,
        engineRuns: (data.engine_runs as UnitReport['engineRuns']) ?? [],
        engineAccuracy: Number(data.engine_accuracy ?? 0),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }
  if (!report) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <p className="text-muted-foreground">Loading report…</p>
      </div>
    );
  }
  return <UnitProgressReport report={report} onClose={() => window.close()} />;
}
