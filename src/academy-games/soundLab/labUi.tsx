import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

/** Sound Lab look: a cool lab at night (deep navy, teal glass, gold for the lock). */
export function LabBackdrop() {
  const dots = Array.from({ length: 16 }, (_, i) => ({ left: (i * 61 + 7) % 100, top: (i * 37 + 11) % 100, delay: (i * 0.4) % 5, size: 3 + (i % 3) * 2 }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(110% 80% at 50% -10%, #134e4a 0%, #0f2a44 42%, #070d1f 85%)' }} />
      {dots.map((d, i) => (
        <motion.span key={i} className="absolute rounded-full bg-teal-200" style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size }} animate={{ opacity: [0.1, 0.7, 0.1], y: [0, -10, 0] }} transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: d.delay, ease: 'easeInOut' }} />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(0deg, rgba(45,212,191,.22), rgba(45,212,191,0))' }} />
    </div>
  );
}

/** A teal answer button with press and hover feel. */
export function LabButton({ children, onClick, disabled, tone = 'idle', index = 0, ariaLabel, wide, hot }: { children: ReactNode; onClick: (el: Element) => void; disabled?: boolean; tone?: 'idle' | 'right' | 'wrong'; index?: number; ariaLabel?: string; wide?: boolean; hot?: boolean }) {
  const bg = tone === 'right' ? 'linear-gradient(180deg,#34d399,#059669)' : tone === 'wrong' ? 'rgba(255,255,255,.08)' : 'linear-gradient(180deg,#0d9488,#115e59)';
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => onClick(e.currentTarget)}
      initial={{ y: 22, opacity: 0, scale: 0.85 }}
      animate={tone === 'wrong' ? { x: [0, -7, 7, -4, 4, 0], opacity: 0.5, scale: 1, y: 0 } : { y: 0, opacity: 1, scale: hot ? [1, 1.06, 1] : 1 }}
      transition={tone === 'wrong' ? { duration: 0.45 } : { type: 'spring', stiffness: 280, damping: 16, delay: index * 0.07, ...(hot ? { scale: { repeat: Infinity, duration: 1.1 } } : {}) }}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      className={`min-h-[56px] rounded-2xl border border-white/20 px-4 py-2 text-lg font-extrabold text-white shadow-[0_6px_0_rgba(0,0,0,.35)] disabled:cursor-default ${wide ? 'w-full' : ''}`}
      style={{ background: bg }}
    >
      {children}
    </motion.button>
  );
}

/**
 * A lock pin: it holds a word. When it is the right one it rises into the lock and clicks (spring + a short settle).
 * `state` drives the motion; the word is always readable text.
 */
export function Pin({ word, state, onPick, disabled, index }: { word: string; state: 'idle' | 'right' | 'wrong' | 'hint'; onPick: (el: Element) => void; disabled?: boolean; index: number }) {
  return (
    <motion.button
      type="button"
      aria-label={word}
      disabled={disabled}
      onClick={(e) => onPick(e.currentTarget)}
      initial={{ y: 60, opacity: 0 }}
      animate={state === 'right' ? { y: [-6, -34, -26], opacity: 1 } : state === 'wrong' ? { x: [0, -8, 8, -5, 5, 0], opacity: 0.45, y: 0 } : { y: 0, opacity: 1 }}
      transition={state === 'right' ? { duration: 0.5, ease: 'easeOut' } : state === 'wrong' ? { duration: 0.45 } : { type: 'spring', stiffness: 250, damping: 16, delay: index * 0.1 }}
      whileHover={disabled ? undefined : { y: -8 }}
      whileTap={disabled ? undefined : { scale: 0.93 }}
      className="relative flex w-full flex-col items-center disabled:cursor-default"
    >
      {/* the pin: a brass cylinder with the word on its head */}
      <span
        className="flex min-h-[84px] w-full max-w-[220px] items-center justify-center rounded-t-3xl rounded-b-lg border-2 px-3 text-2xl font-black text-slate-900 shadow-[0_8px_0_rgba(0,0,0,.35)] sm:min-h-[104px] sm:text-4xl"
        style={{
          background: state === 'right' ? 'linear-gradient(180deg,#6ee7b7,#10b981)' : 'linear-gradient(180deg,#fde68a,#d9a441)',
          borderColor: state === 'hint' ? '#5eead4' : state === 'right' ? '#a7f3d0' : '#fff7d6',
          boxShadow: state === 'hint' ? '0 0 0 4px rgba(94,234,212,.55), 0 8px 0 rgba(0,0,0,.35)' : undefined,
        }}
      >
        {word}
      </span>
      <span className="h-10 w-5 rounded-b bg-gradient-to-b from-amber-200 to-amber-600 sm:h-14" />
    </motion.button>
  );
}

export function SpeakerButton({ onClick, label, small, active }: { onClick: () => void; label: string; small?: boolean; active?: boolean }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.86 }}
      animate={active ? { scale: [1, 1.12, 1] } : undefined}
      transition={{ duration: 0.6, repeat: active ? Infinity : 0 }}
      className={`flex items-center justify-center rounded-full bg-white text-teal-700 shadow-lg ${small ? 'h-10 w-10' : 'h-14 w-14'}`}
    >
      <Volume2 className={small ? 'h-5 w-5' : 'h-7 w-7'} />
    </motion.button>
  );
}

/**
 * Private voice recording: the microphone data stays in this browser tab, is played back here and is dropped when the
 * panel closes. Nothing is uploaded and nothing is scored (Academy plan: minors' voice is personal data).
 */
export function useRecorder() {
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
  const [state, setState] = useState<'idle' | 'recording' | 'recorded' | 'denied'>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null); // so the recording can be dropped even while unmounting
  const timer = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }, []);

  const stop = useCallback(() => {
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop();
  }, []);

  const start = useCallback(async () => {
    if (!supported) { setState('denied'); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      chunks.current = [];
      const r = new MediaRecorder(s);
      rec.current = r;
      r.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data); };
      r.onstop = () => {
        const blob = new Blob(chunks.current, { type: r.mimeType || 'audio/webm' });
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(blob);
        setUrl(urlRef.current);
        setState('recorded');
        cleanup();
      };
      r.start();
      setState('recording');
      timer.current = window.setTimeout(stop, 4000); // a word needs two seconds; never record longer than four
    } catch {
      setState('denied');
      cleanup();
    }
  }, [cleanup, stop, supported]);

  const reset = useCallback(() => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); urlRef.current = null; setUrl(null); setState('idle'); }, []);

  useEffect(() => () => {
    cleanup();
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, [cleanup]);

  return { supported, state, url, start, stop, reset };
}
