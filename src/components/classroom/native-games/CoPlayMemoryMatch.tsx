import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { useCoPlaySync } from '@/hooks/useCoPlaySync';

export interface MemoryPair {
  pair_1: string;
  pair_2: string;
}

interface Card {
  id: number;
  pairId: number;
  text: string;
}

interface MemoryState {
  cards: Card[];
  flipped: number[];
  matched: number[];
  /** Monotonic version stamp — higher wins on conflicting updates. */
  v: number;
}

interface CoPlayMemoryMatchProps {
  pairs: MemoryPair[];
  sync: ReturnType<typeof useCoPlaySync>;
  role: 'teacher' | 'student';
  /** Hub primary color (hex or hsl). */
  accent?: string;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildInitial = (pairs: MemoryPair[]): MemoryState => {
  const slice = pairs.slice(0, 8);
  const cards: Card[] = [];
  slice.forEach((p, i) => {
    cards.push({ id: i * 2, pairId: i, text: p.pair_1 });
    cards.push({ id: i * 2 + 1, pairId: i, text: p.pair_2 });
  });
  return { cards: shuffle(cards), flipped: [], matched: [], v: 0 };
};

export const CoPlayMemoryMatch: React.FC<CoPlayMemoryMatchProps> = ({
  pairs,
  sync,
  role,
  accent = 'hsl(243 75% 59%)',
}) => {
  const initial = useMemo(() => buildInitial(pairs), [pairs]);
  const [state, setState] = useState<MemoryState>(initial);

  useEffect(() => setState(initial), [initial]);

  // Apply remote authoritative snapshots.
  useEffect(() => {
    return sync.on<MemoryState>('game_state_update', (p) => {
      setState((prev) => (p.data.v >= prev.v ? p.data : prev));
    });
  }, [sync]);

  useEffect(() => {
    return sync.on<{}>('game_reset', () => setState({ ...initial, v: 0 }));
  }, [sync, initial]);

  const pushState = useCallback(
    (next: MemoryState) => {
      setState(next);
      sync.broadcast<MemoryState>('game_state_update', next);
    },
    [sync],
  );

  const handleFlip = useCallback(
    (cardId: number) => {
      if (state.matched.includes(cardId)) return;
      if (state.flipped.includes(cardId)) return;
      if (state.flipped.length >= 2) return;

      sync.broadcast<{ cardId: number }>('card_flipped', { cardId });

      const flipped = [...state.flipped, cardId];
      if (flipped.length === 2) {
        const [a, b] = flipped;
        const ca = state.cards.find((c) => c.id === a)!;
        const cb = state.cards.find((c) => c.id === b)!;
        if (ca.pairId === cb.pairId) {
          pushState({ ...state, flipped: [], matched: [...state.matched, a, b], v: state.v + 1 });
          return;
        }
        pushState({ ...state, flipped, v: state.v + 1 });
        setTimeout(() => {
          pushState({ ...state, flipped: [], matched: state.matched, v: state.v + 2 });
        }, 900);
        return;
      }
      pushState({ ...state, flipped, v: state.v + 1 });
    },
    [state, sync, pushState],
  );

  const reset = useCallback(() => {
    const next = buildInitial(pairs);
    setState(next);
    sync.broadcast('game_reset', {});
    sync.broadcast<MemoryState>('game_state_update', next);
  }, [pairs, sync]);

  if (pairs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Waiting for the teacher to load a memory deck…
      </div>
    );
  }

  const allMatched = state.matched.length === state.cards.length;
  const cols = state.cards.length <= 8 ? 4 : state.cards.length <= 12 ? 4 : 6;

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: accent }} />
          <h3 className="text-base md:text-lg font-bold text-foreground">Memory Match</h3>
          <span className="text-xs text-muted-foreground">
            {state.matched.length / 2} / {state.cards.length / 2} pairs
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>

      <div
        className="grid gap-3 flex-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {state.cards.map((card) => {
          const isMatched = state.matched.includes(card.id);
          const isFlipped = isMatched || state.flipped.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => handleFlip(card.id)}
              disabled={isMatched}
              className="relative perspective-1000 aspect-[3/4] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-full preserve-3d"
              >
                <div
                  className="absolute inset-0 backface-hidden rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
                  style={{ background: accent }}
                >
                  ?
                </div>
                <div
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl flex items-center justify-center p-2 text-center text-sm md:text-base font-semibold shadow-md border-2 ${
                    isMatched ? 'bg-emerald-50 text-emerald-700' : 'bg-card text-foreground'
                  }`}
                  style={{ borderColor: isMatched ? '#10b981' : accent }}
                >
                  {card.text}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>

      {allMatched && (
        <div className="text-center py-2 text-emerald-700 font-semibold animate-fade-in">
          🎉 All pairs matched! Great teamwork.
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Live · {role === 'teacher'
          ? 'You see the student in real time'
          : 'Your moves sync to your teacher'}
      </p>
    </div>
  );
};

export default CoPlayMemoryMatch;
