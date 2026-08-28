/**
 * Top-level player for the unified pilot lesson engine (Phase 1).
 * Loads a UnifiedLesson from the pilot registry, steps through its
 * moments, and renders each one via PresentationSection or ActivitySection
 * depending on `moment.mode`.
 *
 * Each moment fills the entire screen edge-to-edge (no page margins, no
 * background wash behind it) — the slide itself IS the screen, not a card
 * floating on a page. No top chrome bar (avatar/character badge/progress
 * rail) — the Back/Next controls render inside the slide itself, per
 * moment count in `pageLabel`.
 */
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
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

  const theme = useHubTheme();

  const advance = () => {
    if (isLast) {
      setFinished(true);
      markLessonCompleted(lesson.hub, lesson.id);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: [theme.accent, theme.accent2, '#ffffff'] });
    } else {
      setMomentIndex((i) => i + 1);
    }
  };
  const goBack = () => setMomentIndex((i) => Math.max(0, i - 1));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* A filling top progress bar (the Duolingo/Playground lesson-progress
          signature) instead of a numeric "N / M" readout — the single most
          recognizable "this is a game, not a form" visual cue, and it reads
          at a glance without asking the student to do the division. */}
      {!finished && (
        <div className="h-2 w-full flex-shrink-0 bg-slate-100">
          <div
            className="h-full rounded-r-full transition-all duration-500 ease-out"
            style={{
              width: `${((momentIndex + 1) / lesson.moments.length) * 100}%`,
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
            }}
          />
        </div>
      )}
      <div className="min-h-0 flex-1">
        {finished ? (
          <div
            data-lesson-complete="true"
            className="flex h-full flex-col items-center justify-center p-8 text-center"
            style={{ backgroundImage: theme.slideBackground }}
          >
            <div className="mx-auto mb-3 grid h-24 w-24 place-items-center rounded-full bg-white text-5xl shadow-lg">🎉</div>
            <h2 className="text-3xl font-black text-white drop-shadow-lg">Lesson complete!</h2>
            <p className="mt-1 font-semibold text-white/80">{lesson.title}</p>
          </div>
        ) : moment.mode === 'activity' ? (
          <ActivitySection key={moment.id} moment={moment} onNext={advance} onBack={goBack} isFirst={isFirst} isLast={isLast} pageLabel={pageLabel} />
        ) : (
          <PresentationSection key={moment.id} moment={moment} onNext={advance} onBack={goBack} isFirst={isFirst} isLast={isLast} pageLabel={pageLabel} />
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
