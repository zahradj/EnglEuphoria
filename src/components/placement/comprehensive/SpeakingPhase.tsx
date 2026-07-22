import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SPEAKING_PROMPT } from './content';
import { accentFor } from '../hubAccent';
import type { Hub } from '../questionBanks';

export interface SpeakingResult {
  prompt: string;
  audioBlob: Blob | null;
  durationMs: number;
}

interface Props {
  hub?: Hub;
  onComplete: (result: SpeakingResult) => void;
}

const SpeakingPhase: React.FC<Props> = ({ hub, onComplete }) => {
  const accent = accentFor(hub);
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const startedAt = useRef<number>(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    // Also stop any active recorder if the user leaves mid-recording.
    if (recRef.current && recRef.current.state !== 'inactive') {
      try { recRef.current.stop(); } catch { /* noop */ }
    }
  }, [url]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
      rec.onstop = () => {
        const b = new Blob(chunks.current, { type: 'audio/webm' });
        setBlob(b);
        setUrl(URL.createObjectURL(b));
        setDuration(Date.now() - startedAt.current);
        stream.getTracks().forEach((t) => t.stop());
      };
      recRef.current = rec;
      startedAt.current = Date.now();
      rec.start();
      setRecording(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Microphone access denied';
      setError(msg);
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    setBlob(null);
    setUrl(null);
    setDuration(0);
  };

  const submit = () => onComplete({ prompt: SPEAKING_PROMPT.prompt, audioBlob: blob, durationMs: duration });

  return (
    <div className="h-full flex flex-col p-5 sm:p-6 text-white">
      <h2 className="text-lg sm:text-xl font-bold mb-1">Speaking</h2>
      <p className="text-xs text-white/70 mb-4">{SPEAKING_PROMPT.guidance}</p>

      <div className="rounded-2xl bg-white/10 border border-white/15 p-4 mb-5 text-sm sm:text-base">
        {SPEAKING_PROMPT.prompt}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.button
          onClick={recording ? stop : start}
          whileTap={{ scale: 0.95 }}
          animate={recording ? { boxShadow: ['0 0 0 0 rgba(244,63,94,0.6)', '0 0 0 18px rgba(244,63,94,0)'] } : {}}
          transition={recording ? { duration: 1.4, repeat: Infinity } : {}}
          className={[
            'h-20 w-20 rounded-full flex items-center justify-center transition-colors text-white border-0',
            recording ? 'bg-rose-500' : `bg-gradient-to-r ${accent.cta}`,
          ].join(' ')}
        >
          {recording ? <Square className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </motion.button>

        <div className="text-xs text-white/70 h-4">
          {recording ? 'Recording… tap to stop' : blob ? `Recorded ${(duration / 1000).toFixed(1)}s` : 'Tap the mic to start'}
        </div>

        {url && (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => new Audio(url).play()}
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
            >
              <Play className="w-4 h-4 mr-1" /> Play
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={reset}
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Re-record
            </Button>
          </div>
        )}

        {error && <div className="text-xs text-rose-300">{error}</div>}
      </div>

      <div className="pt-3 flex gap-2">
        <Button
          variant="ghost"
          onClick={() => onComplete({ prompt: SPEAKING_PROMPT.prompt, audioBlob: null, durationMs: 0 })}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          Skip
        </Button>
        <Button
          onClick={submit}
          disabled={!blob}
          className={`flex-1 text-white border-0 bg-gradient-to-r ${accent.cta} shadow-lg ${accent.ctaShadow}`}
        >
          Submit Test
        </Button>
      </div>
    </div>
  );
};

export default SpeakingPhase;
