import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import AudioChip from '../AudioChip';
import { cn } from '@/lib/utils';

/**
 * Tap the Word — Novakid-style.
 * Sentence shown, audio plays, learner taps the target word among the sentence tokens.
 */
interface TapTheWordProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export default function TapTheWordActivity({
  slide,
  onCorrect,
  onIncorrect,
}: TapTheWordProps) {
  const data = slide?.interactive_data || slide?.content || slide || {};
  const sentence: string = data.sentence || data.text || '';
  const targetWord: string = (data.target_word || data.answer || '').trim();
  const audioUrl: string | undefined = data.audio || data.audioUrl;

  const tokens = useMemo(
    () => sentence.split(/(\s+)/).filter((t) => t.trim().length > 0),
    [sentence],
  );

  const normalized = (w: string) => w.replace(/[.,!?;:'"()]/g, '').toLowerCase();
  const targetNorm = normalized(targetWord);

  const [picked, setPicked] = useState<number | null>(null);

  const handlePick = (i: number) => {
    if (picked != null) return;
    setPicked(i);
    const ok = normalized(tokens[i]) === targetNorm;
    if (ok) onCorrect?.();
    else onIncorrect?.();
  };

  return (
    <div className="w-full h-full min-h-[480px] flex flex-col items-center justify-center p-6 gap-8">
      <div className="flex items-center gap-3">
        <AudioChip text={sentence} audioUrl={audioUrl} size="lg" />
        <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
          Listen and tap the word
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl">
        {tokens.map((tok, i) => {
          const isPicked = picked === i;
          const isTarget = normalized(tok) === targetNorm;
          const showRight = picked != null && isTarget;
          const showWrong = isPicked && !isTarget;
          return (
            <motion.button
              key={i}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePick(i)}
              disabled={picked != null}
              className={cn(
                'relative rounded-xl px-5 py-3 text-2xl md:text-3xl font-semibold transition-all',
                'bg-card border-2',
                picked == null && 'border-border hover:border-primary hover:bg-primary/5',
                showRight && 'border-success bg-success/10 text-success',
                showWrong && 'border-destructive bg-destructive/10 text-destructive',
                picked != null && !isPicked && !isTarget && 'opacity-50',
              )}
            >
              {tok}
              {showRight && <Check className="inline-block ml-2 w-5 h-5" />}
              {showWrong && <X className="inline-block ml-2 w-5 h-5" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
