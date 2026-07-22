import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ChatBubble from './ChatBubble';
import { accentFor } from './hubAccent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VocabularyImage } from '@/components/ui/VocabularyImage';
import { getHubPool, resolveSkill, resolveScoreSkill, taskInstructionKeyFor, type Hub, type BankQuestion } from './questionBanks';
import {
  MAX_ITEMS,
  initAdaptiveState,
  nextAdaptiveItem,
  applyAdaptiveAnswer,
  shouldStopAdaptive,
  type AdaptiveState,
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
}

type Question = BankQuestion;

interface TestPhaseProps {
  age: number;
  hub?: Hub;
  onComplete: (results: TestResult[]) => void;
}

const TestPhase = ({ age, hub, onComplete }: TestPhaseProps) => {
  const { t } = useTranslation();
  // Strict age brackets: 4-9 → playground, 10-17 → academy, 18+ → professional.
  const resolvedHub: Hub = hub ?? (age > 0 && age < 10 ? 'playground' : age >= 18 ? 'professional' : 'academy');
  const isPlayground = resolvedHub === 'playground';
  const pool = useMemo(() => getHubPool(resolvedHub), [resolvedHub]);
  const accent = accentFor(resolvedHub);

  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState>(() => initAdaptiveState());
  const [current, setCurrent] = useState<{ item: BankQuestion; index: number } | null>(
    () => nextAdaptiveItem(pool, resolvedHub, initAdaptiveState()),
  );
  const [results, setResults] = useState<TestResult[]>([]);
  const [phase, setPhase] = useState<'typing' | 'answering' | 'feedback'>('typing');
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [messages, setMessages] = useState<Array<{ role: 'guide' | 'user'; text: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Listening question state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentQIndex = current?.index ?? -1;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, phase]);

  // Reset listening lock whenever the question advances
  useEffect(() => {
    setHasPlayedOnce(false);
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

    const FAILURE_MSG = 'Failed to load audio. Please check your connection or try again.';
    setIsLoadingAudio(true);

    try {
      let url = audioCacheRef.current.get(currentQIndex);
      if (!url) {
        // Bypass supabase.functions.invoke() because it can mis-parse binary
        // audio responses as JSON. Direct fetch guarantees a clean blob.
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
        const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token ?? SUPABASE_KEY;

        const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ text: q.audio_script, voiceId: q.voice_id }),
        });

        const contentType = response.headers.get('content-type') || '';
        console.log('[Placement audio] response', {
          questionIndex: currentQIndex,
          status: response.status,
          contentType,
        });

        if (!response.ok || contentType.includes('application/json')) {
          // Edge function returned a JSON error payload (or HTTP failure).
          let msg = FAILURE_MSG;
          try {
            const payload = await response.json();
            console.error('[Placement audio] error payload', { questionIndex: currentQIndex, payload });
            if (typeof payload?.error === 'string') msg = payload.error;
          } catch {
            /* ignore parse error */
          }
          throw new Error(msg);
        }

        const blob = await response.blob();
        if (!blob || blob.size === 0) {
          console.error('[Placement audio] empty blob', { questionIndex: currentQIndex });
          throw new Error(FAILURE_MSG);
        }

        // Force the MIME type to audio/mpeg in case the server omitted it.
        const audioBlob = blob.type.startsWith('audio/')
          ? blob
          : new Blob([blob], { type: 'audio/mpeg' });

        url = URL.createObjectURL(audioBlob);
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
        toast.error(FAILURE_MSG);
      };

      try {
        await audio.play();
        setHasPlayedOnce(true);
      } catch (playErr) {
        console.error('[Placement audio] play() rejected', { questionIndex: currentQIndex, voiceId: q.voice_id, err: playErr });
        setIsPlaying(false);
        setIsLoadingAudio(false);
        toast.error(FAILURE_MSG);
      }
    } catch (err) {
      console.error('[Placement audio]', { questionIndex: currentQIndex, voiceId: q.voice_id, err });
      setIsPlaying(false);
      setIsLoadingAudio(false);
      const msg = err instanceof Error && err.message ? err.message : FAILURE_MSG;
      toast.error(msg);
    }
  };

  const currentQuestion = current?.item;

  const handleAnswer = (index: number) => {
    if (phase !== 'answering' || !current) return;
    setSelectedAnswer(index);

    const { item, index: poolIndex } = current;
    const isCorrect = index === item.correctIndex;
    const result: TestResult = {
      questionIndex: poolIndex,
      selectedOption: index,
      correctOption: item.correctIndex,
      isCorrect,
      difficulty: item.difficulty,
      targetLevel: item.targetLevel,
      skill: resolveScoreSkill(item, resolvedHub),
    };
    setResults(prev => [...prev, result]);
    setMessages(prev => [...prev, { role: 'user', text: item.options[index] }]);
    setAdaptiveState(prev => applyAdaptiveAnswer(prev, item, poolIndex, resolvedHub, isCorrect));
    setPhase('feedback');
  };

  const handleFeedbackComplete = () => {
    if (!current) return;
    const isCorrect = selectedAnswer === current.item.correctIndex;
    const fb = isCorrect ? current.item.feedback.correct : current.item.feedback.incorrect;
    setMessages(prev => [...prev, { role: 'guide', text: fb }]);

    if (shouldStopAdaptive(adaptiveState, resolvedHub)) {
      setTimeout(() => onComplete(results), 600);
      return;
    }
    const nextPick = nextAdaptiveItem(pool, resolvedHub, adaptiveState);
    if (!nextPick) {
      setTimeout(() => onComplete(results), 600);
      return;
    }
    setSelectedAnswer(-1);
    setCurrent(nextPick);
    setPhase('typing');
  };

  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;
  const progressPct = Math.round((results.length / MAX_ITEMS) * 100);

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar (15 dots can crowd; show a slim bar + count for the CEFR set) */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between text-[11px] text-white/60 mb-1.5">
          <span className="font-medium tracking-wide">
            {isPlayground ? t('placement.progress.question') : t('placement.progress.cefr')} {Math.min(results.length + 1, MAX_ITEMS)} / {MAX_ITEMS}
          </span>
          {!isPlayground && currentQuestion && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/70 font-semibold">
              {currentQuestion.targetLevel}
            </span>
          )}
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
                  setMessages(prev => [...prev, { role: 'guide', text: currentQuestion.question }]);
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
                message={isCorrect ? currentQuestion.feedback.correct : currentQuestion.feedback.incorrect}
                hub={resolvedHub}
                animate
                onTypingComplete={handleFeedbackComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 'answering' && currentQuestion && (
          <motion.div
            key={`opts-${currentQIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3 mt-2"
          >
            {(() => {
              const skill = resolveSkill(currentQuestion);
              const showImage = skill === 'vocabulary' && !!currentQuestion.imagePrompt;
              const showAudio = skill === 'listening' && !!currentQuestion.audio_script;
              const showReading = skill === 'reading' && !!currentQuestion.readingPassage;
              return (
                <>
                  {showReading && (
                    <div className="w-full mb-4 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 text-white/90 text-sm leading-relaxed whitespace-pre-line">
                      {currentQuestion.readingPassage}
                    </div>
                  )}
                  {showImage && (
                    <div className="w-full flex justify-center mb-4 animate-fade-in">
                      <VocabularyImage
                        prompt={currentQuestion.imagePrompt!}
                        alt="Question visual"
                        style={isPlayground ? 'kawaii-chibi' : 'flat2d'}
                        aspectRatio="1:1"
                        testSafe
                        className="max-w-[200px] max-h-48 object-contain rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm"
                      />
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
                      {!hasPlayedOnce && (
                        <p className="text-white/60 text-xs">{t('placement.audio.hint')}</p>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt, i) => {
                const lockedByListening = !!currentQuestion.audio_script && !hasPlayedOnce;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                    whileHover={lockedByListening ? undefined : { scale: 1.02 }}
                    whileTap={lockedByListening ? undefined : { scale: 0.97 }}
                    onClick={() => !lockedByListening && handleAnswer(i)}
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
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestPhase;
