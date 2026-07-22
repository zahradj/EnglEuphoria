import React, { useState, useCallback, useEffect } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, RotateCcw, Star, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MimicPhaseSlideProps {
  imageUrl?: string;
  targetWord: string;
  phonemeTarget?: string;
  targetPhonemes?: string[];
  onComplete?: (score: number) => void;
}

export const MimicPhaseSlide: React.FC<MimicPhaseSlideProps> = ({
  imageUrl,
  targetWord,
  phonemeTarget,
  targetPhonemes = [],
  onComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [masteryScore, setMasteryScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackVisual, setFeedbackVisual] = useState<string>('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        await processAudio(audioBlob);
      };

      setAudioChunks([]);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorder?.stop();
    setIsRecording(false);
  }, [mediaRecorder]);

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const base64Audio = await base64Promise;

      const { data, error } = await supabase.functions.invoke('phonetic-analysis', {
        body: {
          studentAudio: base64Audio,
          targetWord,
          targetPhonemes,
        },
      });

      if (error) throw error;

      setMasteryScore(data.masteryScore);
      setFeedback(data.overallFeedback);
      setFeedbackVisual(data.feedbackVisual);
      onComplete?.(data.masteryScore);
    } catch (err) {
      console.error('Phonetic analysis failed:', err);
      setFeedback('Let\'s try again! Make sure to speak clearly.');
      setFeedbackVisual('try_again');
    } finally {
      setIsProcessing(false);
    }
  };

  const playTargetAudio = () => {
    void playElevenLabs(targetWord, { speed: 0.9 });
  };

  const getScoreColor = () => {
    if (!masteryScore) return 'border-muted';
    if (masteryScore >= 85) return 'border-green-500 ring-2 ring-green-200';
    if (masteryScore >= 50) return 'border-amber-500 ring-2 ring-amber-200';
    return 'border-red-400 ring-2 ring-red-200';
  };

  const reset = () => {
    setMasteryScore(null);
    setFeedback('');
    setFeedbackVisual('');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
      {/* Phase Badge */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold">
        🎤 Mimic Phase
      </div>

      {/* Phoneme Target */}
      {phonemeTarget && (
        <div className="mb-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
          <span className="text-lg font-mono font-bold text-green-600 dark:text-green-400">
            Target: {phonemeTarget}
          </span>
        </div>
      )}

      {/* Image + Word */}
      <div className={cn(
        'w-64 h-64 rounded-2xl border-4 overflow-hidden mb-6 transition-all duration-500',
        getScoreColor()
      )}>
        {imageUrl ? (
          <img src={imageUrl} alt={targetWord} className="w-full h-full object-contain bg-white" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-6xl">
            🔊
          </div>
        )}
      </div>

      {/* Listen Button */}
      <Button variant="outline" size="sm" className="mb-6 gap-2" onClick={playTargetAudio}>
        <Volume2 className="h-4 w-4" /> Listen First
      </Button>

      {/* Recording Area */}
      <AnimatePresence mode="wait">
        {masteryScore === null ? (
          <motion.div
            key="record"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg',
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-green-500 hover:bg-green-600',
                isProcessing && 'opacity-50 cursor-not-allowed'
              )}
              whileTap={{ scale: 0.95 }}
            >
              {isProcessing ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </motion.button>
            <p className="text-sm text-muted-foreground">
              {isProcessing ? 'Analyzing...' : isRecording ? 'Tap to stop' : `Say "${targetWord}" clearly`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 max-w-sm text-center"
          >
            {/* Score */}
            <div className={cn(
              'text-5xl font-bold',
              masteryScore >= 85 ? 'text-green-500' : masteryScore >= 50 ? 'text-amber-500' : 'text-red-400'
            )}>
              {masteryScore >= 85 && <Star className="inline h-8 w-8 fill-yellow-400 text-yellow-400 mr-2" />}
              {masteryScore}%
            </div>

            {/* Feedback */}
            <p className="text-base text-foreground font-medium">{feedback}</p>

            {/* Visual feedback hint */}
            {feedbackVisual === 'mouth_position' && (
              <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 text-sm text-blue-700 dark:text-blue-300">
                💋 Focus on tongue and lip position
              </div>
            )}
            {feedbackVisual === 'pulsing_letter' && (
              <div className="px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 text-sm text-amber-700 dark:text-amber-300">
                ✨ Don't forget the ending sound!
              </div>
            )}

            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
