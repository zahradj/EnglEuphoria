// Voice service. Academy rule (CLAUDE.md "Voice"): ONLY the recorded character voices; a missing clip means SILENCE, never the browser's voice.
// It wraps the Academy clip player (pre-baked clips listed in a manifest) and adds a mute switch for the comfort dock.
import { audioBaseFor, hasClip, loadManifest, playLine, stopLine } from '../../academy-deck/audio';

let muted = false;
export const setMuted = (m: boolean) => { muted = m; if (m) stopLine(); };
export const isMuted = () => muted;

export interface VoiceLine { who: string; text: string }

/** Say a line with its recorded clip. Resolves true if a clip played, false (silently) if there is none or sound is off. */
export async function sayLine(line: VoiceLine, artBase = '/academy-art'): Promise<boolean> {
  if (muted) return false;
  const base = audioBaseFor(artBase);
  try {
    await loadManifest(base);
    if (!hasClip(base, line.who, line.text)) return false;
    return await playLine(line.who, line.text, { base });
  } catch {
    return false;
  }
}

/** Say several lines one after another. */
export async function saySequence(lines: VoiceLine[], artBase = '/academy-art'): Promise<void> {
  for (const l of lines) {
    if (muted) return;
    await sayLine(l, artBase);
  }
}

export const stopVoice = stopLine;
