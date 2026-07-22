import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * /success-demo now routes into the real Lesson Player.
 * Picks the first published Success (adult) curriculum lesson and
 * redirects to /lesson/:id where the canonical player renders the
 * actual generated curriculum content.
 */
export default function SuccessLessonRedirect() {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id')
        .eq('target_system', 'adult')
        .eq('is_published', true)
        .order('sequence_order', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) { setError(error.message); return; }
      if (!data) { setError('No published Success lesson found yet. Generate one from the curriculum creator first.'); return; }
      setLessonId(data.id);
    })();
  }, []);

  if (lessonId) return <Navigate to={`/lesson/${lessonId}`} replace />;
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-700 px-6">
      {error ? <p className="text-sm text-red-600 max-w-md text-center">{error}</p> : (
        <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading Success lesson…</div>
      )}
    </div>
  );
}
