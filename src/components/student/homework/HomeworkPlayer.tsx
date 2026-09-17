/**
 * <HomeworkPlayer />
 * Smart, gamified, 3-step interactive homework runner.
 *
 * Activity 1 — Listen & Match  (TTS + tap matching, gates Activity 2)
 * Activity 2 — Sentence Scramble (click-to-arrange word tokens, gates Activity 3)
 * Activity 3 — Voice Challenge (Hold-to-Speak microphone, mock validation)
 *
 * On full completion: confetti + +50 XP + persists submission and bumps users.total_xp.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Volume2, Check, X, Mic, Sparkles, Trophy, Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { playElevenLabs } from '@/lib/elevenLabsAudio';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { JungleTheme } from '@/components/student/kids/JungleTheme';

type Hub = 'playground' | 'academy' | 'success';

interface RecognitionItem {
  audio_text: string;
  correct_answer: string;
  wrong_options: string[];
  /** word (lowercased) -> image path — lets a non-reading student match
   *  by picture instead of text. Undefined choices fall back to text. */
  choice_images?: Record<string, string>;
}
interface SyntaxItem {
  scrambled_words: string[];
  correct_order: string;
  word_images?: Record<string, string>;
  image?: string;
}
interface ProductionActivity {
  instructions?: string;
  prompt: string;
  target_words_to_detect?: string[];
  example_response?: string;
  image?: string;
}
interface HomeworkContent {
  activity_1_recognition: { instructions?: string; items: RecognitionItem[] };
  activity_2_syntax:       { instructions?: string; items: SyntaxItem[] };
  activity_3_production:   ProductionActivity;
  meta?: { hub?: Hub; title?: string; vocabulary?: string[]; lesson_id?: string | null };
}

interface Props {
  assignmentId: string;
  content: HomeworkContent;
  /** Called after successful completion (server already updated). */
  onComplete?: (newTotalXp: number) => void;
  /** True when this is a content-creator "try it out" preview (e.g. from
   *  the Playground Library), not a real student doing real homework —
   *  skips the homework_submissions insert and the users.total_xp bump
   *  so previewing a lesson's homework never writes fake completion data
   *  or fake XP onto the creator's own account. Everything else (the
   *  actual gameplay, the mascot, the completion screen) runs exactly the
   *  same either way. */
  previewMode?: boolean;
}

const HUB_THEME: Record<Hub, { primary: string; accent: string; ring: string; bg: string }> = {
  playground: { primary: 'bg-orange-500 hover:bg-orange-400', accent: 'text-orange-700', ring: 'ring-orange-300', bg: 'from-orange-50 to-yellow-50' },
  academy:    { primary: 'bg-indigo-600 hover:bg-indigo-500', accent: 'text-indigo-700', ring: 'ring-indigo-300', bg: 'from-indigo-50 to-purple-50' },
  success:    { primary: 'bg-emerald-600 hover:bg-emerald-500', accent: 'text-emerald-700', ring: 'ring-emerald-300', bg: 'from-emerald-50 to-teal-50' },
};

/** Speaks the given text — ElevenLabs is the exclusive engine, no native fallback. */
async function speak(text: string) {
  await playElevenLabs(text);
}

