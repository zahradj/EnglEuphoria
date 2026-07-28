import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, Sparkles, Trophy, BookOpen, Map as MapIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PlayUnitLesson from '@/pages/playground-scene/PlayUnitLesson';
import { getSceneLesson } from '@/content/playground-library/sceneLessonRegistry';
import {
  LESSON_1_TITLE, LESSON_1_OBJECTIVE,
  LESSON_2_TITLE, LESSON_2_OBJECTIVE,
  LESSON_3_TITLE, LESSON_3_OBJECTIVE,
  LESSON_4_TITLE, LESSON_4_OBJECTIVE,
  LESSON_5_TITLE, LESSON_5_OBJECTIVE,
  LESSON_6_TITLE, LESSON_6_OBJECTIVE,
  LESSON_U2L1_TITLE, LESSON_U2L1_OBJECTIVE,
} from '@/content/playground-library/unit1/scenes';
import { extractTaughtLetters, completeSceneLesson } from '@/services/sceneLessonCompletionService';
import type { PlaygroundLesson } from '@/hooks/usePlaygroundLessons';

const LESSON_META: Record<string, { title: string; objective: string }> = {
  '1-1': { title: LESSON_1_TITLE, objective: LESSON_1_OBJECTIVE },
  '1-2': { title: LESSON_2_TITLE, objective: LESSON_2_OBJECTIVE },
  '1-3': { title: LESSON_3_TITLE, objective: LESSON_3_OBJECTIVE },
  '1-4': { title: LESSON_4_TITLE, objective: LESSON_4_OBJECTIVE },
  '1-5': { title: LESSON_5_TITLE, objective: LESSON_5_OBJECTIVE },
  '1-6': { title: LESSON_6_TITLE, objective: LESSON_6_OBJECTIVE },
  '2-1': { title: LESSON_U2L1_TITLE, objective: LESSON_U2L1_OBJECTIVE },
};

interface SceneLessonPlayerModalProps {
  isOpen: boolean;
  lesson: PlaygroundLesson | null;
  onClose: () => void;
  onComplete: (lessonId: string, score?: number) => void;
}

/**
 * Launch surface for the scene-based Little Explorers Phonics lessons from
 * the KidsWorldMap — a preview card (title/objective/sounds you'll learn)
 * before starting, then the real scene player, then syncs completion via
 * sceneLessonCompletionService when the finale scene is reached.
 */
export const SceneLessonPlayerModal: React.FC<SceneLessonPlayerModalProps> = ({
  isOpen,
  lesson,
  onClose,
  onComplete,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'preview' | 'playing' | 'saving' | 'complete'>('preview');
  const [homeworkAssignmentId, setHomeworkAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhase('preview');
      setHomeworkAssignmentId(null);
    }
  }, [isOpen, lesson?.id]);

  const key = lesson?.unitNumber != null && lesson?.lessonNumber != null ? `${lesson.unitNumber}-${lesson.lessonNumber}` : null;
  const scenes = useMemo(() => (key ? getSceneLesson(lesson!.unitNumber!, lesson!.lessonNumber!) : null), [key]);
  const meta = key ? LESSON_META[key] : undefined;
  const letters = useMemo(() => (scenes ? extractTaughtLetters(scenes) : []), [scenes]);

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

  const handleFinale = async () => {
    setPhase('saving');
    if (user?.id) {
      const result = await completeSceneLesson({ userId: user.id, lessonRowId: lesson.id, title: meta.title, scenes });
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

              <button
                onClick={() => setPhase('playing')}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FE6A2F] px-6 py-4 text-lg font-extrabold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="h-5 w-5" /> Start!
              </button>
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
            onClick={onClose}
            className="absolute right-4 top-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur hover:bg-white"
            aria-label="Close lesson"
          >
            <X className="h-5 w-5" />
          </button>
          <PlayUnitLesson
            scenes={scenes}
            sessionKey={`dash-scene-${lesson.id}`}
            embedded
            onFinaleReached={handleFinale}
          />
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
