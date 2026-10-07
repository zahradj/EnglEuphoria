import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatBubble from './ChatBubble';
import { accentFor } from './hubAccent';
import { placementClipUrl } from './placementAudio';
import { placementVoiceForHub } from './placementLines';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getHubPool, resolveSkill, resolveScoreSkill, taskInstructionKeyFor, type Hub, type BankQuestion } from './questionBanks';
import {
  maxItemsFor,
  initAdaptiveState,
  nextAdaptiveItem,
  applyAdaptiveAnswer,
  shouldStopAdaptive,
  summarizeAdaptive,
  shuffledOrder,
  type AdaptiveState,
  type PlacementSummary,
} from './adaptiveEngine';

export interface TestResult {
  questionIndex: number;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
  difficulty: number;
  targetLevel?: string;
  /** The student_skills.skill_name this answer scores toward (see
   *  resolveScoreSkill) — lets completeTest() persist a real per-skill
   *  breakdown instead of one overall score copied onto every category. */
  skill: string;
  /** The bank item's stable id (for later item analysis). */
  itemId?: string;
  /** How long the student took on this question (milliseconds), from the moment the options appeared. */
  responseMs?: number;
  /** The student pressed "I'm not sure". */
  unsure?: boolean;
  /** Answered implausibly fast for this kind of question (likely a guess); earns reduced credit. */
  fast?: boolean;
}

/** Fastest believable time to read and answer, by kind of question. Faster than this is treated as a guess. */
function fastLimitMs(q: BankQuestion): number {
  if (q.readingPassage) return 3500;
  if (q.audio_script) return 1500;
  return 1200;
}

type Question = BankQuestion;

interface TestPhaseProps {
  age: number;
  hub?: Hub;
  onComplete: (results: TestResult[], summary: PlacementSummary) => void;
}

