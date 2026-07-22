import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Check } from 'lucide-react';
import type { SmartWorksheet } from '@/services/whiteboardService';
import { whiteboardService } from '@/services/whiteboardService';

interface Props {
  worksheet: SmartWorksheet;
  roomId: string;
  userId: string;
  role: 'teacher' | 'student';
}

interface Chip {
  id: number;
  word: string;
}

interface SentenceState {
  index: number;
  bank: Chip[]; // unused chips
  built: Chip[]; // chips placed in sentence order
}

const buildForIndex = (worksheet: SmartWorksheet, index: number): SentenceState => {
  const item = worksheet.sentence_builder?.[index];
  const words = item?.scrambled_words ?? [];
  return {
    index,
    bank: words.map((word, id) => ({ id, word })),
    built: [],
  };
};

export const NativeGameSentence: React.FC<Props> = ({ worksheet, roomId, userId, role }) => {
  const sentences = worksheet.sentence_builder ?? [];
  const initial = useMemo(() => buildForIndex(worksheet, 0), [worksheet]);
  const [state, setState] = useState<SentenceState>(initial);

  useEffect(() => setState(initial), [initial]);

  useEffect(() => {
    const unsub = whiteboardService.subscribeToGameState(roomId, (payload) => {
      if (payload.gameType !== 'sentence' || payload.senderId === userId) return;
      const next = payload.state as Partial<SentenceState>;
      setState((prev) => ({
        index: typeof next.index === 'number' ? next.index : prev.index,
        bank: next.bank ?? prev.bank,
        built: next.built ?? prev.built,
      }));
    });
    return unsub;
  }, [roomId, userId]);

  const broadcast = (next: SentenceState) => {
    if (role !== 'teacher') return;
    void whiteboardService.sendGameState(roomId, {
      gameType: 'sentence',
      state: next,
      senderId: userId,
    });
  };

  const update = (next: SentenceState) => {
    setState(next);
    broadcast(next);
  };

  if (sentences.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <p className="text-muted-foreground">No sentences in this worksheet.</p>
      </div>
    );
  }

  const current = sentences[state.index];
  const builtSentence = state.built.map((c) => c.word).join(' ');
  const isCorrect = builtSentence === current.full_sentence;

  const moveToBuilt = (chipId: number) => {
    if (role !== 'teacher') return;
    const chip = state.bank.find((c) => c.id === chipId);
    if (!chip) return;
    update({
      ...state,
      bank: state.bank.filter((c) => c.id !== chipId),
      built: [...state.built, chip],
    });
  };

  const moveToBank = (chipId: number) => {
    if (role !== 'teacher') return;
    const chip = state.built.find((c) => c.id === chipId);
    if (!chip) return;
    update({
      ...state,
      built: state.built.filter((c) => c.id !== chipId),
      bank: [...state.bank, chip],
    });
  };

  const goNext = () => {
    if (state.index < sentences.length - 1) {
      update(buildForIndex(worksheet, state.index + 1));
    }
  };
  const goPrev = () => {
    if (state.index > 0) {
      update(buildForIndex(worksheet, state.index - 1));
    }
  };
  const reset = () => update(buildForIndex(worksheet, state.index));

  const progress = ((state.index + 1) / sentences.length) * 100;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 sm:p-8">
      {/* Instruction banner */}
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-4 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur shadow-sm border border-emerald-200 text-sm font-semibold text-emerald-700 flex items-center gap-2"
      >
        <span className="text-lg">✏️</span>
        {role === 'teacher'
          ? 'Tap the words in order to build the sentence!'
          : 'Watch your teacher build the sentence!'}
      </motion.div>

      {/* Progress */}
      <div className="w-full max-w-3xl mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-700/80 mb-1.5">
          <span>Sentence {state.index + 1} of {sentences.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Built sentence drop zone */}
      <motion.div
        layout
        className={`w-full max-w-3xl min-h-[120px] rounded-2xl border-2 border-dashed p-5 mb-6 flex flex-wrap gap-2 items-center justify-center transition-colors ${
          isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-white/80 border-emerald-300'
        }`}
      >
        {state.built.length === 0 ? (
          <p className="text-muted-foreground italic text-base">
            {role === 'teacher' ? '👇 Tap words below to build the sentence' : '👀 Watch the teacher build the sentence'}
          </p>
        ) : (
          state.built.map((chip) => (
            <motion.button
              key={`built-${chip.id}`}
              layout
              whileHover={role === 'teacher' ? { scale: 1.05 } : undefined}
              whileTap={{ scale: 0.94 }}
              onClick={() => moveToBank(chip.id)}
              disabled={role !== 'teacher'}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-base font-bold shadow-md hover:bg-emerald-600 disabled:cursor-not-allowed"
            >
              {chip.word}
            </motion.button>
          ))
        )}
        {isCorrect && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 14 }}
            className="ml-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white font-extrabold"
          >
            <Check className="h-5 w-5" /> Correct!
          </motion.div>
        )}
      </motion.div>

      {/* Word bank */}
      <div className="w-full max-w-3xl flex flex-wrap gap-2 justify-center min-h-[60px]">
        {state.bank.map((chip) => (
          <motion.button
            key={`bank-${chip.id}`}
            layout
            whileHover={role === 'teacher' ? { scale: 1.06, y: -2 } : undefined}
            whileTap={{ scale: 0.94 }}
            onClick={() => moveToBuilt(chip.id)}
            disabled={role !== 'teacher'}
            className="px-4 py-2.5 rounded-xl bg-white border-2 border-teal-300 text-foreground text-base font-bold shadow-sm hover:border-teal-500 hover:shadow-md disabled:cursor-not-allowed transition-all"
          >
            {chip.word}
          </motion.button>
        ))}
      </div>

      {role === 'teacher' && (
        <div className="mt-7 flex items-center gap-2 sm:gap-3">
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
            className="h-14 px-6 rounded-2xl text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all"
            onClick={reset}
          >
            <RotateCcw className="h-5 w-5 mr-2" /> Reset
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-5 rounded-2xl text-base font-bold shadow-sm hover:shadow-md transition-all"
            onClick={goNext}
            disabled={state.index === sentences.length - 1}
          >
            Next <ChevronRight className="h-6 w-6 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};
