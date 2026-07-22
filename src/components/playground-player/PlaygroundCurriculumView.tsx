import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PlaygroundLessonPlayer } from '@/components/playground-player/PlaygroundLessonPlayer';
import { buildPlaygroundUnit } from '@/playground-blueprint/lessonBuilder';
import { normalizePreA1LessonForCreator } from '@/pages/playground-creator/preA1LessonNormalizer';
import type {
  PlaygroundUnit,
  PlaygroundUnitContent,
} from '@/playground-blueprint/types';

/** Apply Pre-A1 Lesson 1 safety rules to any unit payload before it reaches the player. */
function applyPreA1Safety(payload: PlaygroundUnitContent, cefr: string | null): PlaygroundUnitContent {
  if (!payload?.lessons?.length) return payload;
  return {
    ...payload,
    lessons: payload.lessons.map((lesson) =>
      Number(lesson.lesson_number) === 1
        ? normalizePreA1LessonForCreator(lesson, cefr, payload.unit_topic ?? null)
        : lesson,
    ),
  } as PlaygroundUnitContent;
}

interface Props {
  lessonId: string;
  title: string | null;
  cefr: string | null;
  content: any;
  onExit?: () => void;
}

/**
 * Renders any Playground (kids) curriculum lesson through the locked
 * Animal Adventure Academy 7-lesson template. Content is sourced from
 * `content.playground_unit` when persisted, otherwise generated on
 * demand from the lesson title + CEFR via `generate-playground`.
 */
export function PlaygroundCurriculumView({ lessonId, title, cefr, content, onExit }: Props) {
  const [unit, setUnit] = useState<PlaygroundUnit | null>(null);
  const [status, setStatus] = useState('Loading Playground lesson…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const persisted = content?.playground_unit as PlaygroundUnitContent | undefined;
        if (persisted) {
          if (!cancelled) setUnit(buildPlaygroundUnit(applyPreA1Safety(persisted, cefr)));
          return;
        }
        const topic = title || 'Animal Friends';
        const level = cefr || 'Pre-A1';
        if (!cancelled) setStatus(`Generating "${topic}" (${level})…`);
        const bp = (content?.blueprint ?? content ?? {}) as any;
        const { data, error: fnErr } = await supabase.functions.invoke('generate-playground', {
          body: {
            topic,
            cefr: level,
            lesson_kind: 'discovery',
            lesson_id: lessonId,
            grammar_focus: bp.grammar_focus,
            vocab_focus: bp.vocabulary_focus ?? bp.vocab_focus,
            communication_goal: bp.communication_goal,
            review_targets: bp.review_targets,
          },
        });
        if (fnErr) throw new Error(fnErr.message);
        const payload = (data as any)?.lesson ?? (data as any);
        if (!payload?.lessons) throw new Error('Generator returned no unit');
        const safe = applyPreA1Safety(payload as PlaygroundUnitContent, level);
        const built = buildPlaygroundUnit(safe);
        if (!cancelled) setUnit(built);
        // Persist the safety-normalized payload so future loads stay compliant.
        supabase
          .from('curriculum_lessons')
          .update({ content: { ...(content || {}), playground_unit: safe } })
          .eq('id', lessonId)
          .then(() => {});
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [lessonId, title, cefr, content]);

  if (unit) return <PlaygroundLessonPlayer unit={unit} lessonNumber={1} onExit={onExit} />;
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

export default PlaygroundCurriculumView;
