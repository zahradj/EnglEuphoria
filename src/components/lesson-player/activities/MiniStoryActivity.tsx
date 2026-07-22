import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import AudioChip from '../AudioChip';
import { cn } from '@/lib/utils';

/**
 * Mini Story — Novakid-style.
 * 4-6 illustrated frames, 1 optional question per frame, character-consistent.
 * Sits between full `storybook` and `multiple_choice`.
 */
interface Frame {
  image_url?: string;
  imageUrl?: string;
  caption: string;
  audio?: string;
  audioUrl?: string;
  question?: {
    prompt: string;
    options: { label: string; correct?: boolean }[];
  };
  passive?: boolean;
}

interface MiniStoryProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onComplete?: () => void;
}

export default function MiniStoryActivity({
  slide,
  onCorrect,
  onIncorrect,
  onComplete,
}: MiniStoryProps) {
  const data = slide?.interactive_data || slide?.content || slide || {};
  const frames: Frame[] = Array.isArray(data.frames) ? data.frames : [];
  const title: string = data.title || slide?.title || 'Story Time';

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const frame = frames[idx];
  const url = frame?.image_url || frame?.imageUrl;
  const audioUrl = frame?.audio || frame?.audioUrl;

  const next = () => {
    if (idx < frames.length - 1) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      onComplete?.();
    }
  };
  const prev = () => {
    if (idx > 0) {
      setIdx(idx - 1);
      setPicked(null);
    }
  };

  const pickAnswer = (i: number) => {
    if (picked != null) return;
    setPicked(i);
    if (frame?.question?.options[i]?.correct) onCorrect?.();
    else onIncorrect?.();
  };

  if (!frame) {
    return (
      <div className="w-full h-full grid place-items-center p-8 text-muted-foreground">
        Story has no frames yet.
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[520px] flex flex-col p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground font-medium">
          Frame {idx + 1} / {frames.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex-1 grid md:grid-cols-2 gap-6 items-center"
        >
          <div className="rounded-2xl bg-muted overflow-hidden aspect-square w-full max-w-md mx-auto">
            {url ? (
              <img
                src={url}
                alt={frame.caption}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-muted-foreground">
                No image
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <AudioChip text={frame.caption} audioUrl={audioUrl} size="md" />
              <p className="text-lg md:text-xl leading-relaxed text-foreground">
                {frame.caption}
              </p>
            </div>

            {frame.question && (
              <div className="rounded-2xl bg-card border border-border p-4">
                <p className="font-semibold text-foreground mb-3">
                  {frame.question.prompt}
                </p>
                <div className="grid gap-2">
                  {frame.question.options.map((opt, i) => {
                    const isPicked = picked === i;
                    const showRight = picked != null && opt.correct;
                    const showWrong = isPicked && !opt.correct;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => pickAnswer(i)}
                        disabled={picked != null}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                          'bg-background',
                          picked == null && 'border-border hover:border-primary',
                          showRight && 'border-success bg-success/10',
                          showWrong && 'border-destructive bg-destructive/10',
                          picked != null && !isPicked && !opt.correct && 'opacity-60',
                        )}
                      >
                        <span className="font-medium">{opt.label}</span>
                        {showRight && <Check className="w-5 h-5 text-success" />}
                        {showWrong && <X className="w-5 h-5 text-destructive" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-4 px-2">
        <button
          type="button"
          onClick={prev}
          disabled={idx === 0}
          className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 font-medium text-foreground disabled:opacity-40 active:scale-95 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!!frame.question && picked == null}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2 font-semibold disabled:opacity-40 active:scale-95 transition"
        >
          {idx === frames.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
