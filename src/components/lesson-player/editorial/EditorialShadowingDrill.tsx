import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Volume2, Mic, Square, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBrowserSpeechRecognition } from '@/hooks/useBrowserSpeechRecognition';
import { gradeShadowing, type GradeResult } from '@/utils/levenshteinGrader';
import { cn } from '@/lib/utils';

interface EditorialShadowingDrillProps {
  slide: any;
  onCorrect?: () => void;
}

export default function EditorialShadowingDrill({ slide, onCorrect }: EditorialShadowingDrillProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const targetPhrase = payload.target_phrase || payload.text || '';
  const title = slide?.title || 'Shadowing Drill';

  const [recording, setRecording] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const speech = useBrowserSpeechRecognition({ language: 'en-US', continuous: true });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(async () => {
    setGradeResult(null);
    speech.reset();
    setElapsed(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorder.current = mr;
      mr.start();
      speech.start();
      setRecording(true);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      console.error('Microphone access denied');
    }
  }, [speech]);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    speech.stop();
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [speech]);

  // Grade when recording stops and we have a transcript
  useEffect(() => {
    if (!recording && speech.transcript && targetPhrase && !gradeResult) {
      const result = gradeShadowing(targetPhrase, speech.transcript);
      setGradeResult(result);
      if (result.accuracy >= 70) onCorrect?.();
    }
  }, [recording, speech.transcript, targetPhrase, gradeResult, onCorrect]);

  const handleRetry = () => {
    setGradeResult(null);
    speech.reset();
    setElapsed(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!targetPhrase) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="font-serif text-3xl font-bold text-slate-800 mb-4">{slide.title}</h2>
        <p className="text-slate-600">{slide.description}</p>
        <p className="mt-8 text-sm text-amber-600 italic">Interactive data missing for this activity.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <Volume2 className="w-8 h-8 text-cyan-500 mt-1 flex-shrink-0" />
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
          {title}
        </h2>
      </div>

      {/* Target phrase display */}
      <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-8 border border-cyan-200 text-center">
        <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">🗣️ Repeat this phrase</p>
        <p className="text-2xl md:text-3xl font-serif font-bold text-slate-800 leading-relaxed">
          "{targetPhrase}"
        </p>
      </div>

      {/* Live transcript */}
      {(recording || speech.transcript) && !gradeResult && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 min-h-[60px]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            🎧 Live Transcript
          </p>
          <p className="text-lg text-slate-700">
            {speech.transcript || (
              <span className="text-slate-300 italic">Listening…</span>
            )}
          </p>
        </div>
      )}

      {/* Grade Result */}
      {gradeResult && (
        <div className={cn(
          'rounded-xl border-2 p-6 space-y-4',
          gradeResult.accuracy >= 90 ? 'border-emerald-300 bg-emerald-50' :
          gradeResult.accuracy >= 70 ? 'border-amber-300 bg-amber-50' :
          'border-rose-300 bg-rose-50'
        )}>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-3xl font-bold">
                {gradeResult.emoji} {gradeResult.accuracy}%
              </p>
              <p className="text-sm font-semibold text-slate-600">{gradeResult.label}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRetry} className="gap-1.5">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          </div>

          {/* Color-coded word breakdown */}
          <div className="flex flex-wrap gap-1.5">
            {gradeResult.wordResults.map((w, i) => (
              <span
                key={i}
                className={cn(
                  'px-2.5 py-1 rounded-md text-sm font-medium',
                  w.correct
                    ? 'bg-emerald-500/20 text-emerald-700'
                    : 'bg-rose-500/20 text-rose-700 line-through'
                )}
              >
                {w.word}
              </span>
            ))}
          </div>

          {speech.transcript && (
            <p className="text-xs text-slate-500 italic">You said: "{speech.transcript}"</p>
          )}
        </div>
      )}

      {/* Recording Controls */}
      {!gradeResult && (
        <div className={cn(
          'rounded-xl border-2 p-6 transition-all',
          recording ? 'border-red-300 bg-red-50 animate-pulse' : 'border-dashed border-slate-300 bg-white'
        )}>
          <div className="flex flex-col items-center gap-4">
            {recording ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-600 font-mono font-semibold text-lg">{formatTime(elapsed)}</span>
                </div>
                <Button onClick={stopRecording} variant="destructive" className="gap-2 px-8 py-3">
                  <Square className="w-4 h-4" /> Stop Recording
                </Button>
              </>
            ) : (
              <>
                <p className="text-slate-500 text-sm font-medium">
                  {speech.isSupported
                    ? '🎤 Shadow the phrase — your words will appear live'
                    : '🎤 Shadow the phrase — say it exactly as written'
                  }
                </p>
                <Button onClick={startRecording} className="gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white">
                  <Mic className="w-4 h-4" /> Start Recording
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {!speech.isSupported && (
        <p className="text-xs text-amber-500 text-center italic">
          Live transcription is not supported in this browser. Recording audio only.
        </p>
      )}
    </div>
  );
}