const TestPhase = ({ age, hub, onComplete }: TestPhaseProps) => {
  const { t } = useTranslation();
  // Strict age brackets: 4-9 → playground, 10-17 → academy, 18+ → professional.
  const resolvedHub: Hub = hub ?? (age > 0 && age < 10 ? 'playground' : age >= 18 ? 'professional' : 'academy');
  const isPlayground = resolvedHub === 'playground';
  const pool = useMemo(() => getHubPool(resolvedHub), [resolvedHub]);
  const accent = accentFor(resolvedHub);

  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState>(() => initAdaptiveState(resolvedHub));
  const [current, setCurrent] = useState<{ item: BankQuestion; index: number } | null>(
    () => nextAdaptiveItem(pool, resolvedHub, initAdaptiveState(resolvedHub)),
  );
  const [results, setResults] = useState<TestResult[]>([]);
  const [phase, setPhase] = useState<'typing' | 'answering' | 'feedback'>('typing');
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const answeringSince = useRef<number>(0);
  const [messages, setMessages] = useState<Array<{ role: 'guide' | 'user'; text: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  // Listening question state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  // True when this question's sound could not be played; answers then unlock so the test can always be finished.
  const [audioFailed, setAudioFailed] = useState(false);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentQIndex = current?.index ?? -1;
  // Options are shown in a random order: the bank's right answers are not evenly spread across positions.
  const displayOrder = useMemo(
    () => (current?.item.fixedOrder ? (current.item.options.map((_, i) => i)) : shuffledOrder(current?.item.options.length ?? 4)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentQIndex],
  );

  useEffect(() => {
    // While the student answers, show the START of the question (instruction, question, text, options), not the bottom
    // of the page: scrolling to the bottom pushed the instruction and the question itself out of sight.
    if (phase === 'answering' && answerRef.current) {
      answerRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, phase]);

  // Reset listening lock whenever the question advances
  useEffect(() => {
    setHasPlayedOnce(false);
    setAudioFailed(false);
    setIsPlaying(false);
    setIsLoadingAudio(false);
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  }, [currentQIndex]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioCacheRef.current.clear();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = async () => {
    const q = current?.item;
    if (!q?.audio_script || isPlaying || isLoadingAudio) return;

    // Friendly and non-technical: a provider error must never reach a student's screen.
    const FAILURE_MSG = "Sound isn't available right now. Choose the answer you think is best.";
    setIsLoadingAudio(true);

    try {
      let url = audioCacheRef.current.get(currentQIndex);
      if (!url) {
        // Saved clip only (made once by the bake script). No live speech generation, ever.
        const clip = await placementClipUrl(q.audio_script, placementVoiceForHub(resolvedHub));
        if (!clip) {
          console.warn('[Placement audio] no saved clip for this question', { questionIndex: currentQIndex });
          setIsPlaying(false);
          setIsLoadingAudio(false);
          // Never trap the student behind a listening lock they cannot open.
          setAudioFailed(true);
          toast.message(FAILURE_MSG);
          return;
        }
        url = clip;
        audioCacheRef.current.set(currentQIndex, url);
      }

      const audio = new Audio(url);
      currentAudioRef.current = audio;

      audio.addEventListener('canplaythrough', () => {
        setIsLoadingAudio(false);
        setIsPlaying(true);
      }, { once: true });

      audio.onended = () => {
        setIsPlaying(false);
        setHasPlayedOnce(true);
      };

      audio.onerror = (e) => {
        console.error('[Placement audio] element error', { questionIndex: currentQIndex, error: e });
        setIsPlaying(false);
        setIsLoadingAudio(false);
        setAudioFailed(true);
        toast.message(FAILURE_MSG);
      };

      try {
        await audio.play();
        setHasPlayedOnce(true);
      } catch (playErr) {
        console.error('[Placement audio] play() rejected', { questionIndex: currentQIndex, err: playErr });
        setIsPlaying(false);
        setIsLoadingAudio(false);
        // Autoplay/permission refusal is not a missing clip: let them tap play again, but don't trap them.
        setAudioFailed(true);
        toast.message(FAILURE_MSG);
      }
    } catch (err) {
      console.error('[Placement audio]', { questionIndex: currentQIndex, err });
      setIsPlaying(false);
      setIsLoadingAudio(false);
      setAudioFailed(true);
      toast.message(FAILURE_MSG);
    }
  };

  const currentQuestion = current?.item;

  /** `index` is the position in the bank's own option order (-1 with `unsure`). */
  const handleAnswer = (index: number, opts: { unsure?: boolean } = {}) => {
    if (phase !== 'answering' || !current) return;
    setSelectedAnswer(index);

    const { item, index: poolIndex } = current;
    const unsure = !!opts.unsure;
    const isCorrect = !unsure && index === item.correctIndex;
    const responseMs = answeringSince.current ? Date.now() - answeringSince.current : undefined;
    const fast = !unsure && responseMs !== undefined && responseMs < fastLimitMs(item);
    const result: TestResult = {
      questionIndex: poolIndex,
      selectedOption: index,
      correctOption: item.correctIndex,
      isCorrect,
      difficulty: item.difficulty,
      targetLevel: item.targetLevel,
      skill: resolveScoreSkill(item, resolvedHub),
      itemId: item.id,
      responseMs,
      unsure: unsure || undefined,
      fast: fast || undefined,
    };
    setResults(prev => [...prev, result]);
    setMessages(prev => [
      ...prev,
      { role: 'guide', text: item.question },
      { role: 'user', text: unsure ? t('placement.action.notSure', "I'm not sure") : item.options[index] },
    ]);
    setAdaptiveState(prev => applyAdaptiveAnswer(prev, item, poolIndex, resolvedHub, isCorrect, { unsure, fast }));
    setPhase('feedback');
  };

  // Placement is not a lesson: outside the kids' hub the reply to an answer is neutral, so the test neither teaches
  // the answer to the next question nor tells the student how they are doing.
  const feedbackFor = (item: BankQuestion, correct: boolean) =>
    isPlayground ? (correct ? item.feedback.correct : item.feedback.incorrect) : t('placement.feedback.neutral', 'Thanks! Next one.');

  const finish = (finalResults: TestResult[], finalState: AdaptiveState) => {
    const summary = summarizeAdaptive(finalState, resolvedHub, {
      notSureCount: finalResults.filter((r) => r.unsure).length,
      fastCount: finalResults.filter((r) => r.fast).length,
    });
    setTimeout(() => onComplete(finalResults, summary), 600);
  };

  const handleFeedbackComplete = () => {
    if (!current) return;
    const isCorrect = selectedAnswer === current.item.correctIndex;
    setMessages(prev => [...prev, { role: 'guide', text: feedbackFor(current.item, isCorrect) }]);

    if (shouldStopAdaptive(adaptiveState, resolvedHub)) {
      finish(results, adaptiveState);
      return;
    }
    const nextPick = nextAdaptiveItem(pool, resolvedHub, adaptiveState);
    if (!nextPick) {
      finish(results, adaptiveState);
      return;
    }
    setSelectedAnswer(-1);
    setCurrent(nextPick);
    setPhase('typing');
  };

  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;
  const maxItems = maxItemsFor(resolvedHub);
  const progressPct = Math.round((results.length / maxItems) * 100);

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar (15 dots can crowd; show a slim bar + count for the CEFR set) */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between text-[11px] text-white/60 mb-1.5">
          <span className="font-medium tracking-wide">
            {isPlayground ? t('placement.progress.question') : t('placement.progress.cefr')} {Math.min(results.length + 1, maxItems)} / {maxItems}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${accent.progress}`}
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <ChatBubble key={`msg-${i}`} role={msg.role} message={msg.text} hub={resolvedHub} />
        ))}

        <AnimatePresence mode="wait">
          {phase === 'typing' && currentQuestion && (
            <motion.div
              key={`q-wrap-${currentQIndex}`}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Localized meta-instruction (ONLY translated text). Question stays English. */}
              <div
                dir="auto"
                className="mb-2 inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm"
              >
                {t(taskInstructionKeyFor(currentQuestion))}
              </div>
              <ChatBubble
                key={`q-${currentQIndex}`}
                role="guide"
                message={currentQuestion.question}
                hub={resolvedHub}
                animate
                onTypingComplete={() => {
                  answeringSince.current = Date.now();
                  setPhase('answering');
                }}
              />
            </motion.div>
          )}

          {phase === 'feedback' && currentQuestion && (
            <motion.div
              key={`fb-wrap-${currentQIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <ChatBubble
                key={`fb-${currentQIndex}`}
                role="guide"
                message={feedbackFor(currentQuestion, isCorrect)}
                hub={resolvedHub}
                animate
                onTypingComplete={handleFeedbackComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'answering' && currentQuestion && (
          <motion.div
            ref={answerRef}
            key={`opts-${currentQIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3 mt-2"
          >
            {/* The instruction stays on screen while the student answers (it used to vanish when the options appeared). */}
            <div
              dir="auto"
              className="inline-block rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm"
            >
              {t(taskInstructionKeyFor(currentQuestion))}
            </div>
            {/* The question is shown together with its options, so the student always sees what is being asked. */}
            <ChatBubble role="guide" message={currentQuestion.question} hub={resolvedHub} />
            {(() => {
              const skill = resolveSkill(currentQuestion);
              const showAudio = skill === 'listening' && !!currentQuestion.audio_script;
              const showReading = skill === 'reading' && !!currentQuestion.readingPassage;
              return (
                <>
                  {showReading && (
                    <div className="w-full mb-4 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 text-white/90 text-sm leading-relaxed whitespace-pre-line">
                      {currentQuestion.readingPassage}
                    </div>
                  )}
                  {showAudio && (
                    <div className="flex flex-col items-center gap-2 mb-1">
                      <button
                        type="button"
                        onClick={handlePlayAudio}
                        disabled={isPlaying || isLoadingAudio}
                        aria-label="Play listening prompt"
                        className={`bg-gradient-to-r ${accent.cta} text-white rounded-2xl px-6 py-3 font-semibold flex items-center gap-2 shadow-lg ${accent.ctaShadow} hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-wait`}
                      >
                        {isLoadingAudio ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t('placement.action.loading')}
                          </>
                        ) : isPlaying ? (
                          <>
                            <Volume2 className="w-5 h-5 animate-pulse" />
                            {t('placement.action.playing')}
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-5 h-5" />
                            {hasPlayedOnce ? t('placement.action.playAgain') : t('placement.action.playAudio')}
                          </>
                        )}
                      </button>
                      {!hasPlayedOnce && !audioFailed && (
                        <p className="text-white/60 text-xs">{t('placement.audio.hint')}</p>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayOrder.map((origIdx, i) => {
                const opt = currentQuestion.options[origIdx];
                const lockedByListening = !!currentQuestion.audio_script && !hasPlayedOnce && !audioFailed;
                return (
                  <motion.button
                    key={origIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    whileHover={lockedByListening ? undefined : { scale: 1.02 }}
                    whileTap={lockedByListening ? undefined : { scale: 0.97 }}
                    onClick={() => !lockedByListening && handleAnswer(origIdx)}
                    disabled={lockedByListening}
                    aria-disabled={lockedByListening}
                    className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white text-left text-sm transition-colors shadow-[0_4px_16px_rgba(0,0,0,0.2)] ${
                      lockedByListening
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-white/20'
                    }`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
            {!isPlayground && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => handleAnswer(-1, { unsure: true })}
                  disabled={!!currentQuestion.audio_script && !hasPlayedOnce && !audioFailed}
                  className="text-xs text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white/90 disabled:opacity-40"
                >
                  {t('placement.action.notSure', "I'm not sure")}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestPhase;
