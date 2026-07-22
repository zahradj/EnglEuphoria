import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhonicsDrillSlideProps {
  phonemeTarget: string;
  phonemeLabel?: string;
  imageUrl?: string;
  onComplete?: (score: number) => void;
  onAccuracyUpdate?: (accuracy: number) => void;
}

export const PhonicsDrillSlide: React.FC<PhonicsDrillSlideProps> = ({
  phonemeTarget,
  phonemeLabel,
  imageUrl,
  onComplete,
  onAccuracyUpdate,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [waveValues, setWaveValues] = useState<number[]>(Array(24).fill(0.1));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const masterWave = Array(24).fill(0).map((_, i) => 0.3 + Math.sin(i * 0.7) * 0.5);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setShowResult(false);
    intervalRef.current = setInterval(() => {
      setWaveValues(prev => prev.map(() => 0.1 + Math.random() * 0.8));
    }, 80);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const simulatedAccuracy = Math.min(98, 55 + newAttempts * 14 + Math.random() * 10);
    const roundedAccuracy = Math.round(simulatedAccuracy);
    setAccuracy(roundedAccuracy);
    setShowResult(true);
    onAccuracyUpdate?.(roundedAccuracy);

    if (simulatedAccuracy >= 80) {
      setTimeout(() => onComplete?.(roundedAccuracy), 1500);
    }
  }, [attempts, onComplete, onAccuracyUpdate]);

  const handleRetry = useCallback(() => {
    setShowResult(false);
    setAccuracy(null);
    setWaveValues(Array(24).fill(0.1));
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
      {/* Phase Label */}
      <div className="mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          Layer 1 — Phonics Drill
        </span>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-1">Isolated Sound Practice</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Focus on the physical mechanics of the sound
      </p>

      {/* Target Phoneme Display */}
      <motion.div
        animate={{ scale: isRecording ? [1, 1.06, 1] : 1 }}
        transition={{ repeat: isRecording ? Infinity : 0, duration: 0.6 }}
        className="h-32 w-32 rounded-full border-4 border-[#6B21A8]/20 bg-[#6B21A8]/5 flex flex-col items-center justify-center mb-6"
      >
        <span className="font-mono text-5xl font-bold text-[#6B21A8]">/{phonemeTarget}/</span>
        {phonemeLabel && (
          <span className="text-xs text-muted-foreground mt-1">{phonemeLabel}</span>
        )}
      </motion.div>

      {/* Waveform Comparison */}
      <div className="w-full max-w-lg grid grid-cols-2 gap-4 mb-8">
        {/* Master */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5 text-center uppercase tracking-wider">
            Master Sound
          </p>
          <div className="flex items-end justify-center gap-[2px] h-14 bg-muted/20 rounded-lg px-2 py-1.5">
            {masterWave.map((v, i) => (
              <div
                key={i}
                className="w-1.5 bg-[#4CAF50]/50 rounded-full"
                style={{ height: `${v * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Student */}
        <div>
          <p className="text-[10px] font-medium text-muted-foreground mb-1.5 text-center uppercase tracking-wider">
            Your Sound
          </p>
          <div className="flex items-end justify-center gap-[2px] h-14 bg-muted/20 rounded-lg px-2 py-1.5">
            {waveValues.map((v, i) => (
              <motion.div
                key={i}
                className="w-1.5 rounded-full"
                animate={{ height: `${v * 100}%` }}
                transition={{ duration: 0.08 }}
                style={{ backgroundColor: isRecording ? '#6B21A8' : '#94a3b8' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Record Button */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className={cn(
          'h-20 w-20 rounded-full flex items-center justify-center shadow-lg transition-colors',
          isRecording ? 'bg-[#EF5350] text-white' : 'bg-[#6B21A8] text-white hover:bg-[#6B21A8]/90'
        )}
      >
        {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
      </motion.button>
      <p className="text-xs text-muted-foreground mt-2">
        {isRecording ? 'Recording... release to check' : 'Hold to record'}
      </p>

      {/* Result Feedback */}
      <AnimatePresence>
        {showResult && accuracy !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mt-6 px-6 py-3 rounded-xl text-center',
              accuracy >= 80 ? 'bg-[#4CAF50]/10 text-[#2E7D32]' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
            )}
          >
            <p className="text-lg font-bold">{accuracy}% Accuracy</p>
            {accuracy >= 80 ? (
              <p className="text-sm flex items-center gap-1 justify-center">
                <CheckCircle2 className="h-4 w-4" /> Sound mastered! Advancing...
              </p>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleRetry} className="mt-1 gap-1">
                <RotateCcw className="h-3 w-3" /> Try again
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
