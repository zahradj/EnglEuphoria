// WTCMonitorProvider — Willingness-to-Communicate baseline engine (Playground).
//
// Requests microphone access, runs an AnalyserNode loop to compute average dB,
// and — while a <SpeakingMission /> is the active task — dispatches a
// LOW_CONFIDENCE event when the average stays below -40 dB for >5 s.
//
// Consumers (Lesson Runner) listen to `lowConfidence` and may swap the speaking
// task for a low-pressure <ClickToReveal /> game to lower the affective filter.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type WTCActiveTask = 'speaking' | 'other' | null;

export type WTCEvent =
  | { type: 'LOW_CONFIDENCE'; at: number; avgDb: number }
  | { type: 'RECOVERED'; at: number };

interface WTCMonitorContextValue {
  /** Latest rolling average dBFS (negative number). null = not measuring. */
  avgDb: number | null;
  /** True while the LOW_CONFIDENCE state is active. */
  lowConfidence: boolean;
  /** Tell the provider what task the runner is currently showing. */
  setActiveTask: (task: WTCActiveTask) => void;
  /** Manually clear LOW_CONFIDENCE (e.g. after fallback game completes). */
  clearLowConfidence: () => void;
  /** Subscribe to events (LOW_CONFIDENCE / RECOVERED). */
  subscribe: (fn: (e: WTCEvent) => void) => () => void;
  /** Microphone permission state. */
  micState: 'idle' | 'requesting' | 'granted' | 'denied';
}

const WTCMonitorContext = createContext<WTCMonitorContextValue | null>(null);

const DB_THRESHOLD = -40;        // below this = "quiet"
const LOW_CONF_HOLD_MS = 5_000;  // must persist for 5s

export interface WTCMonitorProviderProps {
  children: ReactNode;
  /** Set false to disable monitoring entirely (e.g. teacher preview). */
  enabled?: boolean;
}

export function WTCMonitorProvider({ children, enabled = true }: WTCMonitorProviderProps) {
  const [avgDb, setAvgDb] = useState<number | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [micState, setMicState] = useState<WTCMonitorContextValue['micState']>('idle');
  const activeTaskRef = useRef<WTCActiveTask>(null);
  const quietStartRef = useRef<number | null>(null);
  const listenersRef = useRef<Set<(e: WTCEvent) => void>>(new Set());

  const emit = useCallback((e: WTCEvent) => {
    listenersRef.current.forEach((fn) => {
      try { fn(e); } catch { /* noop */ }
    });
  }, []);

  const setActiveTask = useCallback((task: WTCActiveTask) => {
    activeTaskRef.current = task;
    quietStartRef.current = null;
  }, []);

  const clearLowConfidence = useCallback(() => {
    setLowConfidence(false);
    quietStartRef.current = null;
    emit({ type: 'RECOVERED', at: Date.now() });
  }, [emit]);

  const subscribe = useCallback((fn: (e: WTCEvent) => void) => {
    listenersRef.current.add(fn);
    return () => { listenersRef.current.delete(fn); };
  }, []);

  // Mic + analyser loop
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    let ac: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;

    (async () => {
      setMicState('requesting');
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setMicState('granted');
        ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const src = ac.createMediaStreamSource(stream);
        analyser = ac.createAnalyser();
        analyser.fftSize = 1024;
        src.connect(analyser);
        const buf = new Float32Array(analyser.fftSize);

        const loop = () => {
          if (!analyser) return;
          analyser.getFloatTimeDomainData(buf);
          // RMS → dBFS
          let sumSq = 0;
          for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
          const rms = Math.sqrt(sumSq / buf.length);
          const db = rms > 0 ? 20 * Math.log10(rms) : -100;
          setAvgDb(db);

          if (activeTaskRef.current === 'speaking') {
            const now = performance.now();
            if (db < DB_THRESHOLD) {
              if (quietStartRef.current == null) quietStartRef.current = now;
              else if (
                !lowConfidence &&
                now - quietStartRef.current >= LOW_CONF_HOLD_MS
              ) {
                setLowConfidence(true);
                emit({ type: 'LOW_CONFIDENCE', at: Date.now(), avgDb: db });
              }
            } else {
              quietStartRef.current = null;
            }
          } else {
            quietStartRef.current = null;
          }

          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch {
        setMicState('denied');
      }
    })();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      try { stream?.getTracks().forEach((t) => t.stop()); } catch { /* noop */ }
      try { ac?.close(); } catch { /* noop */ }
    };
    // lowConfidence is read inside the loop via closure; emit is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, emit]);

  const value = useMemo<WTCMonitorContextValue>(
    () => ({ avgDb, lowConfidence, setActiveTask, clearLowConfidence, subscribe, micState }),
    [avgDb, lowConfidence, setActiveTask, clearLowConfidence, subscribe, micState],
  );

  return <WTCMonitorContext.Provider value={value}>{children}</WTCMonitorContext.Provider>;
}

export function useWTCMonitor(): WTCMonitorContextValue {
  const ctx = useContext(WTCMonitorContext);
  if (!ctx) throw new Error('useWTCMonitor must be used inside <WTCMonitorProvider>');
  return ctx;
}

/**
 * Convenience hook for SpeakingMission components: marks the active task as
 * 'speaking' on mount, clears on unmount, and exposes the low-confidence flag.
 */
export function useSpeakingMissionPresence() {
  const { setActiveTask, lowConfidence, avgDb, clearLowConfidence } = useWTCMonitor();
  useEffect(() => {
    setActiveTask('speaking');
    return () => setActiveTask(null);
  }, [setActiveTask]);
  return { lowConfidence, avgDb, clearLowConfidence };
}
