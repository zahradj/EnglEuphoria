import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Check } from 'lucide-react';
import AudioChip from '../AudioChip';
import { cn } from '@/lib/utils';

/**
 * Listen & Repeat — Novakid-style.
 * Big picture + word + 🔊 (hear) + 🎤 (record + mimic score).
 * Mimic scoring is delegated to the existing phonetic mimic engine via SpeakingPractice
 * if the host wants strict grading; this lighter card is for the high-frequency
 * vocab-cycle beats where bravery counts more than accuracy.
 */
interface ListenRepeatProps {
  slide: any;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export default function ListenRepeatActivity({ slide, onCorrect }: ListenRepeatProps) {
  const data = slide?.interactive_data || slide?.content || slide || {};
  const word: string = data.word || data.target_word || slide?.title || '';
  const definition: string = data.definition || data.meaning || '';
  const imageUrl: string | undefined =
    slide?.imageUrl || slide?.image_url || data.image_url || data.imageUrl;
  const audioUrl: string | undefined = data.audio || data.audioUrl || data.audio_url;

  const [recorded, setRecorded] = useState(false);

  const handleRecord = () => {
    setRecorded(true);
    onCorrect?.();
  };

  return (
    <div className="w-full h-full min-h-[480px] grid place-items-center p-6">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl bg-card border border-border rounded-3xl p-8 text-center shadow-sm"
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={word}
            className="mx-auto w-56 h-56 md:w-72 md:h-72 object-contain rounded-2xl bg-muted"
            loading="lazy"
          />
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">{word}</h2>
          <AudioChip text={word} audioUrl={audioUrl} size="lg" />
        </div>

        {definition && (
          <p className="mt-3 text-muted-foreground text-lg">{definition}</p>
        )}

        <button
          type="button"
          onClick={handleRecord}
          className={cn(
            'mt-8 inline-flex items-center gap-3 rounded-full px-7 py-4',
            'font-semibold text-lg transition-all active:scale-95',
            recorded
              ? 'bg-success/20 text-success'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
          aria-label="Tap to repeat the word"
        >
          {recorded ? (
            <>
              <Check className="w-5 h-5" /> Nice repeat!
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" /> Your turn — say it!
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
