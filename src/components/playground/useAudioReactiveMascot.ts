/**
 * useAudioReactiveMascot
 * ----------------------
 * Tracks whether ANY <audio> or <video> element on the page is currently
 * playing. Used by ImmersivePlaygroundShell to make Pip bounce/pulse in time
 * with ElevenLabs TTS or any other media playback during a lesson activity.
 *
 * Strategy: capture-phase listeners on `play` / `playing` / `pause` / `ended`
 * events at the document level. Maintains a small Set of currently-playing
 * media elements; exposes `isSpeaking = set.size > 0`.
 *
 * Zero coupling to the rest of the app — works no matter which underlying
 * activity component plays audio.
 */
import { useEffect, useState } from 'react';

export function useAudioReactiveMascot(): { isSpeaking: boolean } {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const playing = new Set<HTMLMediaElement>();
    const update = () => setIsSpeaking(playing.size > 0);

    const onPlay = (e: Event) => {
      const t = e.target;
      if (t instanceof HTMLMediaElement) {
        playing.add(t);
        update();
      }
    };
    const onStop = (e: Event) => {
      const t = e.target;
      if (t instanceof HTMLMediaElement) {
        playing.delete(t);
        update();
      }
    };

    document.addEventListener('play', onPlay, true);
    document.addEventListener('playing', onPlay, true);
    document.addEventListener('pause', onStop, true);
    document.addEventListener('ended', onStop, true);
    document.addEventListener('emptied', onStop, true);

    return () => {
      document.removeEventListener('play', onPlay, true);
      document.removeEventListener('playing', onPlay, true);
      document.removeEventListener('pause', onStop, true);
      document.removeEventListener('ended', onStop, true);
      document.removeEventListener('emptied', onStop, true);
    };
  }, []);

  return { isSpeaking };
}
