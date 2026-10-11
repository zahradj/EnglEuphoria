// Voice: pre-recorded character clips only. NEVER browser text-to-speech (CLAUDE.md hard rule).
// If a clip is missing or cannot play, the player stays silent; it never switches to another voice.
let current: HTMLAudioElement | null = null;

export function stopVoice() {
  if (current) {
    current.pause();
    current = null;
  }
}

/** Play a recorded clip by id from /audio-cache/academy/<id>.mp3. Resolves true if it started, false (silently) if not. */
export async function playVoice(id: string | undefined, opts: { muted?: boolean; rate?: number } = {}): Promise<boolean> {
  stopVoice();
  if (!id || opts.muted || typeof Audio === 'undefined') return false;
  try {
    const a = new Audio(`/audio-cache/academy/${id}.mp3`);
    a.playbackRate = opts.rate ?? 1;
    current = a;
    await a.play();
    return true;
  } catch {
    return false;
  }
}
