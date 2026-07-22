// React hook that wires VolumeDetector + GazeDetector + PostureDetector to a
// student's <video> element + MediaStream and emits live WTCState.
//
// Persists rollups to public.wtc_signals every 15s (anonymized, consent-gated).

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  GazeDetector,
  PostureDetector,
  VolumeDetector,
  countNegatives,
  fuseWTC,
  type WTCSignal,
  type WTCState,
} from '@/wtc';

interface UseWTCMonitorOpts {
  enabled: boolean;
  studentId?: string;
  sessionId?: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  audioStream?: MediaStream | null;
  /** ms between persisted rollups */
  persistEveryMs?: number;
}

export function useWTCMonitor({
  enabled,
  studentId,
  sessionId,
  videoRef,
  audioStream,
  persistEveryMs = 15_000,
}: UseWTCMonitorOpts) {
  const [state, setState] = useState<WTCState | null>(null);
  const negStartRef = useRef<number | null>(null);
  const lastPersistRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const volume = new VolumeDetector();
    const gaze = new GazeDetector();
    const posture = new PostureDetector();

    // --- Audio level via WebAudio ---
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let audioRaf = 0;
    if (audioStream && audioStream.getAudioTracks().length) {
      try {
        audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(audioStream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser!.getByteFrequencyData(buf);
          const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
          volume.push((avg / 255) * 100);
          audioRaf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        /* ignore */
      }
    }

    // --- Video sampling loop @ 2fps ---
    const interval = window.setInterval(async () => {
      const v = videoRef.current;
      if (!v) return;
      posture.sample(v);
      if (gaze.available()) await gaze.sample(v);

      const signal: WTCSignal = {
        recordedAt: new Date().toISOString(),
        volume: volume.band(),
        gazeRatio: gaze.ratio(),
        posture: posture.posture(),
        gestureRate: posture.gestureRate(),
        facialNegativity: 0, // reserved for a future expression model
      };

      const negNow = countNegatives(signal) >= 2;
      const now = Date.now();
      if (negNow) {
        negStartRef.current = negStartRef.current ?? now;
      } else {
        negStartRef.current = null;
      }
      const negativeStreakMs = negStartRef.current ? now - negStartRef.current : 0;

      const next = fuseWTC({ signal, negativeStreakMs });
      setState(next);

      // Persist rollup (best-effort, silent on failure)
      if (studentId && now - lastPersistRef.current >= persistEveryMs) {
        lastPersistRef.current = now;
        void supabase.from('wtc_signals').insert({
          student_id: studentId,
          session_id: sessionId ?? null,
          wtc_score: next.wtcScore,
          anxiety_level: next.anxietyLevel,
          volume: signal.volume,
          gaze_ratio: signal.gazeRatio,
          posture: signal.posture,
          gesture_rate: signal.gestureRate,
          triggered_action:
            next.recommendation === 'continue' ? null : next.recommendation,
        });
      }
    }, 500);

    return () => {
      window.clearInterval(interval);
      if (audioRaf) cancelAnimationFrame(audioRaf);
      audioCtx?.close().catch(() => undefined);
    };
  }, [enabled, studentId, sessionId, videoRef, audioStream, persistEveryMs]);

  return state;
}
