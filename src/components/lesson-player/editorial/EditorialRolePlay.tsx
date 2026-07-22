import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageSquare, Mic, Square, Play, Pause, Send, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorialRolePlayProps {
  slide: any;
  onCorrect?: () => void;
}

export default function EditorialRolePlay({ slide, onCorrect }: EditorialRolePlayProps) {
  const payload = slide?.interactive_data || slide?.content || {};
  const scenarioText = payload.scenario_text || slide?.description || '';
  const tips: string[] = Array.isArray(payload.tips) ? payload.tips : [];
  const keyPhrases: string[] = Array.isArray(payload.key_phrases) ? payload.key_phrases : [];

  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current = mr;
      mr.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } catch {
      console.error('Microphone access denied');
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleReRecord = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setSubmitted(false);
    setPlaying(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onCorrect?.();
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="flex items-start gap-3">
        <MessageSquare className="w-8 h-8 text-pink-500 mt-1 flex-shrink-0" />
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
          {slide.title || 'Role Play'}
        </h2>
      </div>

      {/* Scenario Box */}
      {scenarioText && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">📖 Scenario</h3>
          <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-line">{scenarioText}</p>
        </div>
      )}

      {/* Key Phrases */}
      {keyPhrases.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">🗝️ Key Phrases to Use</h3>
          <div className="flex flex-wrap gap-2">
            {keyPhrases.map((phrase, i) => (
              <span
                key={i}
                className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-200"
              >
                "{phrase}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
          <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">💡 Tips</h3>
          <ul className="space-y-1.5">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                <span className="mt-0.5 text-amber-400">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Waveform placeholder */}
      <div className="w-full h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
        Audio Intonation Waveform (Pending)
      </div>

      {/* Voice Recorder */}
      <div className={`rounded-xl border-2 p-6 transition-all ${
        submitted
          ? 'border-emerald-300 bg-emerald-50'
          : recording
            ? 'border-red-300 bg-red-50 animate-pulse'
            : 'border-dashed border-slate-300 bg-white'
      }`}>
        {submitted ? (
          <div className="flex items-center justify-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <p className="text-emerald-700 font-semibold">Response submitted! Your teacher will review it.</p>
          </div>
        ) : !audioURL ? (
          <div className="flex flex-col items-center gap-4">
            {recording ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-600 font-mono font-semibold text-lg">{formatTime(elapsed)}</span>
                </div>
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="gap-2 px-8 py-3"
                >
                  <Square className="w-4 h-4" /> Stop Recording
                </Button>
              </>
            ) : (
              <>
                <p className="text-slate-500 text-sm font-medium">🎤 Record your spoken response</p>
                <Button
                  onClick={startRecording}
                  className="gap-2 px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <Mic className="w-4 h-4" /> Start Recording
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setPlaying(false)}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={togglePlayback} className="gap-1.5">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {playing ? 'Pause' : 'Play Back'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReRecord} className="gap-1.5 text-slate-500">
                <RotateCcw className="w-4 h-4" /> Re-record
              </Button>
            </div>
            <Button onClick={handleSubmit} className="gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white">
              <Send className="w-4 h-4" /> Submit Response
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
