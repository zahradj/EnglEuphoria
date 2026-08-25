/**
 * Top-level player for the unified pilot lesson engine (Phase 1).
 * Loads a UnifiedLesson from the pilot registry, steps through its
 * moments, and renders each one via PresentationSection or ActivitySection
 * depending on `moment.mode`.
 *
 * No top chrome bar (avatar/character badge/progress rail) — each moment
 * is a full-bleed "page" navigated with the Back/Next controls the section
 * components render below their own content, per moment count in `pageLabel`.
 */
import { useEffect, useState } from 'react';
import { loadUnifiedLesson } from '@/unified-lessons/registry';
import type { UnifiedLesson, Hub } from '@/unified-lessons/types';
import { markLessonCompleted } from '@/unified-lessons/completionTracking';
import { HubThemeProvider, useHubTheme } from './HubTheme';
import { PresentationSection } from './PresentationSection';
import { ActivitySection } from './ActivitySection';

function UnifiedLessonPlayerInner({ lesson }: { lesson: UnifiedLesson }) {
  const [momentIndex, setMomentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const moment = lesson.moments[momentIndex];
  const isFirst = momentIndex === 0;
  const isLast = momentIndex >= lesson.moments.length - 1;
  const pageLabel = `${momentIndex + 1} / ${lesson.moments.length}`;

  const advance = () => {
    if (isLast) {
      setFinished(true);
      markLessonCompleted(lesson.hub, lesson.id);
    } else {
      setMomentIndex((i) => i + 1);
    }
  };
  const goBack = () => setMomentIndex((i) => Math.max(0, i - 1));

  const theme = useHubTheme();

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      {finished ? (
        <div data-lesson-complete="true" className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-200">
          <div
            className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full text-4xl shadow-md"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }}
          >
            🎉
          </div>
          <h2 className="text-2xl font-black text-slate-800">Lesson complete</h2>
          <p className="mt-1 text-slate-500">{lesson.title}</p>
        </div>
      ) : moment.mode === 'activity' ? (
        <ActivitySection key={moment.id} moment={moment} onNext={advance} onBack={goBack} isFirst={isFirst} isLast={isLast} pageLabel={pageLabel} />
      ) : (
        <PresentationSection key={moment.id} moment={moment} onNext={advance} onBack={goBack} isFirst={isFirst} isLast={isLast} pageLabel={pageLabel} />
      )}
    </div>
  );
}

export function UnifiedLessonPlayer({ hub, lessonId }: { hub: Hub; lessonId: string }) {
  const [lesson, setLesson] = useState<UnifiedLesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLesson(null);
    setError(null);
    loadUnifiedLesson(lessonId)
      .then((l) => {
        if (cancelled) return;
        if (!l) setError(`No lesson found for id "${lessonId}"`);
        else setLesson(l);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Failed to load lesson');
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (error) {
    return <div className="p-10 text-center text-rose-600">{error}</div>;
  }
  if (!lesson) {
    return <div className="p-10 text-center text-slate-400">Loading lesson…</div>;
  }

  return (
    <HubThemeProvider hub={hub}>
      <UnifiedLessonPlayerInner lesson={lesson} />
    </HubThemeProvider>
  );
}
