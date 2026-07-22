// Alphabet Blocks — playful drag-and-drop letter-block game with spoken audio.
// Supports 3 modes via content.mode:
//   - "order_alphabet": arrange scrambled letter blocks into A→Z (or a subset)
//   - "letter_sounds":  match a spoken phonic sound (/æ/, /b/…) to its letter block
//   - "spell_word":     drag letter blocks to spell a target word (plays phonic on drop, word on completion)
//
// Uses window.speechSynthesis for audio (no external cost). Falls back to a
// silent tick if speech is unavailable.
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, RotateCw, Volume2 } from 'lucide-react';

type BlockMode = 'order_alphabet' | 'letter_sounds' | 'spell_word';

interface Props {
  content: {
    mode?: BlockMode;
    // order_alphabet
    letters?: string[];
    // letter_sounds
    items?: { letter: string; sound?: string }[]; // sound e.g. "/æ/" (IPA), "b" (phonic)
    // spell_word
    words?: { word: string; image?: string; hint?: string }[];
  };
  onComplete?: () => void;
}

const BLOCK_COLORS = [
  'from-rose-400 to-rose-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-emerald-600',
  'from-sky-400 to-blue-600',
  'from-violet-400 to-fuchsia-600',
  'from-lime-400 to-green-600',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-teal-600',
];

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function speak(text: string, opts: { rate?: number; pitch?: number } = {}) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = opts.rate ?? 0.85;
    u.pitch = opts.pitch ?? 1.1;
    synth.speak(u);
  } catch {
    /* noop */
  }
}

// Simple phonic-sound approximations for A–Z (short sounds, child-friendly).
const DEFAULT_PHONICS: Record<string, string> = {
  A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh', F: 'ff', G: 'guh', H: 'huh',
  I: 'ih', J: 'juh', K: 'kuh', L: 'lll', M: 'mmm', N: 'nnn', O: 'oh', P: 'puh',
  Q: 'kwuh', R: 'rrr', S: 'sss', T: 'tuh', U: 'uh', V: 'vvv', W: 'wuh',
  X: 'ks', Y: 'yuh', Z: 'zzz',
};

function speakLetterName(letter: string) {
  speak(letter.toUpperCase(), { rate: 0.8 });
}
function speakPhonic(letter: string, override?: string) {
  const key = letter.toUpperCase();
  const sound = override || DEFAULT_PHONICS[key] || key;
  speak(sound, { rate: 0.7, pitch: 1.15 });
}

function Block({
  letter,
  colorIdx,
  onClick,
  onDragStart,
  disabled,
  size = 'md',
  glow,
}: {
  letter: string;
  colorIdx: number;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}) {
  const sizeCls = size === 'lg' ? 'w-20 h-20 text-4xl' : size === 'sm' ? 'w-12 h-12 text-xl' : 'w-16 h-16 text-3xl';
  const grad = BLOCK_COLORS[colorIdx % BLOCK_COLORS.length];
  return (
    <button
      type="button"
      draggable={!disabled && !!onDragStart}
      onDragStart={onDragStart}
      onClick={onClick}
      disabled={disabled}
      className={`${sizeCls} bg-gradient-to-br ${grad} text-white font-extrabold rounded-2xl shadow-lg select-none
        border-4 border-white/40 hover:scale-105 active:scale-95 transition-transform
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        ${glow ? 'ring-4 ring-yellow-300 animate-pulse' : ''}`}
      style={{ textShadow: '0 2px 0 rgba(0,0,0,0.25)' }}
    >
      {letter}
    </button>
  );
}

