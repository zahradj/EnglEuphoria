import { useRef, useState } from 'react';
import { Mic, Square, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkActivityProps } from './types';
import { HUB_THEME } from './types';

export function MiniRecording({ hub, task, onComplete }: HomeworkActivityProps) {
  const theme = HUB_THEME[hub];
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch {
      // permission denied — allow simulated completion
      setAudioUrl('sim');
    }
  };
  const stop = () => { try { recRef.current?.stop(); } catch {} setRecording(false); };

  const submit = () => { setSubmitted(true); onComplete?.(); };

  return (
    <div className={cn('mx-auto w-full max-w-md rounded-3xl border-2 p-6 shadow-xl text-center', theme.frame)}>
      <p className={cn('text-xs font-extrabold uppercase tracking-wider mb-3', theme.accent)}>Speak it out</p>
      <div className="rounded-2xl bg-white border-2 border-slate-200 p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-500 uppercase">Say this aloud</p>
        <p className="text-xl font-extrabold text-slate-900 mt-2">"{task.prompt}"</p>
      </div>

      {/* Waveform pulse */}
      <div className="mt-5 flex items-end justify-center gap-1 h-14">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className={cn('w-1.5 rounded-full transition-all', theme.bubble,
              recording ? 'animate-pulse' : 'opacity-30')}
            style={{ height: recording ? `${20 + ((i * 13) % 40)}px` : '8px' }}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={recording ? stop : start}
          className={cn('inline-flex items-center gap-2 rounded-full px-6 py-3 font-extrabold shadow-lg active:scale-95',
            recording ? 'bg-rose-500 text-white' : theme.button)}
        >
          {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {recording ? 'Stop' : 'Record'}
        </button>
      </div>

      {audioUrl && audioUrl !== 'sim' && (
        <audio controls src={audioUrl} className="mx-auto block mt-3" />
      )}

      {audioUrl && !submitted && (
        <button
          onClick={submit}
          className={cn('mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2 font-extrabold shadow', theme.button)}
        >
          <Play className="w-4 h-4" /> Submit
        </button>
      )}

      {submitted && (
        <p className="mt-3 text-emerald-600 font-extrabold inline-flex items-center gap-1 justify-center w-full">
          <CheckCircle2 className="w-4 h-4" /> Recording sent!
        </p>
      )}
    </div>
  );
}
