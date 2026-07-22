import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PlaygroundCurriculumView } from '@/components/playground-player/PlaygroundCurriculumView';

/**
 * Public shareable lesson player.
 * URL: /play/:lessonId — anyone with the link can view the lesson.
 * Requires curriculum_lessons row to be readable (published) by anon/authenticated.
 */
export default function PlaygroundLessonShare() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!lessonId) return;
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('id, title, slot_cefr_level, difficulty_level, content')
        .eq('id', lessonId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setError('This lesson link is invalid or not publicly available.');
        return;
      }
      setLesson(data);
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <p className="text-muted-foreground max-w-md">{error}</p>
      </div>
    );
  }
  if (!lesson) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading lesson…
        </div>
      </div>
    );
  }

  return (
    <PlaygroundCurriculumView
      lessonId={lesson.id}
      title={lesson.title}
      cefr={lesson.slot_cefr_level || lesson.difficulty_level || 'Pre-A1'}
      content={lesson.content}
    />
  );
}
