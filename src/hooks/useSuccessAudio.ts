import { useCallback, useRef, useState } from 'react';
import { playElevenLabs, stopElevenLabs } from '@/lib/elevenLabsAudio';
import { supabase } from '@/integrations/supabase/client';

/**
 * useSuccessAudio — restrained, manual-trigger TTS for the Success Hub.
 *
 * Voice: George (JBFqnCBsd6RMkjVDRZzb) — mature, professional, neutral.
 * Audio is reserved for dialogues, listening, and pronunciation — never auto-plays.
 */
const SUCCESS_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';
const cache = new Map<string, string>();

async function fetchAudioUrl(text: string, voiceId = SUCCESS_VOICE_ID): Promise<string | null> {
  const key = `${voiceId}::${text}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: { text, voiceId, speed: 1.0 },
    });
    if (error || !data) return null;
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

export function useSuccessAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
  }, []);

  const playVoice = useCallback(async (text: string, voiceId?: string) => {
    if (!text?.trim()) return;
    stop();
    setIsLoading(true);
    const url = await fetchAudioUrl(text, voiceId);
    setIsLoading(false);
    if (!url) {
      void playElevenLabs(text);
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    try { await audio.play(); } catch { setIsPlaying(false); }
  }, [stop]);

  return { playVoice, stop, isPlaying, isLoading };
}
