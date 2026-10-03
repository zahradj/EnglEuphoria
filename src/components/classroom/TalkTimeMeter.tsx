import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SpeechGate } from '@/lib/talkTime';

/**
 * Measures how long THIS person speaks in the lesson and reports only the count (seconds), never audio.
 *
 * Safety rules for living inside the live classroom:
 *  - OFF unless VITE_TALK_TIME === 'on' (renders nothing, runs nothing).
 *  - Reuses the microphone stream the room already holds. It never opens a second microphone, and the
 *    analyser is not connected to any output, so it can't play or echo anything.
 *  - No React state and no re-renders: a timer, refs and one RPC every 15 seconds.
 *  - Fails silent. Any error is swallowed, and an error boundary around it means a bug here can never take
 *    the classroom down.
 *  - A muted microphone (track.enabled = false) yields silence, which correctly counts as no speech.
 */

const ENABLED = import.meta.env.VITE_TALK_TIME === 'on';
const SAMPLE_MS = 200;
const FLUSH_MS = 15_000;

interface Props {
  /** class_bookings.id - the lesson this measurement belongs to. */
  bookingId: string | null | undefined;
  /** The room's existing local microphone stream. */
  stream: MediaStream | null | undefined;
}

function Meter({ bookingId, stream }: Props) {
  useEffect(() => {
    if (!bookingId || !stream || stream.getAudioTracks().length === 0) return;

    let ctx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let sampleTimer: ReturnType<typeof setInterval> | undefined;
    let flushTimer: ReturnType<typeof setInterval> | undefined;
    const gate = new SpeechGate();

    const flush = () => {
      try {
        const seconds = gate.takeSeconds();
        if (seconds > 0) {
          // The generated Supabase types don't know this RPC yet.
          void Promise.resolve((supabase as any).rpc('record_talk_time', {
            p_room_id: bookingId,
            p_speaking_seconds: seconds,
          })).then(() => undefined, () => undefined);
        }
      } catch { /* never throw into the classroom */ }
    };

    try {
      const AC: typeof AudioContext | undefined =
        typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : undefined;
      if (!AC) return;

      ctx = new AC();
      source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser); // deliberately NOT connected to ctx.destination
      const buf = new Float32Array(analyser.fftSize);
      const audioCtx = ctx;

      sampleTimer = setInterval(() => {
        try {
          if (audioCtx.state === 'suspended') void audioCtx.resume().catch(() => undefined);
          analyser.getFloatTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
          gate.update(Math.sqrt(sum / buf.length), performance.now());
        } catch { /* skip this sample */ }
      }, SAMPLE_MS);
      flushTimer = setInterval(flush, FLUSH_MS);
    } catch {
      return; // measurement unavailable on this browser/device: carry on without it
    }

    return () => {
      try {
        if (sampleTimer) clearInterval(sampleTimer);
        if (flushTimer) clearInterval(flushTimer);
        flush();
        source?.disconnect();
        void ctx?.close().catch(() => undefined);
      } catch { /* ignore */ }
    };
  }, [bookingId, stream]);

  return null;
}

class Boundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* swallow: talk-time is a nice-to-have and must never affect the lesson */
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export const TalkTimeMeter: React.FC<Props> = (props) =>
  ENABLED ? (
    <Boundary>
      <Meter {...props} />
    </Boundary>
  ) : null;

export default TalkTimeMeter;
