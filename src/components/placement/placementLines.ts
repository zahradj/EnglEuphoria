/**
 * Every line the placement tests speak, as (voice, text) pairs - the single list the bake script
 * (scripts/generate-voice-cache.mjs, `--lesson=PLACEMENT`) turns into saved MP3 files under
 * public/audio-cache/. The tests then PLAY THOSE FILES; they never generate speech live.
 *
 * Pure data, no browser imports, so it loads in plain Node. Voices are the approved no-accent ones from
 * the voice policy: 'teacher' for the Academy / Success Hub tests, 'pip' for the Playground tests.
 */
import { getHubPool, type Hub } from './questionBanks';
import { LISTENING_ITEMS } from './comprehensive/content';
import { SETS as ACADEMY_TRIAL_LISTENING } from '../trial/academy-trail/listeningSets';
import { LISTENING as SUCCESS_TRIAL_LISTENING } from '../trial/success-trail/levels';

export type PlacementVoice = 'teacher' | 'pip';

export const placementVoiceForHub = (hub: Hub): PlacementVoice => (hub === 'playground' ? 'pip' : 'teacher');

interface KidsContentLike {
  pip?: { intro?: string };
  sections?: { questions?: { audioPrompt?: string }[] }[];
}

/** `kidsContent` = DEFAULT_PLAYGROUND_CONTENT (passed in so this file stays free of browser-only imports). */
export function placementLines(kidsContent?: KidsContentLike | null): [PlacementVoice, string][] {
  const out: [PlacementVoice, string][] = [];

  for (const hub of ['playground', 'academy', 'professional'] as Hub[]) {
    for (const q of getHubPool(hub)) {
      if (q.audio_script) out.push([placementVoiceForHub(hub), q.audio_script]);
    }
  }

  // Comprehensive placement listening stage (Academy / Professional).
  for (const item of LISTENING_ITEMS) if (item.audio_text) out.push(['teacher', item.audio_text]);

  // Free-trial trails: Academy "Listening Lab" sentences and Success listening scripts.
  for (const set of Object.values(ACADEMY_TRIAL_LISTENING)) {
    for (const q of set) if (q.target) out.push(['teacher', q.target]);
  }
  for (const item of Object.values(SUCCESS_TRIAL_LISTENING)) if (item.script) out.push(['teacher', item.script]);

  if (kidsContent) {
    if (kidsContent.pip?.intro) out.push(['pip', kidsContent.pip.intro]);
    for (const section of kidsContent.sections ?? []) {
      for (const q of section.questions ?? []) {
        if (q.audioPrompt) out.push(['pip', q.audioPrompt]);
      }
    }
  }
  return out;
}
