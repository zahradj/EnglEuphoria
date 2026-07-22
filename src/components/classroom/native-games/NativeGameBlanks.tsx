import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import type { SmartWorksheet } from '@/services/whiteboardService';
import { whiteboardService } from '@/services/whiteboardService';

interface Props {
  worksheet: SmartWorksheet;
  roomId: string;
  userId: string;
  role: 'teacher' | 'student';
}

interface BlanksState {
  index: number;
  selected: string | null;
  revealed: boolean;
}

export const NativeGameBlanks: React.FC<Props> = ({ worksheet, roomId, userId, role }) => {
  const items = worksheet.fill_in_blanks ?? [];
  const [state, setState] = useState<BlanksState>({ index: 0, selected: null, revealed: false });

  // Cache shuffled options per index so order is stable across re-renders.
  const optionsByIndex = useMemo(() => {
    return items.map((item) => {
      const opts = [item.correct_answer, ...item.distractors];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      return opts;
    });
  }, [items]);

  useEffect(() => {
    const unsub = whiteboardService.subscribeToGameState(roomId, (payload) => {
      if (payload.gameType !== 'blanks' || payload.senderId === userId) return;
      const next = payload.state as Partial<BlanksState>;
      setState((prev) => ({
        index: typeof next.index === 'number' ? next.index : prev.index,
        selected: next.selected !== undefined ? next.selected : prev.selected,
        revealed: typeof next.revealed === 'boolean' ? next.revealed : prev.revealed,
      }));
    });
    return unsub;
  }, [roomId, userId]);

  const broadcast = (next: BlanksState) => {
    if (role !== 'teacher') return;
    void whiteboardService.sendGameState(roomId, {
      gameType: 'blanks',
      state: next,
      senderId: userId,
    });
  };

  const update = (next: BlanksState) => {
    setState(next);
    broadcast(next);
  };

  if (items.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <p className="text-muted-foreground">No fill-in-the-blanks in this worksheet.</p>
      </div>
    );
  }

  const item = items[state.index];
  const opts = optionsByIndex[state.index] ?? [];
  const sentenceParts = item.sentence_with_blank.split('___');

  const handleSelect = (option: string) => {
    if (role !== 'teacher') return;
    update({ ...state, selected: option, revealed: true });
  };

  const goNext = () => {
    if (state.index < items.length - 1) {
      update({ index: state.index + 1, selected: null, revealed: false });
    }
  };
  const goPrev = () => {
    if (state.index > 0) {
      update({ index: state.index - 1, selected: null, revealed: false });
    }
  };

  const progress = ((state.index + 1) / items.length) * 100;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-6 sm:p-8">
      {/* Instruction banner */}
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-4 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur shadow-sm border border-rose-200 text-sm font-semibold text-rose-700 flex items-center gap-2"
      >
        <span className="text-lg">🧩</span>
        {role === 'teacher'
          ? 'Pick the word that fits in the blank!'
          : 'Watch your teacher choose the right word!'}
      </motion.div>

      {/* Progress */}
      <div className="w-full max-w-3xl mb-5">
        <div className="flex items-center justify-between text-xs font-semibold text-rose-700/80 mb-1.5">
          <span>Question {state.index + 1} of {items.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-rose-100 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-400 to-fuchsia-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="w-full max-w-3xl text-3xl font-medium text-center text-foreground mb-8 leading-relaxed">
        {sentenceParts[0]}
        <motion.span
          layout
          className={`inline-block min-w-[140px] mx-2 px-4 py-1 rounded-lg border-b-4 transition-colors ${
            state.revealed
              ? state.selected === item.correct_answer
                ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                : 'bg-rose-100 border-rose-500 text-rose-700'
              : 'bg-white border-rose-300 text-rose-400'
          }`}
        >
          {state.selected ?? '___'}
        </motion.span>
        {sentenceParts[1]}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
        {opts.map((opt) => {
          const isSelected = state.selected === opt;
          const isCorrect = opt === item.correct_answer;
          const showResult = state.revealed && (isSelected || isCorrect);
          return (
            <motion.button
              key={opt}
              whileHover={role === 'teacher' && !state.revealed ? { scale: 1.03, y: -2 } : undefined}
              whileTap={{ scale: 0.95 }}
              animate={showResult && isCorrect ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => handleSelect(opt)}
              disabled={role !== 'teacher' || state.revealed}
              className={`px-5 py-5 rounded-2xl text-lg font-bold shadow-md transition-colors flex items-center justify-center gap-2 min-h-[64px] ${
                showResult && isCorrect
                  ? 'bg-emerald-500 text-white'
                  : showResult && isSelected
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-foreground border-2 border-rose-200 hover:border-rose-400 hover:shadow-lg'
              } ${role !== 'teacher' || state.revealed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {showResult && isCorrect && <Check className="h-5 w-5" />}
              {showResult && isSelected && !isCorrect && <X className="h-5 w-5" />}
              {opt}
            </motion.button>
          );
        })}
      </div>

      {role === 'teacher' && (
        <div className="mt-8 flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-5 rounded-2xl text-base font-bold shadow-sm hover:shadow-md transition-all"
            onClick={goPrev}
            disabled={state.index === 0}
          >
            <ChevronLeft className="h-6 w-6 mr-1" /> Previous
          </Button>
          <Button
            size="lg"
            className="h-14 px-6 rounded-2xl text-base font-bold bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 text-white shadow-md hover:shadow-lg transition-all"
            onClick={goNext}
            disabled={state.index === items.length - 1}
          >
            Next Question <ChevronRight className="h-6 w-6 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};
