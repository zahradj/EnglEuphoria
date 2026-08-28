/**
 * Generic, data-driven Playground game components, mirroring the layouts of
 * the hand-built PlaygroundTrailLesson stages (memory pairs, tap-in-order,
 * hotspot, thumbs up/down, sort-into-buckets). All trail aesthetic:
 * #FE6A2F orange, big glass cards, confetti, ding/buzz audio.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle } from 'lucide-react';
import { usePlaygroundAudio } from '@/hooks/usePlaygroundAudio';
import { MotorTraceCanvas } from '@/components/playground/games/MotorTraceCanvas';
import appleImg from '@/assets/playground-trail/apple.png';
import ballImg from '@/assets/playground-trail/ball.png';
import birdImg from '@/assets/playground-trail/bird.png';
import busImg from '@/assets/playground-trail/bus.png';
import cakeImg from '@/assets/playground-trail/cake.png';
import catImg from '@/assets/playground-trail/cat.png';
import dogImg from '@/assets/playground-trail/dog.png';
import fishImg from '@/assets/playground-trail/fish.png';
import hatImg from '@/assets/playground-trail/hat.png';
import pigImg from '@/assets/playground-trail/pig.png';
import sunImg from '@/assets/playground-trail/sun.png';

function fire() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FE6A2F', '#FFB703', '#FEFBDD', '#FFD166'],
  });
}

export function StageHeader({
  title,
  subtitle,
  emoji,
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
}) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-3xl font-black text-[color:var(--pg-accent,#FE6A2F)] sm:text-4xl">
        {emoji && <span className="mr-2">{emoji}</span>}
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-base text-[color:var(--pg-accent-soft-text,rgba(254,106,47,0.8))]">{subtitle}</p>}
    </div>
  );
}

const TRAIL_IMAGE_MAP: Record<string, string> = {
  apple: appleImg,
  ball: ballImg,
  bird: birdImg,
  bus: busImg,
  cake: cakeImg,
  cat: catImg,
  dog: dogImg,
  fish: fishImg,
  hat: hatImg,
  pig: pigImg,
  sun: sunImg,
};

const cleanLabel = (value = '') => value.toLowerCase().replace(/[^a-z]/g, '');
const builtInImageFor = (label = '') => TRAIL_IMAGE_MAP[cleanLabel(label)] || '';
const safeImage = (label?: string, explicit?: string) => {
  const mappedExplicit = builtInImageFor(explicit || '');
  const mappedLabel = builtInImageFor(label || '');
  const isPlaceholder = !explicit || explicit.includes('placeholder-dropzone') || explicit.startsWith('AI:') || explicit.startsWith('prompt:');
  if (mappedExplicit) return mappedExplicit;
  if (isPlaceholder) return mappedLabel || '';
  return explicit;
};
const stableShuffle = <T,>(items: T[], seedText: string) => {
  const seed = seedText.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), items.length || 1);
  return items
    .map((item, index) => ({ item, key: ((index + 3) * 37 + seed * 11) % 997 }))
    .sort((a, b) => a.key - b.key)
    .map(({ item }) => item);
};

// ─── TRAIL CHOICE (replaces legacy multiple choice) ──────────────────────────
export type TrailChoiceSlide = {
  type: 'multiple';
  question: string;
  image_url?: string;
  options: string[];
  option_images?: string[];
  answer: string;
  feedback?: { correct?: string; wrong?: string };
};

export function TrailChoiceGame({ slide }: { slide: TrailChoiceSlide }) {
  const { playCorrect, playWrong, playVoice } = usePlaygroundAudio();
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === slide.answer;
  const locked = Boolean(picked && correct);

  const choose = (option: string) => {
    if (locked) return;
    setPicked(option);
    playVoice(option);
    if (option === slide.answer) {
      playCorrect(slide.feedback?.correct);
      fire();
    } else {
      playWrong(slide.feedback?.wrong);
      setTimeout(() => setPicked((current) => (current === option ? null : current)), 700);
    }
  };

  return (
    <div className="w-full" data-correct={locked ? 'true' : undefined}>
      <StageHeader title={slide.question || 'Choose the answer'} emoji="🎯" />
      {slide.image_url && (
        <img src={safeImage(slide.answer, slide.image_url)} alt="" className="mx-auto mb-5 h-40 w-40 rounded-3xl object-contain bg-white p-2 shadow-md" />
      )}
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {slide.options.map((option, index) => {
          const isPicked = picked === option;
          const isAnswer = option === slide.answer;
          const optionImage = safeImage(option, slide.option_images?.[index]);
          return (
            <motion.button
              key={`${option}-${index}`}
              onClick={() => choose(option)}
              disabled={locked}
              whileTap={{ scale: 0.94 }}
              whileHover={locked ? undefined : { y: -4, scale: 1.02 }}
              animate={isPicked && !isAnswer ? { x: [-6, 6, -6, 6, 0] } : undefined}
              className={`min-h-[180px] rounded-3xl border-4 p-4 text-center text-2xl font-black transition-all ${
                locked && isAnswer
                  ? 'border-green-500 bg-green-100 text-green-700'
                  : isPicked && !isAnswer
                    ? 'border-rose-500 bg-rose-100 text-rose-700'
                    : 'border-[color:var(--pg-accent-300,#fdba74)] bg-white text-slate-800 shadow-md hover:border-[color:var(--pg-accent-500,#f97316)] hover:shadow-lg'
              }`}
            >
              {optionImage ? (
                <img src={optionImage} alt={option} className="mx-auto mb-3 h-24 w-24 rounded-2xl object-contain bg-[color:var(--pg-accent-50,#fff7ed)]" />
              ) : (
                <span className="mb-3 block text-5xl">✨</span>
              )}
              <span>{option}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── TRAIL DRAG MATCH (reference-style drag/drop matching) ───────────────────
export type TrailDragMatchSlide =
  | {
      type: 'match';
      instruction: string;
      pairs: { word: string; image_url: string }[];
      feedback?: { correct?: string; wrong?: string };
    }
  | {
      type: 'drag';
      instruction: string;
      word?: string;
      image_url?: string;
      correctImage?: string;
      distractors?: string[];
      distractorImages?: string[];
      pairs?: { word: string; image_url: string }[];
      feedback?: { correct?: string; wrong?: string };
    };

export function TrailDragMatchGame({ slide }: { slide: TrailDragMatchSlide }) {
  const { playCorrect, playWrong, playVoice } = usePlaygroundAudio();
  // Multi-pair mode covers `match` and any `drag` that supplies pairs.
  const multiPairs =
    slide.type === 'match'
      ? slide.pairs
      : Array.isArray((slide as any).pairs) && (slide as any).pairs.length > 0
        ? (slide as any).pairs
        : null;
  const isSingleDrop = !multiPairs;
  const sources = useMemo(() => {
    type Src = { id: string; label: string; matchId: string; image: string };
    if (multiPairs) {
      const src: Src[] = multiPairs.map((pair) => ({ id: cleanLabel(pair.word), label: pair.word, matchId: `${cleanLabel(pair.word)}-target`, image: '' }));
      return stableShuffle<Src>(src, multiPairs.map((p) => p.word).join('|') + '-src');
    }
    const d = slide as Extract<TrailDragMatchSlide, { type: 'drag' }>;
    const word = d.word || 'WORD';
    const wrong: Src[] = (d.distractors || []).map((w, index) => ({
      id: cleanLabel(w) || `wrong-${index}`,
      label: w,
      matchId: 'none',
      image: safeImage(w, d.distractorImages?.[index]) || '',
    }));
    const all: Src[] = [
      { id: cleanLabel(word), label: word, matchId: `${cleanLabel(word)}-target`, image: safeImage(word, d.correctImage) || '' },
      ...wrong,
    ];
    return stableShuffle<Src>(all, word);
  }, [slide, multiPairs]);
  const targets = useMemo(() => {
    type Tgt = { id: string; label: string; image: string };
    if (multiPairs) {
      const tgts: Tgt[] = multiPairs.map((pair) => ({
        id: `${cleanLabel(pair.word)}-target`,
        label: pair.word,
        image: safeImage(pair.word, pair.image_url) || '',
      }));
      return stableShuffle<Tgt>(tgts, multiPairs.map((pair) => pair.word).join('|'));
    }
    const d = slide as Extract<TrailDragMatchSlide, { type: 'drag' }>;
    const word = d.word || 'WORD';
    return [{ id: `${cleanLabel(word)}-target`, label: word, image: safeImage(word, d.image_url) || '' }] as Tgt[];
  }, [slide, multiPairs]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const allCorrect = sources.length > 0 && sources.every((source) => feedback[source.id] === 'correct');

  const handleDrop = (sourceId: string, targetId: string) => {
    const source = sources.find((item) => item.id === sourceId);
    if (!source || feedback[sourceId] === 'correct') return;
    const ok = source.matchId === targetId;
    setMatches((prev) => ({ ...prev, [sourceId]: targetId }));
    setFeedback((prev) => ({ ...prev, [sourceId]: ok ? 'correct' : 'incorrect' }));
    if (ok) {
      playVoice(source.label);
      playCorrect(slide.feedback?.correct);
      fire();
    } else {
      playWrong(slide.feedback?.wrong);
    }
  };

  return (
    <div className="w-full" data-correct={allCorrect ? 'true' : undefined}>
      <StageHeader title={slide.instruction || (isSingleDrop ? 'Drag the word to the picture' : 'Match words and pictures')} emoji="🧩" />
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-[1fr_1.1fr]">
        <div className="rounded-3xl border-4 border-[color:var(--pg-accent-200,#fed7aa)] bg-white/90 p-4">
          <h3 className="mb-3 text-center text-sm font-black uppercase tracking-wide text-[color:var(--pg-accent-600,#ea580c)]">Drag from here</h3>
          <div className="grid grid-cols-2 gap-3">
            {sources.map((source) => {
              const state = feedback[source.id];
              return (
                <motion.button
                  key={source.id}
                  draggable={state !== 'correct'}
                  onDragStart={(event: any) => event.dataTransfer.setData('text/plain', source.id)}
                  onClick={() => state !== 'correct' && setSelected(selected === source.id ? null : source.id)}
                  whileTap={{ scale: 0.94 }}
                  animate={state === 'incorrect' ? { x: [-5, 5, -5, 5, 0] } : undefined}
                  className={`min-h-[108px] rounded-2xl border-2 p-3 font-black shadow-sm transition-all ${
                    state === 'correct'
                      ? 'border-green-400 bg-green-100 text-green-700 opacity-75'
                      : selected === source.id
                        ? 'border-amber-400 bg-amber-100 text-slate-900 ring-4 ring-amber-200'
                        : state === 'incorrect'
                          ? 'border-rose-400 bg-rose-50 text-rose-700'
                          : 'border-[color:var(--pg-accent-300,#fdba74)] bg-gradient-to-br from-[color:var(--pg-accent-500,#f97316)] to-[color:var(--pg-gradient-to,#f59e0b)] text-white hover:shadow-lg'
                  }`}
                >
                  {source.image && <img src={source.image} alt="" className="mx-auto mb-2 h-14 w-14 rounded-xl object-contain bg-white/80" />}
                  <span className="block text-xl">{source.label}</span>
                  {state === 'correct' && <CheckCircle className="mx-auto mt-1 h-5 w-5" />}
                  {state === 'incorrect' && <XCircle className="mx-auto mt-1 h-5 w-5" />}
                </motion.button>
              );
            })}
          </div>
        </div>
        <div className="rounded-3xl border-4 border-dashed border-[color:var(--pg-accent-300,#fdba74)] bg-[color:var(--pg-accent-50-80,rgba(255,247,237,0.8))] p-4">
          <h3 className="mb-3 text-center text-sm font-black uppercase tracking-wide text-[color:var(--pg-accent-600,#ea580c)]">Drop here</h3>
          <div className={`grid gap-3 ${targets.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {targets.map((target) => {
              const correctSource = sources.find((source) => source.matchId === target.id && feedback[source.id] === 'correct');
              return (
                <motion.button
                  key={target.id}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event: any) => {
                    event.preventDefault();
                    handleDrop(event.dataTransfer.getData('text/plain'), target.id);
                  }}
                  onClick={() => {
                    if (selected) {
                      handleDrop(selected, target.id);
                      setSelected(null);
                    }
                  }}
                  whileHover={selected ? { scale: 1.02 } : undefined}
                  className={`min-h-[168px] rounded-3xl border-4 p-3 transition-all ${
                    correctSource ? 'border-green-400 bg-green-100' : selected ? 'border-amber-400 bg-amber-100' : 'border-white bg-white shadow-md'
                  }`}
                >
                  {target.image ? (
                    <img src={target.image} alt={target.label} className="mx-auto h-28 w-28 rounded-2xl object-contain bg-white" />
                  ) : (
                    <span className="text-6xl">🖼️</span>
                  )}
                  <div className="mt-2 min-h-[32px] text-center text-xl font-black text-slate-800">
                    {correctSource ? `${correctSource.label} ✓` : 'Drop'}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
      {Object.values(feedback).includes('incorrect') && !allCorrect && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setMatches({});
              setFeedback({});
              setSelected(null);
            }}
            className="rounded-full bg-white px-5 py-2 text-sm font-black text-[color:var(--pg-accent-600,#ea580c)] shadow-sm ring-2 ring-[color:var(--pg-accent-200,#fed7aa)]"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── TRAIL MISSING LETTER (reference missing-letter/gap activity) ────────────
export type MissingLetterSlide = {
  type: 'missing_letter';
  instruction?: string;
  emoji?: string;
  word: string;
  image_url?: string;
  missing_letter?: string;
  missing_position?: number;
};

export function MissingLetterGame({ slide }: { slide: MissingLetterSlide }) {
  const { playCorrect, playWrong, playVoice } = usePlaygroundAudio();
  const target = (slide.word || 'cat').toUpperCase();
  const position = Math.min(Math.max(slide.missing_position ?? Math.floor(target.length / 2), 0), target.length - 1);
  const missing = (slide.missing_letter || target[position] || '').toUpperCase();
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const correct = checked && answer.toUpperCase() === missing;

  const check = () => {
    setChecked(true);
    if (answer.toUpperCase() === missing) {
      playCorrect();
      fire();
      playVoice(target);
    } else {
      playWrong();
    }
  };

  return (
    <div className="w-full text-center" data-correct={correct ? 'true' : undefined}>
      <StageHeader title={slide.instruction || 'What letter is missing?'} subtitle="Fill the missing letter" emoji={slide.emoji || '🔎'} />
      <div className="mx-auto max-w-md rounded-3xl border-4 border-[color:var(--pg-accent-200,#fed7aa)] bg-white p-6 shadow-md">
        <img src={safeImage(target, slide.image_url)} alt={target} className="mx-auto mb-5 h-36 w-36 rounded-2xl object-contain bg-[color:var(--pg-accent-50,#fff7ed)]" />
        <div className="mb-5 flex items-center justify-center gap-2">
          {target.split('').map((letter, index) => index === position ? (
            <input
              key={`${letter}-${index}`}
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value.slice(0, 1));
                setChecked(false);
              }}
              className={`h-16 w-14 rounded-2xl border-4 text-center text-3xl font-black uppercase outline-none ${
                checked ? (correct ? 'border-green-500 bg-green-100 text-green-700' : 'border-rose-500 bg-rose-100 text-rose-700') : 'border-[color:var(--pg-accent-400,#fb923c)] bg-[color:var(--pg-accent-50,#fff7ed)] text-[color:var(--pg-accent-600,#ea580c)]'
              }`}
              maxLength={1}
              aria-label="Missing letter"
            />
          ) : (
            <span key={`${letter}-${index}`} className="flex h-16 w-14 items-center justify-center rounded-2xl bg-[color:var(--pg-accent-100,#ffedd5)] text-3xl font-black text-[color:var(--pg-accent-600,#ea580c)]">
              {letter}
            </span>
          ))}
        </div>
        <button
          onClick={() => playVoice(target)}
          className="mb-4 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-[color:var(--pg-accent-600,#ea580c)] ring-2 ring-amber-200"
        >
          🔊 Hear word
        </button>
        <div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={check}
            disabled={!answer.trim() || correct}
            className="rounded-2xl bg-[color:var(--pg-accent-500,#f97316)] px-8 py-3 text-lg font-black text-white shadow-md disabled:opacity-40"
          >
            Check Answer
          </motion.button>
        </div>
        {checked && !correct && <p className="mt-3 text-sm font-bold text-[color:var(--pg-accent-600,#ea580c)]">Try again — listen and look carefully.</p>}
      </div>
    </div>
  );
}

// ─── TRAIL PHONICS HUNT (reference phonics click activity) ───────────────────
export type PhonicsHuntSlide = {
  type: 'phonics_hunt';
  instruction?: string;
  emoji?: string;
  letter: string;
  items: { word: string; image_url?: string; has_letter?: boolean; starts_with?: boolean }[];
};

export function PhonicsHuntGame({ slide }: { slide: PhonicsHuntSlide }) {
  const { playCorrect, playWrong, playVoice } = usePlaygroundAudio();
  const letter = (slide.letter || 'a').toLowerCase();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const correctWords = slide.items.filter((item) => item.has_letter ?? item.starts_with ?? item.word.toLowerCase().startsWith(letter)).map((item) => item.word);
  const correct = checked && selected.size === correctWords.length && correctWords.every((word) => selected.has(word));

  const toggle = (word: string) => {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(word) ? next.delete(word) : next.add(word);
      return next;
    });
    playVoice(word);
  };

  const check = () => {
    setChecked(true);
    if (selected.size === correctWords.length && correctWords.every((word) => selected.has(word))) {
      playCorrect();
      fire();
    } else {
      playWrong();
    }
  };

  return (
    <div className="w-full" data-correct={correct ? 'true' : undefined}>
      <StageHeader title={slide.instruction || `Find /${letter}/ words`} subtitle={`Tap words that start with ${letter.toUpperCase()}`} emoji={slide.emoji || '👂'} />
      <div className="mx-auto mb-5 inline-flex items-center gap-3 rounded-3xl bg-orange-500 px-6 py-4 text-white shadow-md">
        <span className="text-5xl font-black">{letter.toUpperCase()}{letter}</span>
        <button onClick={() => playVoice(letter)} className="rounded-full bg-white/20 px-3 py-2 font-black">🔊</button>
      </div>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-3">
        {slide.items.map((item) => {
          const isSelected = selected.has(item.word);
          const isCorrect = correctWords.includes(item.word);
          const state = checked ? (isSelected && isCorrect ? 'right' : isSelected && !isCorrect ? 'wrong' : !isSelected && isCorrect ? 'missed' : 'idle') : isSelected ? 'selected' : 'idle';
          return (
            <motion.button
              key={item.word}
              onClick={() => toggle(item.word)}
              whileTap={{ scale: 0.94 }}
              className={`rounded-3xl border-4 p-4 text-center font-black transition-all ${
                state === 'right' ? 'border-green-500 bg-green-100 text-green-700' :
                state === 'wrong' ? 'border-rose-500 bg-rose-100 text-rose-700' :
                state === 'missed' ? 'border-amber-500 bg-amber-100 text-amber-700' :
                state === 'selected' ? 'border-orange-500 bg-orange-100 text-orange-700 ring-4 ring-orange-200' :
                'border-orange-200 bg-white text-slate-800 hover:border-orange-400'
              }`}
            >
              <img src={safeImage(item.word, item.image_url)} alt={item.word} className="mx-auto mb-3 h-24 w-24 rounded-2xl object-contain bg-orange-50" />
              <span className="text-xl">{item.word}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-5 text-center">
        {!checked ? (
          <button onClick={check} disabled={selected.size === 0} className="rounded-2xl bg-orange-500 px-8 py-3 text-lg font-black text-white shadow-md disabled:opacity-40">Check Answers</button>
        ) : !correct ? (
          <button onClick={() => { setChecked(false); setSelected(new Set()); }} className="rounded-2xl bg-white px-8 py-3 text-lg font-black text-orange-600 shadow-md ring-2 ring-orange-200">Try Again</button>
        ) : (
          <p className="text-lg font-black text-green-600">Perfect! 🎉</p>
        )}
      </div>
    </div>
  );
}

// ─── TRAIL WORD GAP (replaces legacy text input fill blank) ──────────────────
export type TrailWordGapSlide = {
  type: 'fill';
  text: string;
  answer: string;
  image_url?: string;
  options?: string[];
  feedback?: { correct?: string; wrong?: string };
};

export function TrailWordGapGame({ slide }: { slide: TrailWordGapSlide }) {
  const { playCorrect, playWrong, playVoice } = usePlaygroundAudio();
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);
  const answer = slide.answer || 'cat';
  const bank = useMemo(() => {
    const options = (slide.options?.length ? slide.options : [answer, 'dog', 'sun']).filter(Boolean);
    const unique = Array.from(new Set([answer, ...options]));
    return stableShuffle(unique, `${slide.text}-${answer}`);
  }, [slide.text, slide.options, answer]);
  const parts = useMemo(() => {
    const raw = slide.text || `I see a ____`;
    const re = /(_{2,}|\[blank\])/i;
    if (re.test(raw)) {
      const [before, , after = ''] = raw.split(re);
      return [before || '', after || ''];
    }
    return [raw.replace(/\s+$/, '') + ' ', ''];
  }, [slide.text]);
  const correct = selected?.trim().toLowerCase() === answer.toLowerCase();

  const choose = (word: string) => {
    setSelected(word);
    playVoice(word);
    if (word.trim().toLowerCase() === answer.toLowerCase()) {
      playCorrect(slide.feedback?.correct);
      fire();
    } else {
      playWrong(slide.feedback?.wrong);
      setWrong(true);
      setTimeout(() => {
        setWrong(false);
        setSelected((current) => (current === word ? null : current));
      }, 700);
    }
  };

  return (
    <div className="w-full" data-correct={correct ? 'true' : undefined}>
      <StageHeader title="Build the sentence" subtitle="Tap the word that fits" emoji="🏗️" />
      {slide.image_url && <img src={safeImage(answer, slide.image_url)} alt="" className="mx-auto mb-5 h-36 w-36 rounded-2xl object-contain bg-[color:var(--pg-accent-50,#fff7ed)] shadow-md" />}
      <motion.div
        animate={wrong ? { x: [-8, 8, -8, 8, 0] } : correct ? { scale: [1, 1.05, 1] } : undefined}
        className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-center gap-3 rounded-3xl border-4 border-[color:var(--pg-accent-200,#fed7aa)] bg-white p-6 text-center text-3xl font-black text-slate-800 shadow-md"
      >
        <span>{parts[0]}</span>
        <span className={`inline-flex min-h-[64px] min-w-[136px] items-center justify-center rounded-2xl border-4 border-dashed px-5 ${
          correct ? 'border-green-500 bg-green-100 text-green-700' : selected ? 'border-[color:var(--pg-accent-500,#f97316)] bg-[color:var(--pg-accent-100,#ffedd5)] text-[color:var(--pg-accent-600,#ea580c)]' : 'border-[color:var(--pg-accent-300,#fdba74)] bg-[color:var(--pg-accent-50,#fff7ed)] text-[color:var(--pg-accent-300,#fdba74)]'
        }`}
        >
          {selected || '⬇'}
        </span>
        <span>{parts[1]}</span>
      </motion.div>
      <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
        {bank.map((word) => (
          <motion.button
            key={word}
            onClick={() => choose(word)}
            disabled={correct}
            whileTap={{ scale: 0.94 }}
            whileHover={correct ? undefined : { y: -4, scale: 1.04 }}
            className={`rounded-2xl border-2 px-6 py-4 text-2xl font-black shadow-md ${
              selected === word && correct ? 'border-green-400 bg-green-100 text-green-700' : 'border-[color:var(--pg-accent-300,#fdba74)] bg-gradient-to-br from-[color:var(--pg-accent-500,#f97316)] to-[color:var(--pg-gradient-to,#f59e0b)] text-white'
            }`}
          >
            {word}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── TRACE LETTER / WORD ─────────────────────────────────────────────────────
export type TraceSlide = {
  type: 'trace';
  instruction?: string;
  emoji?: string;
  letter?: string;
  word?: string;
  phoneme?: string;
  image_url?: string;
};

const TRACE_PATHS: Record<string, string> = {
  a: 'M100 160 C100 95 190 95 190 160 C190 225 100 225 100 160 M190 110 L190 220',
  b: 'M105 45 L105 220 M105 135 C130 95 205 105 205 165 C205 225 130 235 105 195',
  c: 'M205 95 C165 55 90 85 85 160 C80 235 165 265 210 220',
  d: 'M205 45 L205 220 M205 135 C180 95 105 105 105 165 C105 225 180 235 205 195',
  e: 'M205 145 C195 95 110 90 90 155 L210 155 C205 225 125 250 88 195',
  i: 'M155 95 L155 220 M155 58 L155 60',
  l: 'M155 45 L155 220',
  m: 'M70 220 L70 110 C90 85 125 90 130 125 C150 90 205 90 215 125 L215 220',
  n: 'M95 220 L95 110 C120 85 190 90 195 130 L195 220',
  o: 'M155 90 C220 90 225 220 155 225 C85 225 90 90 155 90',
  p: 'M105 260 L105 105 M105 135 C130 95 205 105 205 165 C205 225 130 235 105 195',
  s: 'M205 95 C150 60 85 95 115 145 C145 190 215 175 200 225 C180 265 105 245 88 215',
  t: 'M155 65 L155 220 M95 110 L215 110',
  u: 'M95 105 L95 180 C95 235 205 235 205 180 L205 105',
};

export function TraceGame({ slide }: { slide: TraceSlide }) {
  const { playCorrect, playVoice } = usePlaygroundAudio();
  const target = (slide.letter || slide.word?.[0] || 'c').toLowerCase();
  const path = TRACE_PATHS[target] || TRACE_PATHS.c;
  const [done, setDone] = useState(false);
  return (
    <div className="w-full" data-correct={done ? 'true' : undefined}>
      <StageHeader
        title={slide.instruction || `Trace ${slide.word || slide.letter || 'the sound'}`}
        subtitle={slide.phoneme ? `Sound: ${slide.phoneme}` : undefined}
        emoji={slide.emoji || '✍️'}
      />
      {slide.image_url && (
        <img src={safeImage(slide.word || slide.letter, slide.image_url)} alt={slide.word || slide.letter || 'trace clue'} className="mb-3 h-24 w-24 rounded-2xl object-contain mx-auto shadow-md bg-orange-50" />
      )}
      <div className="flex justify-center">
        <MotorTraceCanvas
          svgPath={path}
          width={300}
          height={280}
          ariaLabel={`Trace ${slide.word || slide.letter || target}`}
          onSuccess={() => {
            setDone(true);
            playCorrect();
            fire();
            playVoice(slide.word || slide.letter || target);
          }}
        />
      </div>
    </div>
  );
}

// ─── MEMORY PAIRS ────────────────────────────────────────────────────────────
export type MemorySlide = {
  type: 'memory';
  instruction?: string;
  emoji?: string;
  pairs: { id: string; label: string; emoji?: string; image_url?: string }[];
};
export function MemoryGame({ slide }: { slide: MemorySlide }) {
  const { playCorrect, playWrong } = usePlaygroundAudio();
  const deck = useMemo(() => {
    const cards = slide.pairs.flatMap((p) => [
      { key: p.id + '-a', pairId: p.id, label: p.label, emoji: p.emoji, image_url: p.image_url },
      { key: p.id + '-b', pairId: p.id, label: p.label, emoji: p.emoji, image_url: p.image_url },
    ]);
    // deterministic shuffle
    const seed = slide.pairs.map((p) => p.id).join('').length || 1;
    return cards
      .map((c, i) => ({ ...c, k: ((i + 1) * 17 + seed * 7) % 97 }))
      .sort((a, b) => a.k - b.k);
  }, [slide.pairs]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const done = matched.size >= slide.pairs.length;

  function tap(key: string, pairId: string) {
    if (flipped.includes(key) || matched.has(pairId)) return;
    const next = [...flipped, key];
    if (next.length === 2) {
      const [a, b] = next;
      const ap = deck.find((c) => c.key === a)!;
      const bp = deck.find((c) => c.key === b)!;
      if (ap.pairId === bp.pairId) {
        setTimeout(() => {
          setMatched((m) => new Set(m).add(ap.pairId));
          setFlipped([]);
          fire();
          playCorrect();
        }, 350);
      } else {
        playWrong();
        setTimeout(() => setFlipped([]), 750);
      }
    }
    setFlipped(next);
  }

  return (
    <div className="w-full" data-correct={done ? 'true' : undefined}>
      <StageHeader title={slide.instruction || 'Find the pairs'} emoji={slide.emoji || '🧠'} />
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
        {deck.map((c) => {
          const isOpen = flipped.includes(c.key) || matched.has(c.pairId);
          return (
            <motion.button
              key={c.key}
              onClick={() => tap(c.key, c.pairId)}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-2xl border-2 font-extrabold text-xl flex items-center justify-center transition-all ${
                isOpen
                  ? 'bg-white border-[color:var(--pg-accent,#FE6A2F)] text-slate-800 shadow-md'
                  : 'bg-gradient-to-br from-[color:var(--pg-accent,#FE6A2F)] to-[color:var(--pg-gradient-to,#f59e0b)] border-[color:var(--pg-accent-dark,#c54c1d)] text-white shadow-lg'
              }`}
            >
              {isOpen ? (
                c.image_url ? (
                  <img src={safeImage(c.label, c.image_url)} alt={c.label} className="w-full h-full object-contain rounded-xl bg-[color:var(--pg-accent-50,#fff7ed)]" />
                ) : (
                  <span className="flex flex-col items-center gap-1">
                    {c.emoji && <span className="text-4xl">{c.emoji}</span>}
                    <span className="text-sm">{c.label}</span>
                  </span>
                )
              ) : (
                <span className="text-3xl">?</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── TAP IN ORDER (e.g. numbers 1→10, alphabet A→Z) ─────────────────────────
export type TapOrderSlide = {
  type: 'tap_order';
  instruction?: string;
  emoji?: string;
  items: { label: string; emoji?: string }[]; // already in target order
};
export function TapOrderGame({ slide }: { slide: TapOrderSlide }) {
  const { playCorrect, playWrong, playVoice } = usePlaygroundAudio();
  const shuffled = useMemo(() => {
    const seed = slide.items.length;
    return slide.items
      .map((it, i) => ({ ...it, i, k: ((i + 1) * 31 + seed * 11) % 89 }))
      .sort((a, b) => a.k - b.k);
  }, [slide.items]);
  const [idx, setIdx] = useState(0);
  const [wrongK, setWrongK] = useState<number | null>(null);
  const done = idx >= slide.items.length;

  function tap(targetI: number) {
    if (targetI === idx) {
      playVoice(slide.items[targetI].label);
      const next = idx + 1;
      if (next >= slide.items.length) {
        fire();
        playCorrect();
      }
      setIdx(next);
    } else {
      playWrong();
      setWrongK(targetI);
      setTimeout(() => setWrongK(null), 400);
    }
  }

  return (
    <div className="w-full" data-correct={done ? 'true' : undefined}>
      <StageHeader
        title={slide.instruction || 'Tap them in order'}
        subtitle={`Find ${idx + 1} of ${slide.items.length}`}
        emoji={slide.emoji || '🔢'}
      />
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-2xl mx-auto">
        {shuffled.map((it) => {
          const done = it.i < idx;
          const isWrong = wrongK === it.i;
          return (
            <motion.button
              key={it.i}
              onClick={() => tap(it.i)}
              disabled={done}
              animate={isWrong ? { x: [-6, 6, -6, 6, 0] } : undefined}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-2xl border-2 font-black text-2xl flex flex-col items-center justify-center shadow-md transition-all ${
                done
                  ? 'bg-green-100 border-green-400 text-green-700 opacity-70'
                  : 'bg-white border-[#FE6A2F] text-[#FE6A2F] hover:shadow-lg'
              }`}
            >
              {it.emoji && <span className="text-3xl">{it.emoji}</span>}
              <span>{it.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── HOTSPOT (tap parts of an image / scene) ────────────────────────────────
export type HotspotSlide = {
  type: 'hotspot';
  instruction?: string;
  emoji?: string;
  image_url?: string;
  // Either provide a list of named regions with x/y/w/h (% of image) OR a flat
  // grid of labelled emoji "scene parts". The generator most often produces
  // the simpler emoji-grid form.
  parts: { label: string; emoji?: string; x?: number; y?: number; w?: number; h?: number }[];
  prompts?: string[]; // labels to find, in order. Defaults to parts order.
};
export function HotspotGame({ slide }: { slide: HotspotSlide }) {
  const { playCorrect, playWrong, playVoice } = usePlaygroundAudio();
  const targets = slide.prompts && slide.prompts.length > 0 ? slide.prompts : slide.parts.map((p) => p.label);
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const current = targets[step];

  function tap(label: string) {
    if (step >= targets.length) return;
    if (label.toLowerCase() === current.toLowerCase()) {
      playVoice(label);
      const next = step + 1;
      if (next >= targets.length) {
        fire();
        playCorrect();
      }
      setStep(next);
    } else {
      playWrong();
      setWrong(label);
      setTimeout(() => setWrong(null), 400);
    }
  }

  const done = step >= targets.length;

  return (
    <div className="w-full" data-correct={done ? 'true' : undefined}>
      <StageHeader
        title={slide.instruction || 'Tap the right one'}
        subtitle={done ? 'All found! 🎉' : `Find: ${current}`}
        emoji={slide.emoji || '👀'}
      />
      {slide.image_url && (
        <div className="relative max-w-xl mx-auto mb-4">
          <img src={slide.image_url} alt="" className="w-full rounded-2xl shadow-md" />
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {slide.parts.map((p) => {
          const isWrong = wrong === p.label;
          const isFound = targets.slice(0, step).some((t) => t.toLowerCase() === p.label.toLowerCase());
          return (
            <motion.button
              key={p.label}
              onClick={() => tap(p.label)}
              disabled={isFound || done}
              animate={isWrong ? { x: [-6, 6, -6, 6, 0] } : undefined}
              whileTap={{ scale: 0.95 }}
              className={`rounded-2xl border-2 p-4 font-extrabold text-lg flex flex-col items-center gap-1 shadow-md transition-all ${
                isFound
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-white border-[color:var(--pg-accent,#FE6A2F)] text-slate-800 hover:shadow-lg'
              }`}
            >
              {p.emoji && <span className="text-4xl">{p.emoji}</span>}
              <span>{p.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── THUMBS UP / DOWN (I like / I don't like) ───────────────────────────────
export type ThumbsSlide = {
  type: 'thumbs';
  instruction?: string;
  emoji?: string;
  items: { label: string; emoji?: string; image_url?: string; correct: 'like' | 'dislike' }[];
};
export function ThumbsGame({ slide }: { slide: ThumbsSlide }) {
  const { playCorrect, playWrong } = usePlaygroundAudio();
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const it = slide.items[idx];

  function pick(choice: 'like' | 'dislike') {
    if (done) return;
    if (choice === it.correct) {
      playCorrect();
      const next = idx + 1;
      if (next >= slide.items.length) {
        setDone(true);
        fire();
      } else setIdx(next);
    } else {
      playWrong();
    }
  }

  if (done) {
    return (
      <div className="text-center py-8" data-correct="true">
        <StageHeader title="Great work! 🌟" emoji="💛" />
      </div>
    );
  }

  return (
    <div className="w-full" data-correct={done ? 'true' : undefined}>
      <StageHeader
        title={slide.instruction || 'I like / I don\'t like'}
        subtitle={`${idx + 1} of ${slide.items.length}`}
        emoji={slide.emoji || '👍'}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="max-w-md mx-auto bg-white rounded-3xl border-4 border-[#FE6A2F] shadow-xl p-6 flex flex-col items-center gap-4"
        >
          {it.image_url ? (
            <img src={it.image_url} alt={it.label} className="w-40 h-40 rounded-2xl object-cover" />
          ) : (
            <span className="text-7xl">{it.emoji || '✨'}</span>
          )}
          <p className="text-2xl font-extrabold text-slate-800">{it.label}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-4 justify-center mt-6">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => pick('like')}
          className="rounded-full w-20 h-20 bg-green-500 text-white text-4xl shadow-lg hover:bg-green-600"
          aria-label="I like it"
        >
          👍
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => pick('dislike')}
          className="rounded-full w-20 h-20 bg-rose-500 text-white text-4xl shadow-lg hover:bg-rose-600"
          aria-label="I don't like it"
        >
          👎
        </motion.button>
      </div>
    </div>
  );
}

// ─── SORT INTO BUCKETS (e.g. shapes by kind, animals by habitat) ────────────
export type SortSlide = {
  type: 'sort';
  instruction?: string;
  emoji?: string;
  buckets: { id: string; label: string; emoji?: string }[];
  items: { label: string; emoji?: string; image_url?: string; bucket: string }[];
};
export function SortGame({ slide }: { slide: SortSlide }) {
  const { playCorrect, playWrong } = usePlaygroundAudio();
  const [placed, setPlaced] = useState<Record<string, string>>({}); // item label -> bucket id
  const [wrong, setWrong] = useState<string | null>(null);
  const [hoverBucket, setHoverBucket] = useState<string | null>(null);

  const remaining = slide.items.filter((it) => !placed[it.label]);
  const done = remaining.length === 0;
  useEffect(() => { if (done) fire(); }, [done]);

  function drop(itemLabel: string, bucketId: string) {
    const it = slide.items.find((x) => x.label === itemLabel);
    if (!it) return;
    if (it.bucket === bucketId) {
      setPlaced((p) => ({ ...p, [itemLabel]: bucketId }));
      playCorrect();
    } else {
      playWrong();
      setWrong(itemLabel);
      setTimeout(() => setWrong(null), 400);
    }
  }

  return (
    <div className="w-full" data-correct={done ? 'true' : undefined}>
      <StageHeader
        title={slide.instruction || 'Sort them out'}
        subtitle={done ? 'All sorted! 🎉' : `${remaining.length} left`}
        emoji={slide.emoji || '🗂️'}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto mb-6">
        {slide.buckets.map((b) => {
          const items = slide.items.filter((it) => placed[it.label] === b.id);
          const isHover = hoverBucket === b.id;
          return (
            <div
              key={b.id}
              onDragOver={(e) => { e.preventDefault(); setHoverBucket(b.id); }}
              onDragLeave={() => setHoverBucket((h) => (h === b.id ? null : h))}
              onDrop={(e) => {
                e.preventDefault();
                setHoverBucket(null);
                const lbl = e.dataTransfer.getData('text/plain');
                if (lbl) drop(lbl, b.id);
              }}
              className={`rounded-2xl border-4 border-dashed p-4 min-h-[120px] transition-all duration-150 ${
                isHover
                  ? 'scale-[1.02] border-[color:var(--pg-accent,#FE6A2F)] bg-[color:var(--pg-accent-50,#fff7ed)]'
                  : 'border-[color:var(--pg-accent-alpha-50,rgba(254,106,47,0.5))] bg-[color:var(--pg-accent-50-50,rgba(255,247,237,0.5))]'
              }`}
            >
              <p className="font-extrabold text-[color:var(--pg-accent,#FE6A2F)] mb-2">
                {b.emoji && <span className="mr-1">{b.emoji}</span>}{b.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((it) => (
                  <motion.span
                    key={it.label}
                    layout
                    initial={{ scale: 0, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="px-3 py-1 rounded-xl bg-green-500 text-white font-bold shadow"
                  >
                    {it.emoji && <span className="mr-1">{it.emoji}</span>}{it.label}
                  </motion.span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
        {remaining.map((it) => (
          <motion.div
            key={it.label}
            layout
            draggable
            onDragStart={(e: any) => e.dataTransfer.setData('text/plain', it.label)}
            initial={{ scale: 0, opacity: 0 }}
            animate={wrong === it.label ? { x: [-6, 6, -6, 6, 0], scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            whileHover={{ scale: 1.06, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-grab active:cursor-grabbing px-4 py-2 rounded-2xl bg-gradient-to-br from-[color:var(--pg-accent,#FE6A2F)] to-[color:var(--pg-gradient-to,#f59e0b)] text-white font-extrabold shadow-md border-2 border-[color:var(--pg-accent-dark,#c54c1d)]"
          >
            {it.emoji && <span className="mr-1 text-xl">{it.emoji}</span>}{it.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── WORD BUILDER (scrambled letters → spell target word) ───────────────────
// For Pre-A1 / A1 CVC words (cat, sun, dog) and A1+ longer words.
// Renderer auto-scrambles `word`; child taps letter tiles in order to spell.
// Optional `extras` add distractor letters; optional `image_url`/`emoji` give the visual cue.
export type WordBuilderSlide = {
  type: 'word_builder';
  instruction?: string;
  emoji?: string;
  word: string;            // target, e.g. "cat"
  image_url?: string;      // picture clue
  extras?: string[];       // distractor letters
  show_sounds?: boolean;   // play each letter sound on tap (phonics mode)
};
export function WordBuilderGame({ slide }: { slide: WordBuilderSlide }) {
  const { playCorrect, playWrong, playVoice } = usePlaygroundAudio();
  const target = slide.word.toUpperCase();
  const tiles = useMemo(() => {
    const base = target.split('').concat((slide.extras || []).map((l) => l.toUpperCase()));
    const seed = target.length + base.length;
    return base
      .map((l, i) => ({ id: `${l}-${i}`, letter: l, k: ((i + 1) * 23 + seed * 5) % 91 }))
      .sort((a, b) => a.k - b.k);
  }, [target, slide.extras]);

  const [picked, setPicked] = useState<string[]>([]); // tile ids
  const [wrong, setWrong] = useState(false);
  const built = picked.map((id) => tiles.find((t) => t.id === id)!.letter).join('');
  const done = built === target;

  useEffect(() => {
    if (done) {
      playCorrect();
      fire();
      playVoice(slide.word);
    }
  }, [done]); // eslint-disable-line

  function tap(id: string) {
    if (done || picked.includes(id)) return;
    const tile = tiles.find((t) => t.id === id)!;
    const nextIdx = picked.length;
    if (tile.letter === target[nextIdx]) {
      if (slide.show_sounds) playVoice(tile.letter);
      setPicked([...picked, id]);
    } else {
      playWrong();
      setWrong(true);
      setTimeout(() => setWrong(false), 350);
    }
  }

  function reset() {
    setPicked([]);
  }

  return (
    <div className="w-full" data-correct={done ? 'true' : undefined}>
      <StageHeader
        title={slide.instruction || 'Build the word!'}
        subtitle={done ? `${slide.word} ✨` : `${picked.length} / ${target.length}`}
        emoji={slide.emoji || '🔤'}
      />
      {slide.image_url && (
        <img src={safeImage(slide.word, slide.image_url)} alt={slide.word} className="w-40 h-40 mx-auto rounded-2xl object-contain mb-3 shadow-md bg-orange-50" />
      )}
      <motion.div
        animate={wrong ? { x: [-6, 6, -6, 6, 0] } : undefined}
        className="mx-auto mb-4 flex justify-center gap-2"
      >
        {target.split('').map((ch, i) => {
          const filled = i < picked.length;
          const tile = filled ? tiles.find((t) => t.id === picked[i])! : null;
          return (
            <div
              key={i}
              className={`w-14 h-16 rounded-xl border-4 flex items-center justify-center text-3xl font-black ${
                done
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : filled
                  ? 'bg-white border-[#FE6A2F] text-[#FE6A2F]'
                  : 'bg-amber-50 border-dashed border-amber-400 text-amber-300'
              }`}
            >
              {tile?.letter ?? ch}
            </div>
          );
        })}
      </motion.div>
      <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
        {tiles.map((t) => {
          const used = picked.includes(t.id);
          return (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => tap(t.id)}
              disabled={used || done}
              className={`w-12 h-14 rounded-xl border-2 font-black text-2xl shadow-md transition-all ${
                used
                  ? 'bg-slate-100 border-slate-300 text-slate-300'
                  : 'bg-white border-[#FE6A2F] text-[#FE6A2F] hover:shadow-lg'
              }`}
            >
              {t.letter}
            </motion.button>
          );
        })}
      </div>
      {!done && picked.length > 0 && (
        <div className="text-center mt-3">
          <button onClick={reset} className="text-sm text-[#FE6A2F] underline font-bold">
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SOUND BLENDING (hear /c/ /a/ /t/ → blend → "cat") ──────────────────────
// Pure phonics: tap each sound, then tap "Blend!" to hear & reveal the word.
export type SoundBlendSlide = {
  type: 'sound_blend';
  instruction?: string;
  emoji?: string;
  word: string;                  // the blended word, e.g. "cat"
  sounds: string[];              // ordered phonemes/graphemes to tap, e.g. ["c","a","t"] or ["sh","i","p"]
  image_url?: string;
};
export function SoundBlendGame({ slide }: { slide: SoundBlendSlide }) {
  const { playVoice, playCorrect } = usePlaygroundAudio();
  const [heard, setHeard] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const allHeard = heard.size === slide.sounds.length;

  function tapSound(i: number) {
    playVoice(slide.sounds[i]);
    setHeard((s) => new Set(s).add(i));
  }

  function blend() {
    if (!allHeard || revealed) return;
    setRevealed(true);
    playCorrect();
    fire();
    setTimeout(() => playVoice(slide.word), 250);
  }

  return (
    <div className="w-full" data-correct={revealed ? 'true' : undefined}>
      <StageHeader
        title={slide.instruction || 'Tap each sound, then blend!'}
        subtitle={revealed ? `${slide.word} 🎉` : allHeard ? 'Now blend them!' : `${heard.size} / ${slide.sounds.length}`}
        emoji={slide.emoji || '🔊'}
      />
      {revealed && slide.image_url && (
        <img src={safeImage(slide.word, slide.image_url)} alt={slide.word} className="w-40 h-40 mx-auto rounded-2xl object-contain mb-3 shadow-md bg-orange-50" />
      )}
      <div className="flex justify-center gap-3 mb-5">
        {slide.sounds.map((s, i) => {
          const done = heard.has(i);
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={() => tapSound(i)}
              className={`w-20 h-24 rounded-2xl border-4 font-black text-3xl shadow-md transition-all flex flex-col items-center justify-center ${
                done
                  ? 'bg-amber-100 border-amber-500 text-amber-700'
                  : 'bg-white border-[#FE6A2F] text-[#FE6A2F] hover:shadow-lg'
              }`}
            >
              <span className="text-xs font-bold opacity-60">/{s}/</span>
              <span>{s}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={blend}
          disabled={!allHeard || revealed}
          className={`px-8 py-3 rounded-full font-black text-xl shadow-lg transition-all ${
            !allHeard || revealed
              ? 'bg-slate-200 text-slate-400'
              : 'bg-gradient-to-br from-[#FE6A2F] to-amber-500 text-white hover:shadow-xl'
          }`}
        >
          {revealed ? `✨ ${slide.word}` : '🎵 Blend!'}
        </motion.button>
      </div>
    </div>
  );
}

// ─── VOCAB GRID (circle / square frame vocabulary showcase) ──────────────────
export type VocabGridSlide = {
  type: 'vocab_grid';
  instruction?: string;
  emoji?: string;
  shape?: 'circle' | 'square';
  cards: { word: string; definition?: string; image_url?: string }[];
};

export function VocabGridGame({ slide }: { slide: VocabGridSlide }) {
  const { playVoice } = usePlaygroundAudio();
  const shape = slide.shape || 'circle';
  const cards = (slide.cards || []).slice(0, 8);
  const cols = cards.length >= 6 ? 4 : cards.length >= 4 ? 3 : cards.length === 1 ? 1 : 2;
  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
  };
  const frame =
    shape === 'circle'
      ? 'rounded-full aspect-square'
      : 'rounded-3xl aspect-square';

  return (
    <div className="w-full">
      <StageHeader
        title={slide.instruction || 'New Words'}
        subtitle="Tap a card to hear the word"
        emoji={slide.emoji || '✨'}
      />
      <div className={`mx-auto grid w-full max-w-4xl gap-5 ${gridCols[cols]}`}>
        {cards.map((card, index) => {
          const image = safeImage(card.word, card.image_url);
          const gradient = [
            'from-orange-100 to-amber-100',
            'from-rose-100 to-orange-100',
            'from-amber-100 to-yellow-100',
            'from-orange-100 to-rose-100',
            'from-yellow-100 to-orange-100',
            'from-amber-100 to-rose-100',
            'from-orange-200 to-amber-200',
            'from-yellow-100 to-amber-200',
          ][index % 8];
          return (
            <motion.button
              key={`${card.word}-${index}`}
              onClick={() => playVoice(card.word)}
              whileHover={{ y: -4, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="group flex flex-col items-center gap-3 outline-none"
            >
              <div
                className={`relative flex w-full items-center justify-center overflow-hidden border-4 border-white shadow-lg ring-4 ring-orange-200 bg-gradient-to-br ${gradient} ${frame}`}
              >
                {image ? (
                  <img
                    src={image}
                    alt={card.word}
                    className="h-[78%] w-[78%] object-contain drop-shadow-md"
                  />
                ) : (
                  <span className="text-5xl">✨</span>
                )}
                <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white text-base shadow-md ring-2 ring-orange-300">
                  🔊
                </span>
              </div>
              <div className="text-center">
                <div className="text-lg font-black uppercase tracking-wide text-orange-700 sm:text-xl">
                  {card.word}
                </div>
                {card.definition && (
                  <div className="mt-0.5 line-clamp-2 text-xs font-medium text-slate-600 sm:text-sm">
                    {card.definition}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

