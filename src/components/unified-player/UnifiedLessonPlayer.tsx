/**
 * Top-level player for the unified pilot lesson engine (Phase 1).
 * Loads a UnifiedLesson from the pilot registry, steps through its
 * moments, and renders each one via PresentationSection or ActivitySection
 * depending on `moment.mode`.
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
    <div className="relative mx-auto mb-8 flex max-w-2xl items-center gap-4">
      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full opacity-80"
          style={{ background: `radial-gradient(circle, ${theme.glow}, transparent 70%)` }}
        />
        <span
          className="relative grid h-14 w-14 place-items-center rounded-2xl text-3xl shadow-xl ring-2 ring-white/60"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }}
        >
          {theme.characterAvatarEmoji}
        </span>
      </div>
      <div className="flex-1 rounded-2xl bg-black/20 px-4 py-2.5 shadow-lg backdrop-blur-md">
        <div className="text-sm font-black text-white drop-shadow">{theme.characterName} · {theme.characterTagline}</div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((momentIndex + 1) / total) * 100}%`, background: `linear-gradient(90deg, ${theme.accent}, #fff)` }}
          />
        </div>
      </div>
      <div className="rounded-full bg-black/20 px-3 py-1.5 text-xs font-black text-white shadow backdrop-blur-md">{momentIndex + 1} / {total}</div>
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
    <div className="relative min-h-screen overflow-hidden px-4 py-10" style={{ background: theme.sceneGradient }}>
      {/* Ambient scene glow — the "place" feeling in place of a photographed background. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: `radial-gradient(circle at 50% 0%, ${theme.glow}, transparent 55%)` }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 100%)' }}
      />

      <div className="relative">
        <PlayerChrome lesson={lesson} momentIndex={Math.min(momentIndex, lesson.moments.length - 1)} />
        {finished ? (
          <div data-lesson-complete="true" className="mx-auto max-w-md rounded-3xl bg-white/90 p-8 text-center shadow-2xl ring-1 ring-white/60 backdrop-blur-xl">
            <div
              className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full text-4xl shadow-lg"
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
