import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useBrowserSpeechRecognition } from '@/hooks/useBrowserSpeechRecognition';

export interface SpeechEvaluation {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  pronunciationScore: number;
  transcript: string;
  wordBreakdown: Array<{ word: string; spoken: string; correct: boolean; issue?: string }>;
  feedback: string;
  tier: 'gold' | 'soft' | 'revert';
  encouragement: string;
}

interface VoiceRecorderProps {
  targetSentence: string;
  hub?: 'playground' | 'academy' | 'success';
  context?: string;
  onResult?: (result: SpeechEvaluation) => void;
  maxSeconds?: number;
}

export const VoiceRecorder = ({
  targetSentence,
  hub = 'academy',
  context,
  onResult,
  maxSeconds = 15,
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SpeechEvaluation | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const speech = useBrowserSpeechRecognition({ language: 'en-US', continuous: true });

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    speech.stop();
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  }, [speech]);

  const evaluate = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const base64 = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke('ai-core', {
        body: {
          action: 'evaluate_speech',
          audioBase64: base64,
          mimeType: 'audio/webm',
          targetSentence,
          hub,
          context,
        },
      });
      if (error) {
        const ctx: any = (error as any)?.context;
        let msg = (error as Error)?.message || 'Could not evaluate speech.';
        try {
          if (ctx?.body && typeof ctx.body.getReader === 'function') {
            const text = await new Response(ctx.body).text();
            const parsed = JSON.parse(text);
            if (parsed?.error === 'INSUFFICIENT_VOICE_ENERGY') {
              toast.error('Out of Voice Energy ⚡', {
                description: parsed.message || 'Upgrade your plan to keep practicing.',
                duration: 7000,
              });
              return;
            }
            msg = parsed?.message || parsed?.error || msg;
          }
        } catch { /* ignore */ }
        throw new Error(msg);
      }
      setResult(data);
      onResult?.(data);

      if (data.tier === 'gold') toast.success(`⭐ ${data.encouragement}`);
      else if (data.tier === 'soft') toast(data.encouragement);
      else toast.warning(data.encouragement);
    } catch (e) {
      const msg = (e as Error)?.message || '';
      console.error(e);
      // Surface specific Voice Energy / auth messages verbatim, otherwise show the friendly load message.
      if (/voice energy|unauthor|credits/i.test(msg)) {
        toast.error(msg);
      } else {
        toast.error('AI is heavily loaded. Please wait 10 seconds and try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    setResult(null);
    setElapsed(0);
    speech.reset();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      chunksRef.current = [];

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) await evaluate(blob);
      };

      mr.start();
      speech.start();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= maxSeconds) {
            stopRecording();
            return maxSeconds;
          }
          return s + 1;
        });
      }, 1000);
    } catch (e) {
      console.error(e);
      toast.error('Microphone access denied.');
    }
  };

  const reset = () => {
    setResult(null);
    setElapsed(0);
    speech.reset();
  };

  const tierStyles =
    result?.tier === 'gold'
      ? 'border-emerald-500/40 bg-emerald-500/10'
      : result?.tier === 'soft'
      ? 'border-amber-500/40 bg-amber-500/10'
      : 'border-rose-500/40 bg-rose-500/10';

  return (
    <Card className="p-6 backdrop-blur-xl bg-card/60 border border-border/50 shadow-lg space-y-4">
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">Say this aloud</p>
        <p className="text-xl md:text-2xl font-semibold">{targetSentence}</p>
      </div>

      {!result && (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={cn(
              'relative h-20 w-20 rounded-full flex items-center justify-center transition-all',
              'bg-primary text-primary-foreground shadow-lg hover:scale-105',
              isRecording && 'animate-pulse bg-rose-500',
              isProcessing && 'opacity-60 cursor-not-allowed'
            )}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isProcessing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : isRecording ? (
              <Square className="h-8 w-8" fill="currentColor" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </button>

          {isRecording && (
            <div className="w-full max-w-xs space-y-1">
              <Progress value={(elapsed / maxSeconds) * 100} className="h-1.5" />
              <p className="text-xs text-center text-muted-foreground">
                {elapsed}s / {maxSeconds}s
              </p>
            </div>
          )}

          {/* Live transcript while recording */}
          {(isRecording || (speech.transcript && !isProcessing)) && !result && (
            <div className="w-full max-w-md rounded-lg border border-border/50 bg-muted/30 p-3 min-h-[44px]">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                🎧 Live Transcript
              </p>
              <p className="text-sm">
                {speech.transcript || (
                  <span className="text-muted-foreground/50 italic">Listening…</span>
                )}
              </p>
            </div>
          )}

          {!isRecording && !isProcessing && !speech.transcript && (
            <p className="text-xs text-muted-foreground">Tap the mic and speak clearly</p>
          )}
        </div>
      )}

      {result && (
        <div className={cn('rounded-xl border p-4 space-y-3', tierStyles)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-2xl font-bold">{result.overallScore}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-1" /> Retry
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-semibold">{result.accuracyScore}</div>
              <div className="text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="font-semibold">{result.pronunciationScore}</div>
              <div className="text-muted-foreground">Pronunciation</div>
            </div>
            <div>
              <div className="font-semibold">{result.fluencyScore}</div>
              <div className="text-muted-foreground">Fluency</div>
            </div>
          </div>

          {result.wordBreakdown?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.wordBreakdown.map((w, i) => (
                <span
                  key={i}
                  title={w.issue || ''}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-xs font-medium',
                    w.correct
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                  )}
                >
                  {w.word}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm">{result.feedback}</p>
          {result.transcript && (
            <p className="text-xs text-muted-foreground italic">You said: "{result.transcript}"</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default VoiceRecorder;
