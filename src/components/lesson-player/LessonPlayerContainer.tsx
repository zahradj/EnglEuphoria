import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HubType, GeneratedSlide } from '@/components/admin/lesson-builder/ai-wizard/types';
import { HUB_CONFIGS } from '@/components/admin/lesson-builder/ai-wizard/hubConfig';
import DynamicSlideRenderer from './DynamicSlideRenderer';
import FeedbackOverlay from './FeedbackOverlay';
import { PlaygroundCorrectBurst } from './PlaygroundCorrectBurst';
import LessonRewardPage from './LessonRewardPage';
import PipMascot from './PipMascot';
import { soundEffectsService } from '@/services/soundEffectsService';
import { triggerCelebration } from '@/services/celebration';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validatePedagogy } from '@/utils/validatePedagogy';
import { useMasteryTracker } from '@/hooks/useMasteryTracker';
import { useStreak } from '@/hooks/useStreak';
import { X, Volume2, VolumeX, Zap, Star, ChevronLeft, ChevronRight, Focus, BookOpen } from 'lucide-react';
import LibraryDrawer from './LibraryDrawer';
import PhaseTracker from './PhaseTracker';
import { useLessonAutoSave, readLessonBookmark, clearLessonBookmark } from '@/hooks/useLessonAutoSave';
import { useMicroRemediation } from './feedback/useMicroRemediation';
import ConfidenceBuilderIntro from './feedback/ConfidenceBuilderIntro';
import { buildConfidenceBuilderSlide } from './feedback/buildConfidenceBuilderSlide';
import GritRewardModal, { type GritHub } from './feedback/GritRewardModal';
import HomeworkPanel from './HomeworkPanel';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/* ── Hub Skin Configuration ── */
const HUB_SKINS = {
  playground: {
    shell: 'bg-gradient-to-b from-amber-50 to-orange-50',
    header: 'bg-gradient-to-r from-amber-100/90 to-orange-100/90 backdrop-blur-md',
    footer: 'bg-gradient-to-r from-amber-100/90 to-orange-100/90 backdrop-blur-md',
    card: 'bg-white/90 border-2 border-amber-200/60 shadow-[0_20px_60px_rgba(255,159,28,0.15)]',
    progressTrack: 'bg-amber-200/50',
    progressBar: 'bg-gradient-to-r from-amber-400 to-orange-400',
    progressGlow: '0 0 12px rgba(255, 191, 0, 0.5)',
    checkActive: 'bg-gradient-to-r from-emerald-400 to-green-500',
    checkShadow: '0 4px 0 #16a34a',
    checkDisabled: 'bg-amber-200/60',
    xpColor: '#FF9F1C',
  },
  academy: {
    shell: 'bg-gradient-to-b from-indigo-950 to-slate-950',
    header: 'bg-indigo-950/80 backdrop-blur-xl border-b border-indigo-500/20',
    footer: 'bg-indigo-950/80 backdrop-blur-xl border-t border-indigo-500/20',
    card: 'bg-indigo-900/60 border border-indigo-500/30 shadow-[0_20px_60px_rgba(99,102,241,0.2)]',
    progressTrack: 'bg-indigo-800/40',
    progressBar: 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500',
    progressGlow: '0 0 16px rgba(139, 92, 246, 0.6)',
    checkActive: 'bg-gradient-to-r from-indigo-500 to-violet-500',
    checkShadow: '0 4px 0 #4338ca',
    checkDisabled: 'bg-indigo-800/40',
    xpColor: '#A855F7',
  },
  professional: {
    shell: 'bg-gradient-to-b from-slate-50 to-gray-100',
    header: 'bg-white/90 backdrop-blur-md border-b border-slate-200',
    footer: 'bg-white/90 backdrop-blur-md border-t border-slate-200',
    card: 'bg-white border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.06)]',
    progressTrack: 'bg-slate-200',
    progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    progressGlow: 'none',
    checkActive: 'bg-slate-900',
    checkShadow: '0 4px 0 #1e293b',
    checkDisabled: 'bg-slate-200',
    xpColor: '#10B981',
  },
} as const;

