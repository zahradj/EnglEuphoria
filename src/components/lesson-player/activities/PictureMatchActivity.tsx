import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import AudioChip from '../AudioChip';
import { cn } from '@/lib/utils';

/**
 * Picture Match — Novakid-style.
 * Audio prompt + text prompt → tap one of 3-4 pictures.
 * Lighter than the full `match` activity (one tap target, not pair-matching).
 */
interface PictureMatchProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

interface Option {
  image_url?: string;
  imageUrl?: string;
  label?: string;
  correct?: boolean;
  id?: string;
}

export default function PictureMatchActivity({
  slide,
  onCorrect,
  onIncorrect,
}: PictureMatchProps) {
  const data = slide?.interactive_data || slide?.content || slide || {};
  const promptText: string =
    data.prompt_text || data.prompt || data.question || slide?.title || '';
  const promptAudioUrl: string | undefined =
    data.prompt_audio || data.audio || data.audioUrl;
  const options: Option[] = Array.isArray(data.options) ? data.options : [];

  const [picked, setPicked] = useState<number | null>(null);

  const handlePick = (i: number) => {
    if (picked != null) return;
    setPicked(i);
    if (options[i]?.correct) onCorrect?.();
    else onIncorrect?.();
  };

  return (
    <div className="w-full h-full min-h-[480px] flex flex-col items-center justify-center p-6 gap-8">
      <div className="flex items-center gap-3 text-center">
        <AudioChip text={promptText} audioUrl={promptAudioUrl} size="lg" />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {promptText}
        </h2>
      </div>

      <div
        className={cn(
          'grid gap-4 w-full max-w-3xl',
          options.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-' + Math.min(options.length, 4),
        )}
      >
        {options.map((opt, i) => {
          const url = opt.image_url || opt.imageUrl;
          const isPicked = picked === i;
          const showRight = picked != null && opt.correct;
          const showWrong = isPicked && !opt.correct;
          return (
            <motion.button
              key={opt.id || i}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePick(i)}
              disabled={picked != null}
              className={cn(
                'relative rounded-2xl border-2 bg-card p-3 transition-all',
                'aspect-square flex flex-col items-center justify-center gap-2',
                picked == null && 'border-border hover:border-primary',
                showRight && 'border-success bg-success/10',
                showWrong && 'border-destructive bg-destructive/10',
                !isPicked && picked != null && !opt.correct && 'opacity-60',
              )}
              aria-label={opt.label || `Option ${i + 1}`}
            >
              {url ? (
                <img
                  src={url}
                  alt={opt.label || ''}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="text-xl font-semibold">{opt.label}</span>
              )}
              {opt.label && url && (
                <span className="text-sm font-medium text-foreground">{opt.label}</span>
              )}
              {showRight && (
                <Check className="absolute top-2 right-2 w-6 h-6 text-success" />
              )}
              {showWrong && (
                <X className="absolute top-2 right-2 w-6 h-6 text-destructive" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
