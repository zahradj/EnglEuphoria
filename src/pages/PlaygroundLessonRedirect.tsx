import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PlaygroundLessonPlayer } from '@/components/playground-player/PlaygroundLessonPlayer';
import { buildPlaygroundUnit } from '@/playground-blueprint/lessonBuilder';
import type {
  PlaygroundUnit,
  PlaygroundUnitContent,
} from '@/playground-blueprint/types';

/**
 * /playground-demo renders the Animal Adventure Academy 7-lesson template
 * filled with content from the FIRST Playground curriculum lesson row.
 *
 * Source of truth for content:
 *   1. curriculum_lessons.content.playground_unit (already a PlaygroundUnitContent)
 *   2. otherwise call `generate-playground` with the lesson's topic + CEFR
 *
 * Activity structure is locked (PHASE_REGISTRY) — only content changes
 * with topic/level, exactly like the uploaded AAA reference unit.
 */
export default function PlaygroundLessonRedirect() {
  const [unit, setUnit] = useState<PlaygroundUnit | null>(null);
  const [status, setStatus] = useState<string>('Loading Playground lesson…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: lesson, error: lessonErr } = await supabase
          .from('curriculum_lessons')
          .select('id, title, slot_cefr_level, difficulty_level, content')
          .eq('target_system', 'kids')
          .order('sequence_order', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (lessonErr) throw new Error(lessonErr.message);
        if (!lesson) {
          throw new Error(
            'No Playground curriculum lesson found yet. Create one from the curriculum creator first.',
          );
        }

        const persisted = (lesson.content as any)?.playground_unit as
          | PlaygroundUnitContent
          | undefined;
        if (persisted) {
          if (!cancelled) setUnit(buildPlaygroundUnit(persisted));
          return;
        }

        const topic = lesson.title || 'Animal Friends';
        const cefr = lesson.slot_cefr_level || lesson.difficulty_level || 'Pre-A1';
        if (!cancelled) setStatus(`Generating "${topic}" (${cefr})…`);

        const { data, error: fnErr } = await supabase.functions.invoke(
          'generate-playground',
          { body: { topic, cefr, lesson_kind: 'discovery', lesson_id: lesson.id } },
        );
        if (fnErr) throw new Error(fnErr.message);
        const payload = (data as any)?.lesson ?? (data as any);
        if (!payload?.lessons) throw new Error('Generator returned no unit');
        if (!cancelled) setUnit(buildPlaygroundUnit(payload as PlaygroundUnitContent));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (unit) return <PlaygroundLessonPlayer unit={unit} lessonNumber={1} />;

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-700 px-6">
      {error ? (
        <p className="text-sm text-red-600 max-w-md text-center">{error}</p>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> {status}
        </div>
      )}
    </div>
  );
}
