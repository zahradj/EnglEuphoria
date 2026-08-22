/**
 * Top-level player for the unified pilot lesson engine (Phase 1).
 * Loads a UnifiedLesson from the pilot registry, steps through its
 * moments, and renders each one via PresentationSection or ActivitySection
 * depending on `moment.mode`.
 *
 * White page background by design — a full-bleed gradient scene looked
 * lively but fights focus in a learning context. Hub identity comes through
 * as contained pops of color instead: the character badge, progress bar,
 * and CTA buttons, not the whole backdrop.
 */
import { useEffect, useState } from 'react';
import { loadUnifiedLesson } from '@/unified-lessons/registry';
import type { UnifiedLesson, Hub } from '@/unified-lessons/types';
import { markLessonCompleted } from '@/unified-lessons/completionTracking';
import { HubThemeProvider, useHubTheme } from './HubTheme';
import { PresentationSection } from './PresentationSection';
import { ActivitySection } from './ActivitySection';

function PlayerChrome({ lesson, momentIndex }: { lesson: UnifiedLesson; momentIndex: number }) {
  const theme = useHubTheme();
  const total = lesson.moments.length;
  return (
    <div className="mx-auto mb-8 flex max-w-2xl items-center gap-4">
      <span
        className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl text-3xl shadow-md"
        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }}
      >
        {theme.characterAvatarEmoji}
      </span>
      <div className="flex-1 rounded-2xl bg-slate-50 px-4 py-2.5 ring-1 ring-slate-200">
        <div className="text-sm font-black text-slate-800">{theme.characterName} · {theme.characterTagline}</div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((momentIndex + 1) / total) * 100}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})` }}
          />
        </div>
      </div>
      <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">{momentIndex + 1} / {total}</div>
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
      markLessonCompleted(lesson.hub, lesson.id);
    } else {
      setMomentIndex((i) => i + 1);
    }
  };

  const theme = useHubTheme();

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <PlayerChrome lesson={lesson} momentIndex={Math.min(momentIndex, lesson.moments.length - 1)} />
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