/** Strip simple punctuation so token comparisons are stable. */
const norm = (s: string) => s.replace(/[.,!?;:"']/g, '').trim().toLowerCase();

// ─── Activity 1: Listen & Match ──────────────────────────────────
function ListenMatch({ items, theme, onPass }: { items: RecognitionItem[]; theme: typeof HUB_THEME.playground; onPass: () => void }) {
  const [idx, setIdx] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const item = items[idx];
  const choices = useMemo(() => {
    const all = [item.correct_answer, ...(item.wrong_options || [])].slice(0, 4);
    // Stable shuffle via index
    return [...all].sort((a, b) => (a + idx).localeCompare(b + idx));
  }, [item, idx]);

  const handleClick = (choice: string) => {
    if (correct) return;
    if (norm(choice) === norm(item.correct_answer)) {
      setCorrect(choice);
      setScore((s) => s + 1);
      setTimeout(() => {
        if (idx + 1 >= items.length) onPass();
        else { setIdx(idx + 1); setCorrect(null); }
      }, 700);
    } else {
      setShake(choice);
      setTimeout(() => setShake(null), 400);
    }
  };

  // Auto-play audio on each new item
  useEffect(() => { speak(item.audio_text); }, [item]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-2">Activity 1 of 3 · Listen &amp; Match · {idx + 1}/{items.length}</p>
        <button
          type="button"
          onClick={() => speak(item.audio_text)}
          className={cn('inline-flex items-center gap-3 rounded-full px-6 py-4 text-white font-bold shadow-lg active:scale-95 transition', theme.primary)}
        >
          <Volume2 className="w-6 h-6" /> Tap to Listen
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
        {choices.map((c) => {
          const isCorrect = correct === c;
          const isWrong = shake === c;
          const image = item.choice_images?.[norm(c)];
          return (
            <button
              key={c}
              onClick={() => handleClick(c)}
              className={cn(
                'rounded-2xl border-2 p-4 text-lg font-semibold bg-white transition shadow-sm',
                'hover:scale-[1.02] active:scale-95 flex flex-col items-center gap-2',
                isCorrect && 'bg-green-100 border-green-500 text-green-800',
                isWrong && 'animate-[shake_0.4s] bg-red-50 border-red-400 text-red-700',
                !isCorrect && !isWrong && 'border-slate-200 hover:border-slate-300'
              )}
            >
              {/* Pre-A1/Welcome Town kids often can't read yet — the
                  picture is the real answer choice; the word underneath
                  is a bonus for kids starting to sight-read, not the
                  primary signal. */}
              {image && (
                <img src={image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              )}
              <span className="inline-flex items-center gap-2">
                {isCorrect && <Check className="w-5 h-5" />}
                {isWrong && <X className="w-5 h-5" />}
                {c}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-500">Score: {score}/{items.length}</p>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
    </div>
  );
}

// ─── Activity 2: Sentence Scramble ───────────────────────────────
function SentenceScramble({ items, theme, onPass }: { items: SyntaxItem[]; theme: typeof HUB_THEME.playground; onPass: () => void }) {
  const [idx, setIdx] = useState(0);
  const item = items[idx];
  const tokens = useMemo(() => item.scrambled_words.map((w, i) => ({ w, i })), [item]);
  const [pool, setPool] = useState<{ w: string; i: number }[]>(tokens);
  const [arranged, setArranged] = useState<{ w: string; i: number }[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    setPool(tokens);
    setArranged([]);
    setFeedback(null);
  }, [tokens]);

  const target = norm(item.correct_order);
  const checkAnswer = () => {
    const built = arranged.map((t) => t.w).join(' ');
    if (norm(built) === target) {
      setFeedback('correct');
      setTimeout(() => {
        if (idx + 1 >= items.length) onPass();
        else setIdx(idx + 1);
      }, 800);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const wordImage = (w: string) => item.word_images?.[norm(w)];

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-slate-500">Activity 2 of 3 · Sentence Scramble · {idx + 1}/{items.length}</p>

      {/* The picture (when one exists) anchors what's being said, and
          "Hear the sentence" lets a non-reading student know the target
          order by listening as many times as they need — putting words
          in order by reading alone assumes a skill Pre-A1 kids don't
          have yet. */}
      {item.image && (
        <img src={item.image} alt="" className="mx-auto h-28 w-28 rounded-2xl object-cover shadow-md" />
      )}
      <div className="text-center">
        <button
          type="button"
          onClick={() => speak(item.correct_order)}
          className={cn('inline-flex items-center gap-2 rounded-full px-5 py-3 text-white font-bold shadow-lg active:scale-95 transition', theme.primary)}
        >
          <Volume2 className="w-5 h-5" /> Hear the sentence
        </button>
      </div>

      <div className={cn(
        'min-h-[80px] rounded-2xl border-2 border-dashed p-4 flex flex-wrap gap-2 justify-center items-center bg-white',
        feedback === 'correct' && 'border-green-500 bg-green-50',
        feedback === 'wrong' && 'border-red-400 bg-red-50 animate-[shake_0.4s]',
        !feedback && 'border-slate-300'
      )}>
        {arranged.length === 0 && <span className="text-slate-400 italic text-sm">Tap a word below to start building…</span>}
        {arranged.map((t) => {
          const img = wordImage(t.w);
          return (
            <button
              key={`${t.w}-${t.i}`}
              onClick={() => { setArranged(arranged.filter((x) => x !== t)); setPool([...pool, t]); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-300 rounded-xl font-semibold text-slate-800 hover:bg-slate-50 shadow-sm"
            >
              {img && <img src={img} alt="" className="h-6 w-6 rounded object-cover" />}
              {t.w}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {pool.map((t) => {
          const img = wordImage(t.w);
          return (
            <button
              key={`pool-${t.w}-${t.i}`}
              onClick={() => { setPool(pool.filter((x) => x !== t)); setArranged([...arranged, t]); }}
              className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-white shadow-md active:scale-95 transition', theme.primary)}
            >
              {img && <img src={img} alt="" className="h-6 w-6 rounded object-cover" />}
              {t.w}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={() => { setPool(tokens); setArranged([]); setFeedback(null); }}>
          <RotateCcw className="w-4 h-4 mr-1" /> Reset
        </Button>
        <Button disabled={arranged.length === 0} onClick={checkAnswer} className={theme.primary}>
          Check <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Activity 3: Voice Challenge ─────────────────────────────────
function VoiceChallenge({ activity, theme, onPass }: { activity: ProductionActivity; theme: typeof HUB_THEME.playground; onPass: () => void }) {
  const [recording, setRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        setHasRecording(true);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      toast.error('Microphone permission denied. You can still tap Submit to finish.');
      setHasRecording(true); // allow finishing without audio
    }
  };
  const stopRec = () => {
    try { recorderRef.current?.stop(); } catch { /* noop */ }
    setRecording(false);
  };

  const submit = async () => {
    setSubmitting(true);
    // Mock validation: any recording (or skip) counts as a pass.
    setTimeout(() => { setSubmitting(false); onPass(); }, 400);
  };

  return (
    <div className="space-y-6 text-center">
      <p className="text-sm text-slate-500">Activity 3 of 3 · Voice Challenge</p>
      {activity.instructions && <p className="text-slate-600">{activity.instructions}</p>}
      <div className={cn('rounded-3xl border-2 p-6 bg-white shadow-sm max-w-xl mx-auto', theme.ring, 'ring-2')}>
        {activity.image && (
          <img src={activity.image} alt="" className="mx-auto mb-3 h-24 w-24 rounded-2xl object-cover shadow-sm" />
        )}
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Say this aloud</p>
        <p className={cn('text-2xl font-extrabold mt-2', theme.accent)}>“{activity.prompt}”</p>
        {/* A non-reading student can't read this prompt at all without an
            audio option — every other activity already has one. */}
        <button
          type="button"
          onClick={() => speak(activity.prompt)}
          className={cn('mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white font-bold shadow active:scale-95 transition', theme.primary)}
        >
          <Volume2 className="w-4 h-4" /> Hear it first
        </button>
        {Array.isArray(activity.target_words_to_detect) && activity.target_words_to_detect.length > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            Try to use: {activity.target_words_to_detect.map((w) => <span key={w} className="inline-block bg-slate-100 rounded-full px-2 py-0.5 mx-0.5 text-slate-700">{w}</span>)}
          </p>
        )}
      </div>

      <button
        type="button"
        onPointerDown={startRec}
        onPointerUp={stopRec}
        onPointerLeave={() => recording && stopRec()}
        className={cn(
          'mx-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-5 text-white font-extrabold shadow-xl select-none transition',
          recording ? 'bg-red-500 scale-110 animate-pulse' : theme.primary
        )}
      >
        <Mic className="w-6 h-6" /> {recording ? 'Recording… release to stop' : 'Hold to Speak'}
      </button>

      {audioUrl && (
        <audio controls src={audioUrl} className="mx-auto block mt-2" />
      )}

      <Button
        disabled={!hasRecording || submitting}
        onClick={submit}
        className={cn('mt-4', theme.primary)}
        size="lg"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Submit Homework
      </Button>
    </div>
  );
}

// ─── Mascot (Pip the Parrot, same character used on the Playground
// world map) — an idle bob plus a brief speech-bubble cheer whenever a
// round is passed, so homework feels like a continuation of the lesson
// instead of a plain quiz form. Playground hub only. ────────────────
function PipMascot({ message }: { message: string | null }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-20 md:bottom-10 md:right-10">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-14 right-0 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-bold text-purple-600 shadow-lg"
            style={{ fontFamily: "'Fredoka', cursive" }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [-4, 4, -4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-6xl drop-shadow-lg md:text-7xl"
      >
        🦜
      </motion.div>
    </div>
  );
}

// ─── XP Celebration ──────────────────────────────────────────────
function CompletionScreen({ xpAwarded, totalXp, theme, isPlayground }: { xpAwarded: number; totalXp: number; theme: typeof HUB_THEME.playground; isPlayground?: boolean }) {
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
    const t0 = performance.now();
    const dur = 1200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setCounter(Math.round(p * xpAwarded));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [xpAwarded]);
  return (
    <div className="text-center space-y-4 py-10">
      {isPlayground ? (
        <motion.div
          animate={{ rotate: [-8, 8, -8], y: [0, -10, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-7xl"
        >
          🎉
        </motion.div>
      ) : (
        <Trophy className={cn('w-20 h-20 mx-auto animate-bounce', theme.accent)} />
      )}
      <h2
        className={cn('text-4xl font-extrabold', isPlayground && 'text-orange-700')}
        style={isPlayground ? { fontFamily: "'Fredoka', cursive" } : undefined}
      >
        {isPlayground ? 'Awesome work!' : 'Homework Complete!'}
      </h2>
      <p className={cn('text-6xl font-black', theme.accent)}>+{counter} XP</p>
      <p className="text-slate-500">New total: <span className="font-bold text-slate-800">{totalXp} XP</span></p>
    </div>
  );
}

// ─── Main Player ─────────────────────────────────────────────────
const XP_PER_HOMEWORK = 50;

const CHEERS = ['Yay!', 'Great job!', 'Nice one!', "You're on fire!"];

export default function HomeworkPlayer({ assignmentId, content, onComplete, previewMode = false }: Props) {
  const hub = (content?.meta?.hub || 'academy') as Hub;
  const theme = HUB_THEME[hub] || HUB_THEME.academy;
  const isPlayground = hub === 'playground';
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [awardedThisRun, setAwardedThisRun] = useState(0);
  const [persisting, setPersisting] = useState(false);
  const [cheer, setCheer] = useState<string | null>(null);

  const advance = (next: 1 | 2 | 3 | 4) => {
    setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
    setTimeout(() => setCheer(null), 1400);
    setStep(next);
  };

  const finalize = async () => {
    setPersisting(true);

    if (previewMode) {
      // Try-it-out preview from the content library — same celebration,
      // no real submission or XP written against anyone's account.
      setTotalXp(XP_PER_HOMEWORK);
      setAwardedThisRun(XP_PER_HOMEWORK);
      setPersisting(false);
      setStep(4);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('not signed in');

      // Insert/update submission row (idempotent on best-effort)
      await supabase.from('homework_submissions').insert({
        assignment_id: assignmentId,
        student_id: user.id,
        status: 'completed',
        points_earned: XP_PER_HOMEWORK,
        text_response: 'Completed via interactive HomeworkPlayer',
        submitted_at: new Date().toISOString(),
      });

      // Bump users.total_xp by 50 — read-modify-write to stay schema-agnostic.
      const { data: row } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', user.id)
        .maybeSingle();
      const current = (row as any)?.total_xp ?? 0;
      const next = current + XP_PER_HOMEWORK;
      await supabase.from('users').update({ total_xp: next } as any).eq('id', user.id);

      setTotalXp(next);
      setAwardedThisRun(XP_PER_HOMEWORK);
      onComplete?.(next);
    } catch (e: any) {
      toast.error(`Couldn't save XP: ${e?.message ?? 'unknown error'}`);
    } finally {
      setPersisting(false);
      setStep(4);
    }
  };

  return (
    <div className={cn('relative min-h-dvh overflow-hidden p-6', !isPlayground && 'bg-gradient-to-br', !isPlayground && theme.bg)}>
      {isPlayground && (
        <>
          <JungleTheme />
          <div className="absolute inset-0 bg-white/35" />
        </>
      )}

      {isPlayground && (
        <div className="relative z-10 mx-auto mb-4 max-w-3xl text-center">
          <span
            className="inline-block rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-orange-700 shadow-md backdrop-blur"
            style={{ fontFamily: "'Fredoka', cursive" }}
          >
            📝 {content.meta?.title ? `Practice: ${content.meta.title}` : 'Practice Time!'}
          </span>
        </div>
      )}

      <div className="relative z-10 max-w-3xl mx-auto bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 md:p-10">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <span key={n} className={cn('h-2 w-12 rounded-full transition-colors', step >= (n as 1|2|3) ? theme.primary : 'bg-slate-200')} />
          ))}
        </div>

        {step === 1 && (
          <ListenMatch items={content.activity_1_recognition.items} theme={theme} onPass={() => advance(2)} />
        )}
        {step === 2 && (
          <SentenceScramble items={content.activity_2_syntax.items} theme={theme} onPass={() => advance(3)} />
        )}
        {step === 3 && (
          <VoiceChallenge
            activity={content.activity_3_production}
            theme={theme}
            onPass={() => {
              if (isPlayground) {
                setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
                setTimeout(() => setCheer(null), 1400);
              }
              finalize();
            }}
          />
        )}
        {step === 4 && (
          persisting
            ? <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
            : <CompletionScreen xpAwarded={awardedThisRun} totalXp={totalXp} theme={theme} isPlayground={isPlayground} />
        )}
      </div>

      {isPlayground && <PipMascot message={cheer} />}
    </div>
  );
}
