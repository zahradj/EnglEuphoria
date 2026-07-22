import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playSlideAudio } from '@/lib/playSlideAudio';

/**
 * AudioChip — Novakid-style per-item audio button.
 * Tap to hear the word/sentence. Reuses playSlideAudio (ElevenLabs TTS cache).
 * Pure presentational — no business logic.
 */
interface AudioChipProps {
  text: string;
  audioUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const AudioChip: React.FC<AudioChipProps> = ({
  text,
  audioUrl,
  size = 'md',
  className,
  label,
}) => {
  const [loading, setLoading] = useState(false);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const onPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    playSlideAudio({
      text,
      audioUrl,
      onEnd: () => setLoading(false),
      onError: () => setLoading(false),
    });
  };

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={label || `Play audio: ${text}`}
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'bg-primary/10 hover:bg-primary/20 text-primary',
        'transition-all active:scale-95 shrink-0',
        sizes[size],
        className,
      )}
    >
      {loading ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </button>
  );
};

export default AudioChip;
