import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Star, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playLetterName, playLetterPhonic } from '@/content/playground-library/unit1/audio';
import { placementClipUrl } from '../placementAudio';
import type { TestResult } from '../TestPhase';
import type { PlacementSummary } from '../adaptiveEngine';
import { KIDS_BANK, KIDS_CHEERS, KIDS_LITERACY_PRACTICE, KIDS_PRACTICE, KIDS_SCRIPT, type KidsItem } from './kidsBank';
import { applyAnswer, initStage, nextItem, shouldStopStage, summarizeKids, STAGE_CONFIG, type StageState } from './kidsEngine';
import { OptionArt, SceneArt } from './SceneArt';

interface Props {
  onComplete: (results: TestResult[], summary: PlacementSummary) => void;
}

type Phase = 'welcome' | 'practice' | 'listen' | 'lettersIntro' | 'literacyPractice' | 'literacy';

const PIP_AVATAR = '/mascots/pip-fox-welcome.png';
/** A tap earlier than this after the picture appears is treated as a guess (the instruction was not heard). */
const FAST_MS = 900;

/**
 * Playground placement: Pip speaks every instruction (saved clips only) and the child taps a picture, letter or word.
 * No reading is needed until the literacy section, and that section only appears after the listening section.
 * Stars show effort, never right or wrong; a wrong tap makes no sound. A grown-up is asked to sit with the child.
 */
