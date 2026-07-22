import React, { useEffect } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { motion } from 'framer-motion';
import { Volume2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrimePhaseSlideProps {
  imageUrl?: string;
  targetWord: string;
  wordType?: 'noun' | 'verb' | 'adjective' | 'other';
  onComplete?: () => void;
}

export const PrimePhaseSlide: React.FC<PrimePhaseSlideProps> = ({
  imageUrl,
  targetWord,
  wordType = 'noun',
  onComplete,
}) => {
  const borderColor = wordType === 'noun'
    ? 'border-blue-400 shadow-blue-200/50'
    : wordType === 'verb'
    ? 'border-green-400 shadow-green-200/50'
    : 'border-purple-400 shadow-purple-200/50';

  const glowColor = wordType === 'noun'
    ? 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
    : wordType === 'verb'
    ? 'shadow-[0_0_30px_rgba(34,197,94,0.3)]'
    : 'shadow-[0_0_30px_rgba(168,85,247,0.3)]';

  const playAudio = () => {
    void playElevenLabs(targetWord, { speed: 0.85 });
  };

  // Auto-play pronunciation on mount
  useEffect(() => {
    const timer = setTimeout(playAudio, 800);
    return () => clearTimeout(timer);
  }, [targetWord]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
      {/* Phase Badge */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
        👀 Prime Phase — Watch & Listen
      </div>

      {/* Visual-only image — NO text label */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
        className={cn(
          'w-80 h-80 rounded-3xl border-4 overflow-hidden transition-all',
          borderColor,
          glowColor,
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-contain bg-white" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Eye className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
      </motion.div>

      {/* Listen button (no text shown — pure audio priming) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-8"
      >
        <Button
          onClick={playAudio}
          size="lg"
          className="gap-3 rounded-full px-8 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
        >
          <Volume2 className="h-6 w-6" />
          Listen Again
        </Button>
      </motion.div>

      {/* Word type indicator (subtle, for teacher reference) */}
      <div className="absolute bottom-4 right-4 px-2 py-1 rounded text-xs text-muted-foreground/50 bg-muted/30">
        {wordType}
      </div>
    </div>
  );
};
