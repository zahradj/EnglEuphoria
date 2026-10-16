import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, Sparkles, Trophy, BookOpen, Map as MapIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PlayUnitLesson from '@/pages/playground-scene/PlayUnitLesson';
import PlayWelcomeTownLesson from '@/pages/playground-scene/PlayWelcomeTownLesson';
import { getSceneLesson, getSceneLessonMeta } from '@/content/playground-library/sceneLessonRegistry';
import { getWelcomeTownLesson } from '@/content/playground-library/welcomeTownLessonRegistry';
import { extractTaughtLetters, completeSceneLesson } from '@/services/sceneLessonCompletionService';
import {
  clearResume,
  createResumeSaver,
  hasSomethingToResume,
  loadResume,
  resolveResumeIndex,
  resumePercent,
  type ResumeSaver,
  type SavedResume,
} from '@/services/lessonResumeService';
import type { PlaygroundLesson } from '@/hooks/usePlaygroundLessons';
import { isWelcomeTownFamilyFormat } from '@/content/playground-library/sceneLessonFormats';

interface SceneLessonPlayerModalProps {
  isOpen: boolean;
  lesson: PlaygroundLesson | null;
  onClose: () => void;
  onComplete: (lessonId: string, score?: number) => void;
}

/**
 * Launch surface for scene-based Playground lessons (Pre-A1 Little
 * Explorers Phonics AND A1/A2 Welcome Town) from the KidsWorldMap — a
 * preview card (title/objective/sounds you'll learn) before starting,
 * then the real scene player, then syncs completion via
 * sceneLessonCompletionService when the finale scene is reached.
 */
