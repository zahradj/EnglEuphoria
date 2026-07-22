import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import type { SmartWorksheet } from '@/services/whiteboardService';
import { whiteboardService } from '@/services/whiteboardService';

interface Props {
  worksheet: SmartWorksheet;
  roomId: string;
  userId: string;
  role: 'teacher' | 'student';
}

interface Card {
  id: number;
  pairId: number;
  text: string;
}

interface MemoryState {
  cards: Card[];
  flipped: number[]; // currently flipped card ids (max 2)
  matched: number[]; // matched card ids
}

const seedFromTimestamp = (cards: Card[]): Card[] => {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const buildInitial = (worksheet: SmartWorksheet): MemoryState => {
  const pairs = (worksheet.memory_match ?? []).slice(0, 8);
  const cards: Card[] = [];
  pairs.forEach((p, i) => {
    cards.push({ id: i * 2, pairId: i, text: p.pair_1 });
    cards.push({ id: i * 2 + 1, pairId: i, text: p.pair_2 });
  });
  return { cards: seedFromTimestamp(cards), flipped: [], matched: [] };
};

export const NativeGameMemory: React.FC<Props> = ({ worksheet, roomId, userId, role }) => {
  const initial = useMemo(() => buildInitial(worksheet), [worksheet]);
  const [state, setState] = useState<MemoryState>(initial);

  useEffect(() => setState(initial), [initial]);

  useEffect(() => {
    const unsub = whiteboardService.subscribeToGameState(roomId, (payload) => {
      if (payload.gameType !== 'memory' || payload.senderId === userId) return;
      const next = payload.state as Partial<MemoryState>;
      setState((prev) => ({
        cards: next.cards ?? prev.cards,
        flipped: next.flipped ?? prev.flipped,
        matched: next.matched ?? prev.matched,
      }));
    });
    return unsub;
  }, [roomId, userId]);

  const broadcast = (next: MemoryState) => {
    if (role !== 'teacher') return;
    void whiteboardService.sendGameState(roomId, {
      gameType: 'memory',
      state: next,
      senderId: userId,
    });
  };

  const update = (next: MemoryState) => {
    setState(next);
    broadcast(next);
  };

  const handleFlip = (cardId: number) => {
    if (role !== 'teacher') return;
    if (state.matched.includes(cardId) || state.flipped.includes(cardId)) return;
    if (state.flipped.length === 2) return;

    const nextFlipped = [...state.flipped, cardId];
    if (nextFlipped.length === 2) {
      const [a, b] = nextFlipped.map((id) => state.cards.find((c) => c.id === id)!);
      const isMatch = a.pairId === b.pairId;
      update({ ...state, flipped: nextFlipped });
      setTimeout(() => {
        if (isMatch) {
          update({
            cards: state.cards,
            matched: [...state.matched, a.id, b.id],
            flipped: [],
          });
        } else {
          update({ ...state, flipped: [] });
        }
      }, 900);
    } else {
      update({ ...state, flipped: nextFlipped });
    }
  };

  const reset = () => update(buildInitial(worksheet));

  if (state.cards.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <p className="text-muted-foreground">No memory pairs in this worksheet.</p>
      </div>
    );
  }

  const allMatched = state.matched.length === state.cards.length;

  const totalPairs = state.cards.length / 2;
  const matchedPairs = state.matched.length / 2;
  const progress = totalPairs ? (matchedPairs / totalPairs) * 100 : 0;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 p-5 sm:p-6 overflow-auto">
      {/* Instruction banner */}
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-4 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur shadow-sm border border-indigo-200 text-sm font-semibold text-indigo-700 flex items-center gap-2"
      >
        <span className="text-lg">🧠</span>
        {role === 'teacher'
          ? 'Tap two cards to find a matching pair!'
          : 'Watch your teacher find the matching pairs!'}
      </motion.div>

      <div className="flex items-center justify-between w-full max-w-3xl mb-3 gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-700/80 mb-1.5">
            <span>Matched pairs: {matchedPairs} / {totalPairs}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
        {role === 'teacher' && (
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-xl font-bold shadow-sm shrink-0"
            onClick={reset}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl">
        {state.cards.map((card) => {
          const isFlipped = state.flipped.includes(card.id) || state.matched.includes(card.id);
          const isMatched = state.matched.includes(card.id);
          return (
            <motion.button
              key={card.id}
              layout
              whileHover={role === 'teacher' && !isMatched ? { scale: 1.04, y: -2 } : undefined}
              whileTap={{ scale: 0.94 }}
              animate={isMatched ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onClick={() => handleFlip(card.id)}
              disabled={role !== 'teacher' || isMatched}
              className={`aspect-[4/3] rounded-2xl shadow-md flex items-center justify-center text-center p-3 text-base font-bold transition-colors ${
                isMatched
                  ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400 cursor-default'
                  : isFlipped
                  ? 'bg-white text-foreground ring-2 ring-indigo-400'
                  : 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600'
              } ${role !== 'teacher' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isFlipped ? card.text : <span className="text-3xl opacity-90">?</span>}
            </motion.button>
          );
        })}
      </div>

      {allMatched && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          className="mt-6 px-6 py-3 rounded-2xl bg-emerald-500 text-white text-xl font-extrabold shadow-lg"
        >
          🎉 All matched! Great job!
        </motion.div>
      )}
    </div>
  );
};
