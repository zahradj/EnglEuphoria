/**
 * Unified ElevenLabs audio playback.
 * Per architecture lock: NO native browser TTS fallback. ElevenLabs is the
 * exclusive source of spoken audio across the app.
 *
 * Circuit breaker: once the API returns quota_exceeded / 401 / 402, we mark
 * TTS as disabled for the rest of the session so we don't flood the network
 * and the console with retries. A single warning is logged.
 */
import { supabase } from '@/integrations/supabase/client';

export interface PlayElevenLabsOptions {
  voiceId?: string;
  speed?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (e: unknown) => void;
}

let currentAudio: HTMLAudioElement | null = null;

// ---- session-wide circuit breaker ---------------------------------------
let ttsDisabled = false;
let ttsDisabledReason = '';
let warnedOnce = false;

export function isTtsDisabled() {
  return ttsDisabled;
}
export function getTtsDisabledReason() {
  return ttsDisabledReason;
}

function tripBreakerFromError(e: unknown) {
  // Inspect message / status for quota / auth failures.
  const msg = (() => {
    if (!e) return '';
    if (typeof e === 'string') return e;
    if (e instanceof Error) return e.message;
    try { return JSON.stringify(e); } catch { return String(e); }
  })().toLowerCase();

  const ctxStatus = (e as any)?.context?.status ?? (e as any)?.status;
  const isQuota =
    msg.includes('quota_exceeded') ||
    msg.includes('quota exceeded') ||
    msg.includes('insufficient') ||
    msg.includes('credits');
  const isAuth = ctxStatus === 401 || ctxStatus === 402 || msg.includes('401') || msg.includes('402');

  if (isQuota || isAuth) {
    ttsDisabled = true;
    ttsDisabledReason = isQuota ? 'ElevenLabs quota exhausted' : 'ElevenLabs auth/payment required';
    if (!warnedOnce) {
      warnedOnce = true;
      // eslint-disable-next-line no-console
      console.warn(
        `[ElevenLabs] TTS disabled for this session — ${ttsDisabledReason}. ` +
        `Top up credits or update the API key in Supabase secrets.`,
      );
    }
    return true;
  }
  return false;
}

export function stopElevenLabs() {
  try {
    currentAudio?.pause();
    currentAudio = null;
  } catch { /* noop */ }
}

export async function playElevenLabs(
  text: string,
  opts: PlayElevenLabsOptions = {}
): Promise<HTMLAudioElement | null> {
  const { voiceId = 'Xb7hH8MSUJpSbSDYk0k2', speed, onStart, onEnd, onError } = opts;
  if (!text || !text.trim()) return null;
  if (ttsDisabled) {
    // Silent no-op — emulate completion so UI flows that await audio don't hang.
    onStart?.();
    onEnd?.();
    return null;
  }

  stopElevenLabs();

  try {
    const { data, error } = await supabase.functions.invoke('generate-elevenlabs-audio', {
      body: { text, voiceId, speed },
    });
    if (error) throw error;
    if (!data) throw new Error('No audio data returned from generate-elevenlabs-audio');

    const blob = data instanceof Blob ? data : new Blob([data as ArrayBuffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onplay = () => onStart?.();
    audio.onended = () => { onEnd?.(); URL.revokeObjectURL(url); };
    audio.onerror = (e) => { onError?.(e); URL.revokeObjectURL(url); };
    await audio.play();
    return audio;
  } catch (e) {
    const tripped = tripBreakerFromError(e);
    if (!tripped && !warnedOnce) {
      warnedOnce = true;
      // eslint-disable-next-line no-console
      console.warn('[ElevenLabs] playback failed (further errors suppressed this session):', e);
    }
    onError?.(e);
    return null;
  }
}

/** Plays a remote audio URL if provided, else generates via ElevenLabs. No native TTS. */
export async function playAudioUrlOrTts(
  audioUrl: string | null | undefined,
  text: string,
  opts: PlayElevenLabsOptions = {}
): Promise<HTMLAudioElement | null> {
  if (audioUrl) {
    stopElevenLabs();
    try {
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.onplay = () => opts.onStart?.();
      audio.onended = () => opts.onEnd?.();
      audio.onerror = (e) => opts.onError?.(e);
      await audio.play();
      return audio;
    } catch (e) {
      console.warn('[ElevenLabs] remote URL failed, generating fresh audio:', e);
    }
  }
  return playElevenLabs(text, opts);
}
