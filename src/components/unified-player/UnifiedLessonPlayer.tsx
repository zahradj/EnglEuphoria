/**
 * Top-level player for the unified pilot lesson engine (Phase 1).
 * Loads a UnifiedLesson from the pilot registry, steps through its
 * moments, and renders each one via PresentationSection or ActivitySection
 * depending on `moment.mode`.
 */
import { useEffect, useState } from 'react';
import { loadUnifiedLesson } from '@/unified-lessons/registry';
import type { UnifiedLesson, Hub } from '@/unified-lessons/types';
import { HubThemeProvider, useHubTheme } from './HubTheme';
import { PresentationSection } from './PresentationSection';
import { ActivitySection } from './ActivitySection';

function PlayerChrome({ lesson, momentIndex }: { lesson: UnifiedLesson; momentIndex: number }) {
  const theme = useHubTheme();
  const total = lesson.moments.length;
  return (
    <div className="mx-auto mb-6 flex max-w-2xl items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ backgroundColor: `${theme.accent}22` }}>
        {theme.characterAvatarEmoji}
      </div>
      <div className="flex-1">
        <div className="text-sm font-black text-slate-800">{theme.characterName} · {theme.characterTagline}</div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((momentIndex + 1) / total) * 100}%`, backgroundColor: theme.accent }}
          />
        </div>
      </div>
      <div className="text-xs font-bold text-slate-400">{momentIndex + 1} / {total}</div>
    </div>
  );
}

function UnifiedLessonPlayerInner({ lesson }: { lesson: UnifiedLesson }) {
  const [momentIndex, setMomentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const moment = lesson.moments[momentIndex];
  const isLast = momentIndex >= lesson.moments.length - 1;

  const advance = () => {
    if (isLast) {
      setFinished(true);
    } else {
      setMomentIndex((i) => i + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <PlayerChrome lesson={lesson} momentIndex={Math.min(momentIndex, lesson.moments.length - 1)} />
      {finished ? (
        <div data-lesson-complete="true" className="mx-auto max-w-md rounded-2xl border-2 border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">🎉</div>
          <h2 className="mt-2 text-2xl font-black text-slate-800">Lesson complete</h2>
          <p className="mt-1 text-slate-500">{lesson.title}</p>
        </div>
      ) : moment.mode === 'activity' ? (
        <ActivitySection moment={moment} onNext={advance} isLast={isLast} />
      ) : (
        <PresentationSection moment={moment} onNext={advance} isLast={isLast} />
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
