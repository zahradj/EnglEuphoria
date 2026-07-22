import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Volume2, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import type { TestResult } from './TestPhase';
import {
  loadPlaygroundPlacementContent,
  DEFAULT_PLAYGROUND_CONTENT,
  type PlaygroundPlacementContent,
  type PlacementQuestion,
} from '@/placement/playgroundContent';

interface PlaygroundPlacementPhaseProps {
  onComplete: (results: TestResult[]) => void;
}

async function speakLive(text: string, voiceId: string): Promise<HTMLAudioElement | null> {
  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: { text, voiceId, speed: 0.95 },
    });
    if (error) throw error;
    const blob =
      data instanceof Blob
        ? data
        : new Blob([data as ArrayBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    return audio;
  } catch (e) {
    console.warn('[placement] TTS failed:', e);
    return null;
  }
}

export const PlaygroundPlacementPhase = ({ onComplete }: PlaygroundPlacementPhaseProps) => {
  const [content, setContent] = useState<PlaygroundPlacementContent>(DEFAULT_PLAYGROUND_CONTENT);
  const [loading, setLoading] = useState(true);
  // Pip starts talking immediately — no intro gate. The student already tapped
  // "Do the placement test" on the previous screen, which counts as a user
  // gesture for browser autoplay.
  const [pipStarted] = useState(true);
  const [pipPlaying, setPipPlaying] = useState(false);

  const [sectionIdx, setSectionIdx] = useState<0 | 1>(0);
  const [showSectionCard, setShowSectionCard] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load editable content from DB (falls back to defaults).
  useEffect(() => {
    loadPlaygroundPlacementContent().then((c) => {
      setContent(c);
      setLoading(false);
    });
  }, []);

  const section = content.sections[sectionIdx];
  const questions = section?.questions ?? [];
  const current: PlacementQuestion | undefined = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex + (selectedIndex !== null ? 1 : 0)) / Math.max(total, 1)) * 100;
  const encouragement = useMemo(() => {
    const list = content.pip.encouragements;
    return list[currentIndex % list.length] ?? '';
  }, [currentIndex, content.pip.encouragements]);

  // Pip companion: play this question's audio. Uses cached URL when available.
  const playForQuestion = async (q: PlacementQuestion) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPipPlaying(true);
    let audio: HTMLAudioElement | null = null;
    if (q.audioUrl) {
      audio = new Audio(q.audioUrl);
    } else {
      audio = await speakLive(q.audioPrompt, content.pip.voiceId);
    }
    if (audio) {
      audio.onended = () => setPipPlaying(false);
      audio.onerror = () => setPipPlaying(false);
      audioRef.current = audio;
      try {
        await audio.play();
      } catch {
        setPipPlaying(false);
      }
    } else {
      setPipPlaying(false);
    }
  };

  // Auto-play on every question change AFTER the intro finishes. The very
  // first question is kicked off by introAudio.onended below to avoid
  // overlapping with the welcome line.
  const introDoneRef = useRef(false);
  useEffect(() => {
    if (!pipStarted || showSectionCard || !current) return;
    if (!introDoneRef.current && currentIndex === 0 && sectionIdx === 0) return;
    void playForQuestion(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipStarted, currentIndex, sectionIdx, showSectionCard, current?.id]);

  const replay = () => current && playForQuestion(current);

  // Play Pip's welcome intro once on first mount (after content loads). The
  // per-question auto-play effect picks up the first question's audio after
  // the intro finishes.
  const introPlayedRef = useRef(false);
  useEffect(() => {
    if (loading || introPlayedRef.current) return;
    introPlayedRef.current = true;
    (async () => {
      const introAudio = content.pip.introAudioUrl
        ? new Audio(content.pip.introAudioUrl)
        : await speakLive(content.pip.intro, content.pip.voiceId);
      if (!introAudio) return;
      setPipPlaying(true);
      audioRef.current = introAudio;
      introAudio.onended = () => {
        setPipPlaying(false);
        introDoneRef.current = true;
        if (current) void playForQuestion(current);
      };
      introAudio.onerror = () => setPipPlaying(false);
      try { await introAudio.play(); } catch { setPipPlaying(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleSelect = (optionIndex: number) => {
    if (selectedIndex !== null || !current) return;
    setSelectedIndex(optionIndex);

    const isCorrect = optionIndex === current.correctIndex;
    const offset = sectionIdx === 0 ? 0 : content.sections[0].questions.length;
    const result: TestResult = {
      questionIndex: offset + currentIndex,
      selectedOption: optionIndex,
      correctOption: current.correctIndex,
      isCorrect,
      difficulty: current.difficulty,
      targetLevel: current.targetLevel,
      // Playground doesn't render a per-skill radar (see DashboardHome.tsx),
      // so there's no student_skills mapping to score toward here.
      skill: 'general',
    };
    const updatedResults = [...results, result];
    setResults(updatedResults);

    setTimeout(() => {
      if (currentIndex + 1 >= total) {
        if (sectionIdx === 0) {
          const sec1 = updatedResults.slice(0, content.sections[0].questions.length);
          const correct = sec1.filter((r) => r.isCorrect).length;
          const ratio = correct / Math.max(content.sections[0].questions.length, 1);
          if (ratio >= content.passThreshold && content.sections[1]) {
            setShowSectionCard(true);
          } else {
            onComplete(updatedResults);
          }
        } else {
          onComplete(updatedResults);
        }
      } else {
        setCurrentIndex(currentIndex + 1);
        setSelectedIndex(null);
      }
    }, 1100);
  };

  const beginSection2 = () => {
    setShowSectionCard(false);
    setSectionIdx(1);
    setCurrentIndex(0);
    setSelectedIndex(null);
  };

  // -------- render -----------------------------------------------------------
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Section transition card.
  if (showSectionCard) {
    const card = content.sections[1] ?? content.sections[0];
    return (
      <div className="h-full flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-orange-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">{card.cardTitle}</h3>
          <p className="text-slate-600 mb-6">{card.cardBody}</p>
          <Button
            size="lg"
            onClick={beginSection2}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl w-full h-12"
          >
            Start Section 2 <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-slate-600">
        No questions configured.
      </div>
    );
  }

  // Intro gate removed — Pip auto-speaks as soon as the test mounts. The
  // pipStarted flag remains true throughout so per-question audio fires.
  void pipStarted;

  return (
    <div className="h-full flex flex-col">
      {/* Progress bar — kid-friendly stars */}
      <div className="px-6 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < currentIndex || (i === currentIndex && selectedIndex !== null)
                    ? 'text-amber-500 fill-amber-400'
                    : 'text-amber-200'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-600 text-xs font-semibold">
            Section {sectionIdx + 1} · {currentIndex + 1} / {total}
          </span>
        </div>
        <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 pb-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${sectionIdx}-${currentIndex}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            <div className="text-center mt-4 mb-6 flex flex-col items-center gap-3">
              {/* Pip companion bubble — always visible during the test */}
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-full pl-2 pr-4 py-1.5 shadow-sm">
                <PipBadge playing={pipPlaying} size="sm" avatarUrl={content.pip.avatarUrl} label={content.pip.label} />
                <span className="text-sm text-slate-700 font-medium leading-snug max-w-[260px] sm:max-w-none">
                  {current.audioPrompt}
                </span>
                <button
                  type="button"
                  onClick={replay}
                  aria-label="Play audio"
                  className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                {current.prompt}
              </h2>
            </div>

            {(() => {
              const uniqueImages = new Set(current.options.map((o) => o.image));
              const showLabels = uniqueImages.size < current.options.length;
              return (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto w-full" key="opts">
                  {current.options.map((option, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        onClick={() => handleSelect(idx)}
                        disabled={selectedIndex !== null}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
                        whileHover={selectedIndex === null ? { scale: 1.05, y: -5 } : undefined}
                        whileTap={selectedIndex === null ? { scale: 0.95 } : undefined}
                        aria-label={option.label}
                        aria-pressed={isSelected}
                        className={`relative aspect-square rounded-2xl overflow-hidden bg-white border shadow-md transition-shadow duration-200 ${
                          isSelected
                            ? 'border-orange-300 ring-4 ring-orange-400 shadow-lg'
                            : selectedIndex !== null
                              ? 'border-slate-200 opacity-70'
                              : 'border-slate-200 hover:shadow-lg'
                        }`}
                      >
                        <img
                          src={option.image}
                          alt={option.label}
                          loading="lazy"
                          width={512}
                          height={512}
                          className="absolute inset-0 w-full h-full object-contain p-4 select-none pointer-events-none"
                          draggable={false}
                        />
                        {showLabels && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 max-w-[90%]">
                            <span className="block bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-slate-800 font-semibold text-xs sm:text-sm text-center shadow-sm whitespace-nowrap overflow-hidden text-ellipsis">
                              {option.label}
                            </span>
                          </div>
                        )}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center shadow-lg"
                          >
                            <Sparkles className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              );
            })()}

            <AnimatePresence>
              {selectedIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 mx-auto max-w-sm"
                >
                  <div className="rounded-2xl px-5 py-3 text-center font-semibold bg-orange-50 border border-orange-200 text-orange-700">
                    {encouragement}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Pip badge ---------------------------------------------------------------
function PipBadge({
  playing, size = 'md', avatarUrl, label,
}: { playing: boolean; size?: 'sm' | 'md'; avatarUrl?: string | null; label?: string }) {
  const dim = size === 'sm' ? 'w-10 h-10 text-xl' : 'w-16 h-16 text-3xl';
  return (
    <div
      className={`relative ${dim} rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center shadow-md overflow-hidden`}
      aria-label={label ?? 'Companion'}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <span aria-hidden>🦊</span>
      )}
      {playing && (
        <span className="absolute inset-0 rounded-full ring-2 ring-orange-300 animate-ping" aria-hidden />
      )}
    </div>
  );
}

export default PlaygroundPlacementPhase;
