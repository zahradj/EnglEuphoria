import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import type { SmartWorksheet } from '@/services/whiteboardService';
import { whiteboardService } from '@/services/whiteboardService';

interface Props {
  worksheet: SmartWorksheet;
  roomId: string;
  userId: string;
  role: 'teacher' | 'student';
}

interface FlashcardsState {
  index: number;
  flipped: boolean;
}

/**
 * Synchronised flashcards. Teacher controls navigation + flip state and
 * broadcasts the change so the student sees the same card in the same state.
 */
export const NativeGameFlashcards: React.FC<Props> = ({ worksheet, roomId, userId, role }) => {
  const cards = worksheet.flashcards ?? [];
  const [state, setState] = useState<FlashcardsState>({ index: 0, flipped: false });

  useEffect(() => {
    const unsub = whiteboardService.subscribeToGameState(roomId, (payload) => {
      if (payload.gameType !== 'flashcards' || payload.senderId === userId) return;
      const next = payload.state as Partial<FlashcardsState>;
      setState((prev) => ({
        index: typeof next.index === 'number' ? next.index : prev.index,
        flipped: typeof next.flipped === 'boolean' ? next.flipped : prev.flipped,
      }));
    });
    return unsub;
  }, [roomId, userId]);

  const broadcast = (next: FlashcardsState) => {
    if (role !== 'teacher') return;
    void whiteboardService.sendGameState(roomId, {
      gameType: 'flashcards',
      state: next,
      senderId: userId,
    });
  };

  const update = (next: FlashcardsState) => {
    setState(next);
    broadcast(next);
  };

  if (cards.length === 0) {
    return <EmptyState message="No flashcards in this worksheet." />;
  }

  const card = cards[state.index];

  const progress = ((state.index + 1) / cards.length) * 100;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 sm:p-8">
      {/* Instruction banner */}
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-5 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur shadow-sm border border-orange-200 text-sm font-semibold text-orange-700 flex items-center gap-2"
      >
        <span className="text-lg">📚</span>
        {role === 'teacher'
          ? 'Tap the card to flip it, then use the arrows to move through.'
          : 'Watch and listen — your teacher will flip the cards!'}
      </motion.div>

      {/* Progress */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-orange-700/80 mb-1.5">
          <span>Card {state.index + 1} of {cards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-orange-100 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-400 to-rose-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="relative w-full max-w-2xl h-72" style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait">
          <motion.button
            key={`${state.index}-${state.flipped}`}
            initial={{ rotateY: 75, opacity: 0, scale: 0.92 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: -75, opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={role === 'teacher' ? { scale: 1.02 } : undefined}
            whileTap={role === 'teacher' ? { scale: 0.98 } : undefined}
            onClick={() => role === 'teacher' && update({ ...state, flipped: !state.flipped })}
            className="absolute inset-0 rounded-3xl shadow-2xl bg-white border-4 border-orange-300 flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:border-orange-400 transition-colors disabled:cursor-not-allowed"
            disabled={role !== 'teacher'}
            aria-label={state.flipped ? 'Show word' : 'Show definition'}
          >
            {!state.flipped ? (
              <>
                <p className="text-xs uppercase tracking-wider text-orange-500 mb-3 font-bold">
                  Word
                </p>
                <h2 className="text-5xl sm:text-6xl font-extrabold text-foreground mb-4">{card.word}</h2>
                <p className="text-sm text-muted-foreground mt-4">
                  {role === 'teacher' ? '👆 Tap to reveal definition' : '✨ Teacher will reveal'}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-wider text-orange-500 mb-3 font-bold">
                  Definition
                </p>
                <p className="text-2xl font-medium text-foreground mb-4">{card.definition}</p>
                <p className="text-base italic text-muted-foreground">"{card.example_sentence}"</p>
              </>
            )}
          </motion.button>
        </AnimatePresence>
      </div>

      {role === 'teacher' && (
        <div className="mt-7 flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-5 rounded-2xl text-base font-bold shadow-sm hover:shadow-md transition-all"
            onClick={() => update({ index: Math.max(0, state.index - 1), flipped: false })}
            disabled={state.index === 0}
          >
            <ChevronLeft className="h-6 w-6 mr-1" /> Previous
          </Button>
          <Button
            size="lg"
            className="h-14 px-6 rounded-2xl text-base font-bold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-md hover:shadow-lg transition-all"
            onClick={() => update({ ...state, flipped: !state.flipped })}
          >
            <RotateCw className="h-5 w-5 mr-2" /> Flip Card
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-5 rounded-2xl text-base font-bold shadow-sm hover:shadow-md transition-all"
            onClick={() =>
              update({ index: Math.min(cards.length - 1, state.index + 1), flipped: false })
            }
            disabled={state.index === cards.length - 1}
          >
            Next <ChevronRight className="h-6 w-6 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-white">
    <p className="text-muted-foreground">{message}</p>
  </div>
);