/** Check if a slide has visual media (image/video) for the left pane */
function slideHasMedia(slide: GeneratedSlide): boolean {
  if (!slide) return false;
  const s = slide as any;
  return !!(
    slide.imageUrl ||
    slide.content?.imageUrl ||
    s.video_url ||
    s.youtube_url ||
    s.youtube_video_id ||
    s.media_url ||
    s.requires_video ||
    (slide.mediaType && (slide.mediaType as string) !== 'none')
  );
}

/** Left pane: renders the visual anchor (image or video) */
function SlideMediaPane({ slide }: { slide: GeneratedSlide }) {
  const s = slide as any;

  // 1. Direct youtube_video_id (highest priority)
  const ytVideoId = s.youtube_video_id;
  if (ytVideoId) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${ytVideoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 2. Full video URL (youtube or other)
  const videoUrl = s.video_url || s.youtube_url || s.media_url;
  if (videoUrl) {
    const ytId = videoUrl.match(/(?:youtu\.be\/|v=|\/embed\/)([^&?#/]+)/)?.[1];
    if (ytId) {
      return (
        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <video src={videoUrl} controls className="w-full rounded-2xl max-h-full object-contain" />
    );
  }

  // 3. Image
  const imageUrl = slide.imageUrl || slide.content?.imageUrl;
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={slide.title || 'Slide visual'}
        className="max-w-full max-h-full rounded-2xl object-contain"
      />
    );
  }

  // 4. Fallback placeholder
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 opacity-60">
      <span className="text-6xl">📚</span>
      <p className="text-sm text-muted-foreground font-medium">{slide.title}</p>
    </div>
  );
}

/** Heuristic phase detection — uses slide metadata first, then title/type hints. */
function inferPhase(slide: GeneratedSlide | undefined): string | undefined {
  if (!slide) return undefined;
  const s = slide as any;
  if (s.phase) return String(s.phase);
  const blob = `${s.activityType ?? ''} ${slide.slideType ?? ''} ${slide.title ?? ''}`.toLowerCase();
  if (/(speak|produce|fluency|free.?talk|role.?play)/.test(blob)) return 'phase_4';
  if (/(practice|controlled|sentence_builder|fill)/.test(blob)) return 'phase_3';
  if (/(mimic|model|listen)/.test(blob)) return 'phase_2';
  return 'phase_1';
}

/** True when the slide belongs to the final speaking / produce / fluency phase. */
function isSpeakingPhaseSlide(slide: GeneratedSlide | undefined): boolean {
  return inferPhase(slide) === 'phase_4';
}

/** Pull a small vocab list from the lesson's vocab card slides for the fallback. */
function extractLessonVocab(slides: GeneratedSlide[]): Array<{
  word: string; translation?: string; definition?: string;
}> {
  const out: Array<{ word: string; translation?: string; definition?: string }> = [];
  for (const s of slides) {
    const c = (s as any).content || {};
    if (c.word) out.push({ word: c.word, translation: c.translation, definition: c.definition });
    if (Array.isArray(c.vocabulary)) {
      for (const v of c.vocabulary) {
        if (v?.word) out.push({ word: v.word, translation: v.translation, definition: v.definition });
      }
    }
    if (out.length >= 6) break;
  }
  return out;
}


interface LessonPlayerContainerProps {
  slides: GeneratedSlide[];
  hub: HubType;
  lessonTitle: string;
  lessonId?: string;
  studentId?: string;
  homeworkPack?: import('@/coherence/types').HomeworkPack | null;
  isTeacherView?: boolean;
  /** Preview-only: open directly on the auto-summary + homework page. */
  startOnSummary?: boolean;
  onComplete?: (score: number) => void;
  onExit?: () => void;
}

export default function LessonPlayerContainer({
  slides: initialSlides,
  hub,
  lessonTitle: initialTitle,
  lessonId,
  studentId,
  homeworkPack,
  isTeacherView,
  startOnSummary,
  onComplete,
  onExit,
}: LessonPlayerContainerProps) {
  const [activeSlides, setActiveSlides] = useState(initialSlides);
  const [activeLessonTitle, setActiveLessonTitle] = useState(initialTitle);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isHomeworkOpen, setIsHomeworkOpen] = useState(false);

  // Keep in sync if parent changes props
  useEffect(() => { setActiveSlides(initialSlides); }, [initialSlides]);
  useEffect(() => { setActiveLessonTitle(initialTitle); }, [initialTitle]);

  // Rule 9: Validate pedagogy sequence on mount
  useEffect(() => {
    if (initialSlides.length > 1) {
      const warnings = validatePedagogy(initialSlides);
      warnings.forEach(w => {
        toast.warning(`⚠️ Sequence Warning: "${w.teachType}" at slide ${w.index + 1} not followed by practice. Expected: ${w.expectedTypes.join(', ')}`, { duration: 6000 });
      });
    }
  }, [initialSlides]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [lessonScore, setLessonScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [muted, setMuted] = useState(false);
  const [completed, setCompleted] = useState(!!startOnSummary);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [spotlightActive, setSpotlightActive] = useState(false);
  const startTimeRef = useRef(Date.now());
  const { trackMastery } = useMasteryTracker();
  const { bumpStreak } = useStreak();

  // Stars remaining (used by the resume bookmark — defaults to 3 hearts/lives)
  const [starsRemaining] = useState(3);

  // Resume prompt — shown once per mount, only if a saved bookmark exists for an incomplete lesson
  const [resumePrompt, setResumePrompt] = useState<{ slide: number; stars: number } | null>(null);
  const resumeChecked = useRef(false);
  useEffect(() => {
    if (resumeChecked.current) return;
    resumeChecked.current = true;
    const bookmark = readLessonBookmark(lessonId);
    if (bookmark && bookmark.slide_index > 0 && bookmark.slide_index < activeSlides.length - 1) {
      setResumePrompt({ slide: bookmark.slide_index, stars: bookmark.stars_remaining });
    }
  }, [lessonId, activeSlides.length]);

  // Auto-save bookmark on every slide change
  useLessonAutoSave({
    lessonId,
    studentId,
    slideIndex: currentSlideIndex,
    starsRemaining,
    totalSlides: activeSlides.length,
    completed,
  });

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [feedbackSolution, setFeedbackSolution] = useState('');
  // Playground-only celebration trigger — incremented on every correct answer.
  const [playgroundBurstKey, setPlaygroundBurstKey] = useState(0);

  const config = HUB_CONFIGS[hub];
  const skin = HUB_SKINS[hub];
  const totalSlides = activeSlides.length;
  const currentSlide = activeSlides[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / totalSlides) * 100;

  const isActivitySlide = currentSlide?.slideType === 'activity' || !!currentSlide?.activityType;

  useEffect(() => {
    const qCount = activeSlides.filter(s => s.slideType === 'activity' || !!s.activityType).length;
    setTotalQuestions(qCount);
  }, [activeSlides]);

  useEffect(() => {
    if (completed) triggerCelebration(hub);
  }, [completed, hub]);

  const handleCorrectAnswer = useCallback(() => {
    setLessonScore((p) => p + 10);
    setCorrectCount((p) => p + 1);
    setAnswerSelected(true);
    setFeedbackCorrect(true);
    setFeedbackSolution('');
    setFeedbackVisible(true);
    if (!muted) soundEffectsService.playCorrect();
    // Playground hub: full-screen confetti + ⭐ +100 XP badge for kid-friendly delight.
    if (hub === 'playground') setPlaygroundBurstKey((k) => k + 1);
    // SRS: track mastery for the current slide's item
    const itemKey = currentSlide?.content?.word || currentSlide?.content?.title || currentSlide?.title;
    if (itemKey) trackMastery(itemKey, true, 'vocabulary', hub);
  }, [muted, currentSlide, trackMastery, hub]);

  const handleIncorrectAnswer = useCallback(() => {
    setAnswerSelected(true);
    setFeedbackCorrect(false);
    const answer = currentSlide?.content?.correctAnswer || currentSlide?.interaction?.data?.correct_answer || '';
    setFeedbackSolution(answer);
    setFeedbackVisible(true);
    if (!muted) soundEffectsService.playIncorrect();
    // SRS: track mastery failure
    const itemKey = currentSlide?.content?.word || currentSlide?.content?.title || currentSlide?.title;
    if (itemKey) trackMastery(itemKey, false, 'vocabulary', hub);
  }, [muted, currentSlide, trackMastery, hub]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((p) => p - 1);
      setAnswerSelected(false);
      setFeedbackVisible(false);
      if (!muted) soundEffectsService.playPageTurn();
    }
  }, [currentSlideIndex, muted]);

  // ── Cycle 3 In-Lesson Safety Net ──
  const micro = useMicroRemediation();
  const [confidenceIntroOpen, setConfidenceIntroOpen] = useState(false);
  const lastStrikeTagRef = useRef<string | undefined>(undefined);
  // Cycle 3 Grit reward — fires when the student finishes a Confidence Builder.
  const [gritReward, setGritReward] = useState<{ tag?: string } | null>(null);


  // Listen for 3rd-strike broadcasts from any activity. We only count strikes
  // that happen BEFORE the speaking/produce phase (phases 1–3 in the 6-slide arc).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { phase?: string; targetLabel?: string };
      const phase = detail?.phase ?? inferPhase(currentSlide);
      lastStrikeTagRef.current = detail?.targetLabel;
      // Only the pre-speaking phases trigger the safety net.
      if (!phase || phase === 'phase_4' || /speaking|produce|fluency/i.test(phase)) return;
      micro.registerPhase3ThirdStrike();
    };
    window.addEventListener('lesson:thirdStrike', handler);
    return () => window.removeEventListener('lesson:thirdStrike', handler);
  }, [micro, currentSlide]);

  const handleNextSlide = useCallback(() => {
    setFeedbackVisible(false);
    setAnswerSelected(false);

    // Cycle 3 — if leaving a Confidence Builder slide, celebrate with Grit reward.
    const leavingSlide = activeSlides[currentSlideIndex] as any;
    if (leavingSlide?.meta?.injected_by === 'micro_remediation') {
      setGritReward({ tag: leavingSlide?.meta?.skill_tag ?? lastStrikeTagRef.current });
    }

    if (currentSlideIndex >= totalSlides - 1) {
      completeLesson();
      return;
    }

    // Inject Confidence Builder right before the next slide if it would enter phase 4.
    const nextSlide = activeSlides[currentSlideIndex + 1];
    if (micro.pendingConfidenceBuilder && isSpeakingPhaseSlide(nextSlide)) {
      const vocab = extractLessonVocab(activeSlides);
      buildConfidenceBuilderSlide({
        hub,
        failedTag: lastStrikeTagRef.current,
        lessonVocab: vocab,
      }).then((injected) => {
        setActiveSlides((prev) => [
          ...prev.slice(0, currentSlideIndex + 1),
          injected,
          ...prev.slice(currentSlideIndex + 1),
        ]);
        micro.markInjected();
        setConfidenceIntroOpen(true);
        setCurrentSlideIndex((p) => p + 1);
        if (!muted) soundEffectsService.playPageTurn();
      });
      return;
    }

    setCurrentSlideIndex((p) => p + 1);
    if (!muted) soundEffectsService.playPageTurn();
  }, [currentSlideIndex, totalSlides, muted, activeSlides, micro, hub]);


  const completeLesson = useCallback(() => {
    setCompleted(true);
    clearLessonBookmark(lessonId);
    if (!muted) soundEffectsService.playCelebration();
    onComplete?.(lessonScore);
    bumpStreak();
  }, [lessonScore, onComplete, muted, lessonId, bumpStreak]);

  const claimRewards = useCallback(async () => {
    // Persist completion to Supabase. Throws on failure so reward page can toast it.
    if (!studentId || !lessonId) {
      // No persistence target — treat as success (e.g. preview / unauthenticated demo)
      return;
    }
    // student_lesson_progress.lesson_id is uuid — bail gracefully on non-uuid ids
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonId);
    if (!isUuid) return;

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const { error } = await supabase.from('student_lesson_progress').upsert(
      {
        user_id: studentId,
        lesson_id: lessonId,
        status: 'completed',
        score: lessonScore,
        time_spent_seconds: timeSpent,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: 'user_id,lesson_id' } as any
    );
    if (error) {
      console.error('claimRewards save failed:', error);
      throw new Error(error.message || 'Failed to save progress');
    }
  }, [studentId, lessonId, lessonScore]);

  const handleLibraryInject = (newSlides: GeneratedSlide[], title: string) => {
    setActiveSlides(newSlides);
    setActiveLessonTitle(title);
    setCurrentSlideIndex(0);
    setAnswerSelected(false);
    setFeedbackVisible(false);
    setCompleted(false);
    setLessonScore(0);
    setCorrectCount(0);
    setIsLibraryOpen(false);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEffectsService.setMuted(next);
  };

  /* ──────────── Reward Page (auto-summary) + Homework section ──────────── */
  if (completed) {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    return (
      <>
        <LessonRewardPage
          hub={hub}
          xpEarned={lessonScore}
          correctCount={correctCount}
          totalQuestions={totalQuestions}
          timeSpentSeconds={timeSpent}
          homeworkPack={homeworkPack ?? null}
          onOpenHomework={() => setIsHomeworkOpen(true)}
          onClaim={claimRewards}
          onExit={onExit || (() => {})}
        />
        <HomeworkPanel
          hub={hub}
          pack={homeworkPack}
          open={isHomeworkOpen}
          onClose={() => setIsHomeworkOpen(false)}
        />
      </>
    );
  }

  /* ──────────── App-Shell — wider max-w ──────────── */
  return (
    <div className={`h-dvh overflow-hidden flex flex-col items-center justify-center ${skin.shell}`} style={{ position: 'relative' }}>

      {/* Resume prompt — shown once if a saved bookmark exists */}
      <AlertDialog open={!!resumePrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome back! 👋</AlertDialogTitle>
            <AlertDialogDescription>
              We saved your progress. Resume from Slide {(resumePrompt?.slide ?? 0) + 1} or start over?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                clearLessonBookmark(lessonId);
                setCurrentSlideIndex(0);
                setResumePrompt(null);
              }}
            >
              Start Over
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (resumePrompt) setCurrentSlideIndex(resumePrompt.slide);
                setResumePrompt(null);
              }}
            >
              Resume from Slide {(resumePrompt?.slide ?? 0) + 1}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Spotlight overlay */}
      {spotlightActive && (
        <div
          className="fixed inset-0 z-15 pointer-events-none transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at 50% 50%, transparent 320px, rgba(0,0,0,0.45) 320px)',
          }}
        />
      )}

      {/* ── Fixed Top Bar ── */}
      <div className={`fixed top-0 left-0 right-0 z-30 px-2 sm:px-4 py-2 sm:py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] ${skin.header}`}>
        <div className="w-full max-w-5xl mx-auto flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={onExit}
            aria-label="Exit lesson"
            className="min-w-11 min-h-11 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors shrink-0"
          >
            <X size={20} style={{ color: config.colorPalette.text }} />
          </button>

          {/* Progress Bar */}
          <div className={`flex-1 h-3 sm:h-4 rounded-full overflow-hidden relative ${skin.progressTrack}`}>
            <motion.div
              className={`h-full rounded-full ${skin.progressBar}`}
              style={{ boxShadow: skin.progressGlow }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
            {hub === 'playground' && (
              <motion.div
                className="absolute top-[-6px]"
                animate={{ left: `calc(${Math.min(progress, 90)}% - 12px)` }}
                transition={{ type: 'spring', stiffness: 50 }}
              >
                <PipMascot size={24} animation="bounce" />
              </motion.div>
            )}
          </div>

          {/* XP Badge */}
          <div className="flex items-center gap-1 shrink-0 px-1">
            {hub === 'academy' ? (
              <Zap size={14} style={{ color: skin.xpColor }} />
            ) : hub === 'playground' ? (
              <Star size={14} style={{ color: skin.xpColor }} />
            ) : null}
            <span className="text-xs font-bold" style={{ color: skin.xpColor }}>
              {lessonScore}
            </span>
          </div>

          {/* Spotlight toggle */}
          <button
            onClick={() => setSpotlightActive((p) => !p)}
            aria-label="Toggle focus mode"
            className={`hidden sm:flex min-w-11 min-h-11 items-center justify-center opacity-50 hover:opacity-100 shrink-0 transition-opacity ${spotlightActive ? '!opacity-100' : ''}`}
            title="Toggle focus mode"
          >
            <Focus size={16} />
          </button>

          {/* Library Book icon */}
          <button
            onClick={() => setIsLibraryOpen(true)}
            aria-label="Lesson library"
            className="min-w-11 min-h-11 flex items-center justify-center opacity-60 hover:opacity-100 shrink-0 transition-opacity"
            title="Lesson Library"
          >
            <BookOpen size={16} />
          </button>

          {/* Jump to Auto-Summary — quick access to the homework preview section */}
          {homeworkPack && homeworkPack.tasks.length > 0 && !completed && (
            <button
              onClick={() => setCompleted(true)}
              aria-label="Jump to lesson summary"
              className="min-w-11 h-9 sm:h-10 px-2.5 sm:px-3 flex items-center gap-1.5 rounded-full shrink-0 text-xs font-bold border-2"
              style={{ borderColor: skin.xpColor, color: skin.xpColor }}
              title="Jump to Auto-Summary + Homework"
            >
              📋 <span className="hidden sm:inline">Summary</span>
            </button>
          )}

          {/* Homework — visible whenever a pack exists so teacher can jump in if lesson finishes early */}
          {homeworkPack && homeworkPack.tasks.length > 0 && (
            <button
              onClick={() => setIsHomeworkOpen(true)}
              aria-label="Open homework"
              className="min-w-11 h-9 sm:h-10 px-2.5 sm:px-3 flex items-center gap-1.5 rounded-full shrink-0 text-xs font-bold text-white"
              style={{ background: skin.xpColor }}
              title="Jump to homework"
            >
              🎒 <span className="hidden sm:inline">Homework</span>
              <span className="hidden md:inline opacity-80">· {homeworkPack.total_minutes}m</span>
            </button>
          )}

          <button
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="min-w-11 min-h-11 flex items-center justify-center opacity-60 hover:opacity-100 shrink-0"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
        {/* 6-Step Phase Tracker — locked progression map */}
        <div className="w-full max-w-5xl mx-auto mt-2">
          <PhaseTracker
            slides={activeSlides as any}
            currentIndex={currentSlideIndex}
            onJumpToPhase={(idx) => {
              setCurrentSlideIndex(idx);
              setAnswerSelected(false);
              setFeedbackVisible(false);
            }}
            accentClass={
              hub === 'playground'
                ? 'bg-orange-500 text-white ring-orange-200'
                : hub === 'academy'
                ? 'bg-violet-500 text-white ring-violet-300'
                : 'bg-emerald-600 text-white ring-emerald-200'
            }
          />
        </div>
      </div>

      {/* ── Centered Fluid App-Card — SlideShell provides the branded frame ── */}
      <div className="flex-1 flex items-center justify-center px-2 sm:px-4 w-full pt-[108px] sm:pt-[124px] pb-[80px] sm:pb-[88px]">
        <div className="w-full max-w-6xl h-full max-h-[85dvh] rounded-2xl sm:rounded-3xl relative z-20 overflow-hidden">
          <AnimatePresence mode="wait">
            <DynamicSlideRenderer
              key={currentSlide.id}
              slide={currentSlide}
              hub={hub}
              onCorrectAnswer={handleCorrectAnswer}
              onIncorrectAnswer={handleIncorrectAnswer}
              level={(currentSlide as any).level || (currentSlide as any).cefr_level}
              unit={(currentSlide as any).unit_number ?? (currentSlide as any).unitNumber}
              lesson={(currentSlide as any).lesson_number ?? (currentSlide as any).lessonNumber}
              slideIndex={currentSlideIndex}
              totalSlides={activeSlides.length}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* ── Feedback Overlay ── */}
      <FeedbackOverlay
        visible={feedbackVisible}
        correct={feedbackCorrect}
        solution={feedbackSolution}
        hub={hub}
        onContinue={handleNextSlide}
      />

      {/* ── Playground celebration: confetti + ⭐ +100 XP badge ── */}
      {hub === 'playground' && (
        <PlaygroundCorrectBurst triggerKey={playgroundBurstKey} xp={100} />
      )}

      {/* ── Fixed Bottom Footer ── */}
      {!feedbackVisible && (
        <div className={`fixed bottom-0 left-0 right-0 z-20 px-3 sm:px-4 py-2.5 sm:py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${skin.footer}`}>
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
            {/* Back Button */}
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2.5 sm:py-3 min-h-11 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm tracking-wide uppercase transition-all ${
                currentSlideIndex === 0
                  ? `${skin.checkDisabled} opacity-40 cursor-not-allowed`
                  : `${skin.checkActive} text-white`
              }`}
              style={{
                boxShadow: currentSlideIndex === 0 ? 'none' : skin.checkShadow,
                color: currentSlideIndex === 0 ? config.colorPalette.text : '#fff',
              }}
            >
              <ChevronLeft size={18} />
              <span className="hidden xs:inline">Back</span>
            </button>

            {/* Slide indicator */}
            <span className="text-xs font-medium opacity-60 tabular-nums">
              {currentSlideIndex + 1} / {totalSlides}
            </span>

            {/* Next Button */}
            <button
              onClick={handleNextSlide}
              className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2.5 sm:py-3 min-h-11 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm tracking-wide uppercase transition-all ${skin.checkActive} text-white`}
              style={{
                boxShadow: skin.checkShadow,
                color: '#fff',
              }}
            >
              {currentSlideIndex === totalSlides - 1 ? 'Finish' : 'Next'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Library Drawer */}
      <LibraryDrawer
        open={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectLesson={handleLibraryInject}
        slideFormat="raw"
      />

      {/* Homework Panel — available mid-lesson via the top-bar 🎒 button */}
      <HomeworkPanel
        hub={hub}
        pack={homeworkPack}
        open={isHomeworkOpen}
        onClose={() => setIsHomeworkOpen(false)}
      />

      {/* In-Lesson Safety Net — supportive intro for the injected Confidence Builder. */}
      <ConfidenceBuilderIntro
        open={confidenceIntroOpen}
        onStart={() => setConfidenceIntroOpen(false)}
      />

      {/* Cycle 3 — Grit Reward (hub-specific success modal) */}
      <GritRewardModal
        open={!!gritReward}
        hub={hub as GritHub}
        variant="micro"
        failedTag={gritReward?.tag}
        refId={lessonId}
        onClose={() => setGritReward(null)}
      />
    </div>
  );
}

