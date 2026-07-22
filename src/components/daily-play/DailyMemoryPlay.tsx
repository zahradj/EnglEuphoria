import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface MemoryPair {
  word: string;
  image: string;
}

interface Card {
  id: string;
  pairKey: string;
  kind: 'word' | 'image';
  content: string;
}

interface Props {
  pairs: MemoryPair[]; // 4–6 pairs
  onComplete?: () => void;
}

function buildDeck(pairs: MemoryPair[]): Card[] {
  const limited = pairs.slice(0, 6);
  const deck: Card[] = [];
  limited.forEach((p, i) => {
    deck.push({ id: `w-${i}`, pairKey: p.word, kind: 'word', content: p.word });
    deck.push({ id: `i-${i}`, pairKey: p.word, kind: 'image', content: p.image });
  });
  // Deterministic shuffle keyed on joined words so order is stable per day.
  const seedStr = limited.map((p) => p.word).join('|');
  const seed = seedStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return deck
    .map((c, i) => ({ c, k: (i + 1) * 37 + (seed % (i + 3)) }))
    .sort((a, b) => a.k - b.k)
    .map(({ c }) => c);
}

export default function DailyMemoryPlay({ pairs, onComplete }: Props) {
  const deck = useMemo(() => buildDeck(pairs), [pairs]);
  const [flipped, setFlipped] = useState<string[]>([]); // currently open (not yet matched)
  const [matched, setMatched] = useState<Set<string>>(new Set()); // pairKeys solved
  const [lock, setLock] = useState(false);

  const isOpen = (c: Card) => flipped.includes(c.id) || matched.has(c.pairKey);

  const onPick = (c: Card) => {
    if (lock || matched.has(c.pairKey) || flipped.includes(c.id)) return;
    const next = [...flipped, c.id];
    setFlipped(next);
    if (next.length === 2) {
      setLock(true);
      const [aId, bId] = next;
      const a = deck.find((x) => x.id === aId)!;
      const b = deck.find((x) => x.id === bId)!;
      if (a.pairKey === b.pairKey && a.kind !== b.kind) {
        setTimeout(() => {
          const ns = new Set(matched);
          ns.add(a.pairKey);
          setMatched(ns);
          setFlipped([]);
          setLock(false);
          confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 }, colors: ['#FE6A2F', '#22c55e', '#FFB703'] });
          if (ns.size === Math.min(pairs.length, 6)) onComplete?.();
        }, 350);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 750);
      }
    }
  };

  const total = Math.min(pairs.length, 6);
  return (
    <div className="w-full">
      <style>{`
        .flip-card { perspective: 900px; }
        .flip-inner { transform-style: preserve-3d; transition: transform 450ms cubic-bezier(.2,.7,.2,1); position: relative; width: 100%; height: 100%; }
        .flip-inner.is-open { transform: rotateY(180deg); }
        .flip-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 1.25rem; }
        .flip-back { transform: rotateY(180deg); }
      `}</style>
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-sm font-bold text-orange-700">Match the words to the pictures</p>
        <span className="text-xs font-extrabold text-green-700 bg-green-100 border-2 border-green-300 rounded-full px-3 py-1">
          {matched.size}/{total}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
        {deck.map((c) => {
          const open = isOpen(c);
          const solved = matched.has(c.pairKey);
          return (
            <button
              key={c.id}
              onClick={() => onPick(c)}
              aria-label={open ? c.content : 'Hidden card'}
              className="flip-card aspect-square focus:outline-none focus:ring-4 focus:ring-orange-300/50 rounded-2xl"
            >
              <motion.div
                whileTap={{ scale: 0.96 }}
                className={`flip-inner ${open ? 'is-open' : ''}`}
              >
                {/* FRONT (hidden state) */}
                <div className="flip-face bg-gradient-to-br from-orange-400 to-amber-500 border-2 border-orange-600/30 flex items-center justify-center text-white text-3xl font-black">
                  ?
                </div>
                {/* BACK (revealed) */}
                <div
                  className={`flip-face flip-back flex items-center justify-center overflow-hidden border-2 ${
                    solved ? 'bg-green-50 border-green-400' : 'bg-white border-orange-300'
                  }`}
                >
                  {c.kind === 'image' ? (
                    <img src={c.content} alt={c.pairKey} className="w-full h-full object-cover" />
                  ) : (
                    <span className="px-2 text-center text-base sm:text-xl font-extrabold text-orange-700 break-words">
                      {c.content}
                    </span>
                  )}
                  {solved && (
                    <span className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1 shadow">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