export default function KidsPlacementPhase({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [item, setItem] = useState<KidsItem | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [pipTalking, setPipTalking] = useState(false);
  const [stars, setStars] = useState(0);
  const [cheer, setCheer] = useState(false);

  const listenRef = useRef<StageState>(initStage('listen'));
  const literacyRef = useRef<StageState>(initStage('literacy'));
  const resultsRef = useRef<TestResult[]>([]);
  const counters = useRef({ unsure: 0, fast: 0, practiceIdx: 0 });
  const shownAt = useRef(0);
  const promptDone = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runId = useRef(0);
  const finished = useRef(false);

  // ---------------------------------------------------------------- audio (saved clips only)
  const stopAudio = useCallback(() => {
    runId.current += 1;
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  const playLine = useCallback(async (line: string, myRun: number): Promise<void> => {
    const url = await placementClipUrl(line, 'pip');
    if (!url || myRun !== runId.current) return;
    await new Promise<void>((resolve) => {
      const a = new Audio(url);
      audioRef.current = a;
      a.onended = () => resolve();
      a.onerror = () => resolve();
      a.play().catch(() => resolve());
    });
  }, []);

  const speak = useCallback(async (it: KidsItem) => {
    stopAudio();
    const myRun = runId.current;
    promptDone.current = false;
    setPipTalking(true);
    try {
      await playLine(it.line, myRun);
      if (myRun === runId.current && it.clip) {
        try {
          await (it.clip.type === 'name' ? playLetterName(it.clip.letter) : playLetterPhonic(it.clip.letter));
        } catch {
          /* a missing recording means silence, never another voice */
        }
      }
    } finally {
      if (myRun === runId.current) {
        promptDone.current = true;
        setPipTalking(false);
      }
    }
  }, [playLine, stopAudio]);

  const sayOnly = useCallback(async (line: string) => {
    stopAudio();
    const myRun = runId.current;
    setPipTalking(true);
    await playLine(line, myRun);
    if (myRun === runId.current) setPipTalking(false);
  }, [playLine, stopAudio]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  // Pip reads out each new item as soon as it appears.
  useEffect(() => {
    if (!item) return;
    shownAt.current = Date.now();
    const t = setTimeout(() => void speak(item), 350);
    return () => clearTimeout(t);
  }, [item, speak]);

  // ---------------------------------------------------------------- flow
  const showStageItem = useCallback((stage: 'listen' | 'literacy') => {
    const st = stage === 'listen' ? listenRef.current : literacyRef.current;
    const next = nextItem(KIDS_BANK, st);
    setSelected(null);
    setItem(next);
    return next;
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    stopAudio();
    const summary = summarizeKids(listenRef.current, literacyRef.current, { unsureCount: counters.current.unsure, fastCount: counters.current.fast });
    void sayOnly(KIDS_SCRIPT.finish);
    setTimeout(() => onComplete(resultsRef.current, summary as unknown as PlacementSummary), 1800);
  }, [onComplete, sayOnly, stopAudio]);

  const start = () => {
    setPhase('practice');
    counters.current.practiceIdx = 0;
    setItem(KIDS_PRACTICE[0]);
  };

  const goLiteracy = useCallback(() => {
    literacyRef.current = initStage('literacy', listenRef.current.theta);
    setPhase('literacyPractice');
    setSelected(null);
    setItem(KIDS_LITERACY_PRACTICE);
  }, []);

  const afterPractice = useCallback(() => {
    if (phase === 'practice') {
      const idx = counters.current.practiceIdx + 1;
      if (idx < KIDS_PRACTICE.length) {
        counters.current.practiceIdx = idx;
        setSelected(null);
        setItem(KIDS_PRACTICE[idx]);
        return;
      }
      setPhase('listen');
      void showStageItem('listen');
      return;
    }
    // literacy practice done
    setPhase('literacy');
    void showStageItem('literacy');
  }, [phase, showStageItem]);

  const pick = (index: number, unsure = false) => {
    if (!item || selected !== null) return;
    setSelected(index);
    const correct = !unsure && index === item.correct;

    // ---- practice: never scored; a wrong tap just gets another go
    if (item.practice) {
      if (!correct) {
        void sayOnly(KIDS_SCRIPT.tryAgain);
        setTimeout(() => setSelected(null), 900);
        return;
      }
      setCheer(true);
      setTimeout(() => {
        setCheer(false);
        afterPractice();
      }, 1100);
      return;
    }

    // ---- scored
    const responseMs = Date.now() - shownAt.current;
    const fast = !unsure && (responseMs < FAST_MS || !promptDone.current);
    if (unsure) counters.current.unsure += 1;
    if (fast) counters.current.fast += 1;
    const stageRef = item.stage === 'listen' ? listenRef : literacyRef;
    stageRef.current = applyAnswer(stageRef.current, item, correct, { unsure, fast });
    resultsRef.current = [
      ...resultsRef.current,
      {
        questionIndex: resultsRef.current.length,
        selectedOption: unsure ? -1 : index,
        correctOption: item.correct,
        isCorrect: correct,
        difficulty: item.difficulty,
        targetLevel: item.level,
        skill: item.stage === 'listen' ? 'listening' : 'literacy',
        itemId: item.id,
        responseMs,
        unsure: unsure || undefined,
        fast: fast || undefined,
      },
    ];
    setStars((s) => s + 1);
    setCheer(true);
    stopAudio();

    const answered = stageRef.current.answeredIds.length;
    if (answered % 5 === 0) void sayOnly(KIDS_CHEERS[(answered / 5) % KIDS_CHEERS.length]);

    setTimeout(() => {
      setCheer(false);
      const st = stageRef.current;
      if (!shouldStopStage(st, KIDS_BANK)) {
        showStageItem(item.stage);
        return;
      }
      if (item.stage === 'listen') {
        setPhase('lettersIntro');
        setItem(null);
        setSelected(null);
        void sayOnly(KIDS_SCRIPT.lettersIntro);
        return;
      }
      finish();
    }, 1000);
  };

  // ---------------------------------------------------------------- render helpers
  const expectedTotal = STAGE_CONFIG.listen.maxItems + STAGE_CONFIG.literacy.maxItems;
  const starRow = useMemo(() => {
    const filled = Math.min(10, Math.round((stars / Math.max(expectedTotal * 0.75, 1)) * 10));
    return Array.from({ length: 10 }, (_, i) => i < filled);
  }, [stars, expectedTotal]);

  const pip = (
    <div className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-orange-300 bg-orange-100 shadow ${pipTalking ? 'animate-pulse' : ''}`}>
      <img src={PIP_AVATAR} alt="" className="h-full w-full object-cover" draggable={false} />
    </div>
  );

  // ---------------------------------------------------------------- screens
  if (phase === 'welcome') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 overflow-y-auto bg-gradient-to-b from-amber-50 to-orange-50 p-6 text-center">
        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-orange-300 bg-orange-100 shadow-lg">
          <img src={PIP_AVATAR} alt="Pip the fox" className="h-full w-full object-cover" draggable={false} />
        </div>
        <p className="max-w-sm text-base font-semibold text-slate-700">
          Please sit with your child. Pip will speak and your child taps the right picture. Wait for Pip to finish talking and let your child choose by themselves.
        </p>
        <Button
          size="lg"
          onClick={() => { start(); }}
          className="h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-10 text-xl font-bold text-white shadow-lg hover:from-orange-600 hover:to-amber-600"
        >
          <Volume2 className="mr-2 h-6 w-6" aria-hidden /> Start
        </Button>
      </div>
    );
  }

  if (phase === 'lettersIntro') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 overflow-y-auto bg-gradient-to-b from-amber-50 to-orange-50 p-6 text-center">
        {pip}
        <div className="flex gap-3 text-6xl font-extrabold text-orange-500" aria-hidden>
          <span>A</span><span>B</span><span>C</span>
        </div>
        <Button
          size="lg"
          onClick={goLiteracy}
          className="h-16 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-10 text-xl font-bold text-white shadow-lg"
        >
          <Star className="mr-2 h-6 w-6" aria-hidden /> Go
        </Button>
      </div>
    );
  }

  if (!item) return <div className="h-full bg-gradient-to-b from-amber-50 to-orange-50" />;

  const cols = item.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-3';
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="flex items-center gap-3 px-4 pb-1 pt-3">
        {pip}
        <div className="flex flex-1 flex-wrap items-center gap-1" aria-hidden>
          {starRow.map((on, i) => (
            <Star key={i} className={`h-5 w-5 ${on ? 'fill-amber-400 text-amber-500' : 'text-amber-200'}`} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => void speak(item)}
          aria-label="Listen again"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg active:scale-95"
        >
          <Volume2 className="h-7 w-7" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-4 pb-6 pt-2">
        {item.shown && (
          <div className="flex min-h-[7rem] w-full max-w-md items-center justify-center rounded-3xl border-4 border-amber-200 bg-white p-3 shadow-md">
            {item.shown.kind === 'word' && (
              <span className="text-7xl font-extrabold tracking-wide text-slate-800" style={{ fontFamily: "'Fredoka', 'Comic Sans MS', system-ui, sans-serif" }}>{item.shown.text}</span>
            )}
            {item.shown.kind === 'sentence' && (
              <span className="text-center text-3xl font-bold leading-snug text-slate-800" style={{ fontFamily: "'Fredoka', 'Comic Sans MS', system-ui, sans-serif" }}>{item.shown.text}</span>
            )}
            {item.shown.kind === 'picture' && <img src={item.shown.src} alt="" className="h-36 object-contain" draggable={false} />}
            {item.shown.kind === 'scene' && <SceneArt scene={item.shown.scene} className="h-40 w-52" />}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`grid w-full max-w-md gap-3 ${cols}`}
          >
            {item.options.map((opt, i) => {
              const isSel = selected === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => pick(i)}
                  aria-label={'label' in opt ? opt.label : opt.kind === 'letter' ? opt.text : opt.ok ? 'tick' : 'cross'}
                  className={`relative aspect-square w-full overflow-hidden rounded-3xl border-4 bg-white shadow-lg transition active:scale-95 ${
                    isSel ? 'border-orange-400 ring-4 ring-orange-300' : 'border-orange-100 hover:border-orange-300'
                  } ${selected !== null && !isSel ? 'opacity-60' : ''}`}
                >
                  <OptionArt option={opt} />
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {!item.practice && (
          <button
            type="button"
            disabled={selected !== null}
            onClick={() => pick(-1, true)}
            aria-label="I do not know"
            className="mt-1 flex items-center gap-2 rounded-full border-2 border-slate-200 bg-white/80 px-5 py-2 text-slate-500 shadow-sm active:scale-95"
          >
            <HelpCircle className="h-6 w-6" aria-hidden />
            <span className="text-sm font-semibold">?</span>
          </button>
        )}

        <AnimatePresence>
          {cheer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="pointer-events-none fixed inset-x-0 bottom-24 flex justify-center"
              aria-hidden
            >
              <Star className="h-16 w-16 fill-amber-300 text-amber-500 drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