function Slot({
  filled,
  correct,
  onDrop,
  colorIdx,
  size = 'md',
}: {
  filled: string | null;
  correct?: boolean;
  onDrop: (letter: string) => void;
  colorIdx: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [over, setOver] = useState(false);
  const sizeCls = size === 'lg' ? 'w-20 h-20 text-4xl' : size === 'sm' ? 'w-12 h-12 text-xl' : 'w-16 h-16 text-3xl';
  if (filled) {
    return <Block letter={filled} colorIdx={colorIdx} size={size} glow={correct} />;
  }
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const letter = e.dataTransfer.getData('text/plain');
        if (letter) onDrop(letter);
      }}
      className={`${sizeCls} rounded-2xl border-4 border-dashed flex items-center justify-center font-bold
        ${over ? 'border-indigo-500 bg-indigo-50 scale-110' : 'border-slate-300 bg-slate-50 text-slate-300'}
        transition-all`}
    >
      ?
    </div>
  );
}

// ── Mode 1: Order the alphabet ───────────────────────────────────────────
function OrderAlphabet({ letters, onDone }: { letters: string[]; onDone: () => void }) {
  const target = useMemo(() => letters.map((l) => l.toUpperCase()), [letters]);
  const [pool, setPool] = useState<string[]>(() => shuffle(target));
  const [slots, setSlots] = useState<(string | null)[]>(() => target.map(() => null));

  const complete = slots.every((s, i) => s === target[i]);
  useEffect(() => {
    if (complete) speak(`Great job! You know the alphabet!`, { rate: 0.9 });
  }, [complete]);

  const handleDrop = (idx: number, letter: string) => {
    if (slots[idx]) return;
    const isCorrect = letter === target[idx];
    if (!isCorrect) {
      speak('Try again', { rate: 0.9, pitch: 0.9 });
      return;
    }
    speakLetterName(letter);
    setSlots((s) => s.map((v, i) => (i === idx ? letter : v)));
    setPool((p) => p.filter((l) => l !== letter));
  };

  const reset = () => { setPool(shuffle(target)); setSlots(target.map(() => null)); };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-slate-600">Drag the letter blocks into the correct alphabet order.</p>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 p-4 flex flex-wrap justify-center gap-2 min-h-[6rem]">
        {slots.map((s, i) => (
          <Slot key={i} filled={s} correct={s === target[i]} colorIdx={i} onDrop={(l) => handleDrop(i, l)} />
        ))}
      </div>
      <div className="rounded-2xl bg-slate-100 p-4 flex flex-wrap justify-center gap-2 min-h-[6rem]">
        {pool.length === 0 ? (
          <div className="text-slate-400 text-sm py-6">All blocks placed! 🎉</div>
        ) : pool.map((l, i) => (
          <Block
            key={l}
            letter={l}
            colorIdx={target.indexOf(l)}
            onClick={() => speakLetterName(l)}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', l)}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset} className="flex-1"><RotateCw className="w-4 h-4 mr-1" /> Shuffle</Button>
        <Button onClick={onDone} disabled={!complete} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Check className="w-4 h-4 mr-1" /> Finish
        </Button>
      </div>
    </div>
  );
}

// ── Mode 2: Match spoken sound to letter ─────────────────────────────────
function LetterSounds({ items, onDone }: { items: { letter: string; sound?: string }[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [feedback, setFeedback] = useState<'ok' | 'no' | null>(null);
  const cur = items[i];
  const target = (cur?.letter || '').toUpperCase();

  const choices = useMemo(() => {
    const others = items.filter((_, idx) => idx !== i).map((x) => x.letter.toUpperCase());
    const distractors = shuffle(others).slice(0, 3);
    return shuffle([target, ...distractors]);
  }, [i, items, target]);

  useEffect(() => {
    if (cur) speakPhonic(target, cur.sound);
  }, [i]);

  if (!cur) return null;
  const pick = (letter: string) => {
    if (feedback) return;
    if (letter === target) {
      speakLetterName(letter);
      setFeedback('ok');
      setTimeout(() => {
        if (i + 1 >= items.length) onDone();
        else { setFeedback(null); setI(i + 1); }
      }, 800);
    } else {
      setFeedback('no');
      setTimeout(() => setFeedback(null), 700);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-slate-600">Which letter makes this sound?</p>
        <Button variant="outline" size="lg" onClick={() => speakPhonic(target, cur.sound)}>
          <Volume2 className="w-5 h-5 mr-2" /> Play sound again
        </Button>
        <p className="text-xs text-slate-500">Sound {i + 1} of {items.length}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 justify-items-center">
        {choices.map((L, idx) => (
          <Block key={L + idx} letter={L} colorIdx={idx} size="lg"
            onClick={() => pick(L)}
            glow={feedback === 'ok' && L === target} />
        ))}
      </div>
      {feedback === 'no' && <div className="text-center text-rose-600 font-semibold">Try again — listen carefully.</div>}
    </div>
  );
}

// ── Mode 3: Spell the word with blocks ───────────────────────────────────
function SpellWord({ words, onDone }: { words: { word: string; image?: string; hint?: string }[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  const cur = words[i];
  const target = (cur?.word || '').toUpperCase().split('');
  const [slots, setSlots] = useState<(string | null)[]>(() => target.map(() => null));
  const [pool, setPool] = useState<string[]>(() => shuffle(target));

  useEffect(() => {
    setSlots(target.map(() => null));
    setPool(shuffle(target));
  }, [i]);

  const complete = slots.every((s, k) => s === target[k]);
  useEffect(() => {
    if (complete && cur) speak(cur.word, { rate: 0.75 });
  }, [complete]);

  if (!cur) return null;

  const handleDrop = (idx: number, letter: string) => {
    if (slots[idx]) return;
    if (letter !== target[idx]) { speak('Try again', { rate: 0.9, pitch: 0.9 }); return; }
    speakPhonic(letter);
    setSlots((s) => s.map((v, k) => (k === idx ? letter : v)));
    // remove first occurrence from pool
    setPool((p) => {
      const j = p.indexOf(letter);
      if (j < 0) return p;
      return [...p.slice(0, j), ...p.slice(j + 1)];
    });
  };

  const next = () => {
    if (i + 1 >= words.length) onDone();
    else setI(i + 1);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-sm text-slate-600">Spell the word by dragging letter blocks.</p>
        {cur.image && <div className="text-6xl">{cur.image}</div>}
        {cur.hint && <p className="text-sm italic text-slate-500">Hint: {cur.hint}</p>}
        <Button variant="ghost" size="sm" onClick={() => speak(cur.word, { rate: 0.7 })}>
          <Volume2 className="w-4 h-4 mr-1" /> Hear the word
        </Button>
        <p className="text-xs text-slate-500">Word {i + 1} of {words.length}</p>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 flex justify-center gap-2 min-h-[6rem]">
        {slots.map((s, k) => (
          <Slot key={k} filled={s} correct={s === target[k]} colorIdx={k} onDrop={(l) => handleDrop(k, l)} size="lg" />
        ))}
      </div>
      <div className="rounded-2xl bg-slate-100 p-4 flex flex-wrap justify-center gap-2 min-h-[6rem]">
        {pool.map((l, k) => (
          <Block key={l + k} letter={l} colorIdx={k}
            onClick={() => speakPhonic(l)}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', l)} />
        ))}
      </div>
      <Button onClick={next} disabled={!complete} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
        <Check className="w-4 h-4 mr-1" /> {i + 1 >= words.length ? 'Finish' : 'Next word'}
      </Button>
    </div>
  );
}

export default function AlphabetBlocksGame({ content, onComplete }: Props) {
  const mode: BlockMode =
    content?.mode ||
    (content?.words ? 'spell_word' : content?.items ? 'letter_sounds' : 'order_alphabet');

  const done = () => onComplete?.();

  if (mode === 'order_alphabet') {
    const letters = (content?.letters && content.letters.length ? content.letters : ['A','B','C','D','E','F']);
    return <OrderAlphabet letters={letters} onDone={done} />;
  }
  if (mode === 'letter_sounds') {
    const items = content?.items || [];
    if (!items.length) return <div className="text-sm text-slate-500">No sound items configured.</div>;
    return <LetterSounds items={items} onDone={done} />;
  }
  const words = content?.words || [];
  if (!words.length) return <div className="text-sm text-slate-500">No spelling words configured.</div>;
  return <SpellWord words={words} onDone={done} />;
}