export const SceneLessonPlayerModal: React.FC<SceneLessonPlayerModalProps> = ({
  isOpen,
  lesson,
  onClose,
  onComplete,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'preview' | 'playing' | 'saving' | 'complete'>('preview');
  const [homeworkAssignmentId, setHomeworkAssignmentId] = useState<string | null>(null);
  // Where the student stopped last time (saved automatically while they play), so the same lesson continues there.
  const [resume, setResume] = useState<SavedResume | null>(null);
  const saverRef = useRef<ResumeSaver | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhase('preview');
      setHomeworkAssignmentId(null);
    }
  }, [isOpen, lesson?.id]);

  // Load the saved position whenever a lesson is opened (not for a replay of a lesson already completed).
  useEffect(() => {
    setResume(null);
    if (!isOpen || !lesson || !user?.id || lesson.status === 'completed') return;
    let cancelled = false;
    void loadResume(user.id, lesson.id).then((r) => { if (!cancelled) setResume(r); });
    return () => { cancelled = true; };
  }, [isOpen, lesson?.id, lesson?.status, user?.id]);

  // The players report every scene change here; the saver turns a burst of moves into one write.
  const onNavState = useCallback((state: { sceneIdx: number }) => { saverRef.current?.note(state.sceneIdx); }, []);

  // Never lose the last move: write it when the lesson is left, the tab is hidden, or the page is closed.
  useEffect(() => {
    if (phase !== 'playing') return;
    const flush = () => { void saverRef.current?.flush(); };
    const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [phase]);

  const isWelcomeTown = isWelcomeTownFamilyFormat(lesson?.contentFormat);
  const key = lesson?.unitNumber != null && lesson?.lessonNumber != null ? `${lesson.unitNumber}-${lesson.lessonNumber}` : null;

  const welcomeTownLesson = useMemo(
    () => (key && isWelcomeTown ? getWelcomeTownLesson(lesson!.contentFormat!, lesson!.unitNumber!, lesson!.lessonNumber!) : null),
    [key, isWelcomeTown],
  );
  const scenes = useMemo(
    () => (isWelcomeTown ? welcomeTownLesson?.scenes ?? null : key ? getSceneLesson(lesson!.unitNumber!, lesson!.lessonNumber!) : null),
    [key, isWelcomeTown, welcomeTownLesson],
  );
  const meta = isWelcomeTown
    ? (welcomeTownLesson ? { title: welcomeTownLesson.title, objective: welcomeTownLesson.objective } : undefined)
    : (key ? getSceneLessonMeta(lesson!.unitNumber!, lesson!.lessonNumber!) ?? undefined : undefined);
  const letters = useMemo(() => (scenes ? extractTaughtLetters(scenes) : []), [scenes]);
  const resumeIdx = useMemo(() => (scenes ? resolveResumeIndex(resume, scenes as { id?: string }[]) : 0), [resume, scenes]);
  const canResume = !!scenes && !!resume && hasSomethingToResume(resumeIdx);

  if (!isOpen || !lesson) return null;

  if (!scenes || !meta) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
        <div className="max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
          <p className="font-bold text-slate-700">This lesson isn't ready yet.</p>
          <button onClick={onClose} className="mt-4 rounded-full bg-orange-500 px-5 py-2 font-bold text-white">
            Close
          </button>
        </div>
      </div>
    );
  }

  /** Begin (or continue) the lesson. Continuing seeds the player's own scene-index store; starting over clears the saved position. */
  const startPlaying = (fromResume: boolean) => {
    const storageKey = `dash-scene-${lesson.id}`;
    try {
      if (fromResume) window.sessionStorage.setItem(storageKey, String(resumeIdx));
      else window.sessionStorage.removeItem(storageKey);
    } catch { /* private mode: the player starts at the beginning */ }
    if (!fromResume && user?.id && resume) { void clearResume(user.id, lesson.id); setResume(null); }
    saverRef.current?.cancel();
    // A replay of a completed lesson saves nothing (it must stay completed).
    saverRef.current = user?.id && lesson.status !== 'completed'
      ? createResumeSaver({ userId: user.id, lessonId: lesson.id, scenes: scenes as { id?: string }[] })
      : null;
    setPhase('playing');
  };

  const leaveLesson = () => {
    void saverRef.current?.flush();
    onClose();
  };

  const handleFinale = async () => {
    setPhase('saving');
    // The lesson is done: no pending position may be written after this, and the saved one is no longer needed.
    saverRef.current?.cancel();
    saverRef.current = null;
    if (user?.id) {
      await clearResume(user.id, lesson.id);
      const result = await completeSceneLesson({ userId: user.id, lessonRowId: lesson.id, title: meta.title, scenes, lessonKey: lesson.contentFormat && key ? `${lesson.contentFormat}-${key}` : null });
      setHomeworkAssignmentId(result.homeworkAssignmentId);
    }
    onComplete(lesson.id, 100);
    setPhase('complete');
  };

  const goToHomework = () => {
    if (homeworkAssignmentId) navigate(`/homework/${homeworkAssignmentId}`);
    onClose();
  };

  const backToMap = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {phase === 'preview' ? (
        <motion.div
          key="preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow hover:bg-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="p-8 text-white"
              style={{ background: 'linear-gradient(135deg, #FFB37A 0%, #FE6A2F 55%, #C84810 100%)' }}
            >
              <span className="text-xs font-extrabold uppercase tracking-widest opacity-90">
                Unit {lesson.unitNumber} · Lesson {lesson.lessonNumber}
              </span>
              <h2 className="mt-2 text-3xl font-black leading-tight">{meta.title}</h2>
              <p className="mt-3 text-sm leading-relaxed opacity-95">{meta.objective}</p>
            </div>

            <div className="space-y-4 p-6">
              {letters.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#FE6A2F]/70">
                    Sounds you'll learn
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {letters.map((letter) => (
                      <span
                        key={letter}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#FE6A2F]/20 bg-[#FEFBDD] text-lg font-black text-[#FE6A2F]"
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {canResume && resume ? (
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-extrabold text-[#FE6A2F]/80">
                      <span>{t('lr.stoppedAt', { n: resumeIdx + 1, total: resume.totalScenes, defaultValue: 'You stopped at step {{n}} of {{total}}' })}</span>
                      <span>{resumePercent(resumeIdx, resume.totalScenes)}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#FE6A2F]/15" role="progressbar" aria-valuenow={resumePercent(resumeIdx, resume.totalScenes)} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full bg-[#FE6A2F]" style={{ width: `${resumePercent(resumeIdx, resume.totalScenes)}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => startPlaying(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FE6A2F] px-6 py-4 text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <Sparkles className="h-5 w-5" /> {t('lr.continue', 'Continue where I stopped')}
                  </button>
                  <button
                    onClick={() => startPlaying(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#FE6A2F]/30 bg-white px-6 py-3 text-base font-extrabold text-[#FE6A2F] transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    {t('lr.startOver', 'Start from the beginning')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startPlaying(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FE6A2F] px-6 py-4 text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles className="h-5 w-5" /> Start!
                </button>
              )}
              {lesson.status !== 'completed' && (
                <p className="text-center text-xs font-semibold text-slate-400">{t('lr.autoSaved', 'Your progress is saved automatically.')}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : phase === 'complete' ? (
        <motion.div
          key="complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-8 text-center shadow-2xl"
          >
            <Trophy className="mx-auto h-16 w-16 text-amber-400 drop-shadow" />
            <h2 className="mt-3 text-2xl font-black text-[#FE6A2F]">Lesson complete!</h2>
            <p className="mt-2 text-sm text-slate-600">
              {homeworkAssignmentId
                ? "Great job! Your practice homework is ready — do it now while it's fresh, or come back to it later."
                : "Great job! Head back to the map to keep going."}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {homeworkAssignmentId && (
                <button
                  onClick={goToHomework}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FE6A2F] px-6 py-4 text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <BookOpen className="h-5 w-5" /> Do my homework now
                </button>
              )}
              <button
                onClick={backToMap}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#FE6A2F]/30 bg-white px-6 py-4 text-lg font-extrabold text-[#FE6A2F] shadow transition-transform hover:scale-[1.02] active:scale-95"
              >
                <MapIcon className="h-5 w-5" /> Back to the map
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="playing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-[#FEFBDD]"
        >
          <button
            onClick={leaveLesson}
            className="absolute right-4 top-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur hover:bg-white"
            aria-label="Close lesson"
          >
            <X className="h-5 w-5" />
          </button>
          {isWelcomeTown ? (
            <PlayWelcomeTownLesson
              scenes={scenes as any}
              sessionKey={`dash-scene-${lesson.id}`}
              embedded
              onFinaleReached={handleFinale}
              onNavState={onNavState}
            />
          ) : (
            <PlayUnitLesson
              scenes={scenes as any}
              sessionKey={`dash-scene-${lesson.id}`}
              embedded
              onFinaleReached={handleFinale}
              onNavState={onNavState}
            />
          )}
          {phase === 'saving' && (
            <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center gap-3 bg-black/50 text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="font-bold">Saving your progress…</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SceneLessonPlayerModal;
