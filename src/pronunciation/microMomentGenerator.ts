// Generates micro-pronunciation moments to inject into a lesson's slides.
// Lightweight, contextual, must not interrupt flow.

import type { LessonPlan } from '@/planning/types';
import type {
  PronunciationFocus,
  PronunciationMicroMoment,
} from './types';
import { PRONUNCIATION_HUB_PROFILES } from './hubProfiles';

export interface MicroMomentOptions {
  plan: LessonPlan;
  focus: PronunciationFocus;
  maxMoments?: number;
}

export function generateMicroMoments(opts: MicroMomentOptions): PronunciationMicroMoment[] {
  const { plan, focus } = opts;
  const profile = PRONUNCIATION_HUB_PROFILES[plan.lesson_state.hub];
  if (!profile.allowed_layers.includes('micro')) return [];

  const max = opts.maxMoments ?? Math.min(6, Math.floor(plan.flow_map.reduce((s, f) => s + f.slide_count, 0) / 3));
  const out: PronunciationMicroMoment[] = [];
  let nextSlide = 1;

  // Pre-A1 non-readers: audio-anchored rhyme/onset drills. No letters, no
  // written hints — the hint field carries a spoken cue that the TTS layer
  // reads aloud, and the trigger is the target word itself (child taps
  // matching picture, not letters).
  const preA1 = String(plan.lesson_state.cefr ?? '').toLowerCase().replace(/[\s_-]/g, '') === 'prea1';

  if (preA1) {
    for (const sound of focus.target_sounds) {
      if (out.length >= max) break;
      out.push({
        id: `mm_${out.length + 1}`,
        type: 'sound_highlight',
        trigger_word_or_phrase: sound,
        // Hint is spoken via TTS — non-readers never see the text.
        hint: `Listen. ${sound}. Say it with me.`,
        attached_to_slide_index: nextSlide,
      });
      nextSlide += 2;
    }
    // At Pre-A1 we intentionally skip stress + connected-speech drills — they
    // require metalinguistic awareness the learner does not have yet.
    return out;
  }

  for (const stress of focus.stress_patterns) {
    if (out.length >= max) break;
    out.push({
      id: `mm_${out.length + 1}`,
      type: 'stress',
      trigger_word_or_phrase: stress.toLowerCase(),
      hint: `Stress the capitalized syllable: "${stress}".`,
      attached_to_slide_index: nextSlide,
    });
    nextSlide += 2;
  }

  for (const sound of focus.target_sounds) {
    if (out.length >= max) break;
    out.push({
      id: `mm_${out.length + 1}`,
      type: 'sound_highlight',
      trigger_word_or_phrase: sound,
      hint: `Listen for the ${sound} sound — say it cleanly without adding an extra syllable.`,
      attached_to_slide_index: nextSlide,
    });
    nextSlide += 2;
  }

  for (const cs of focus.connected_speech_targets) {
    if (out.length >= max) break;
    out.push({
      id: `mm_${out.length + 1}`,
      type: 'connected_speech',
      trigger_word_or_phrase: cs,
      hint: `In natural speech, "${cs}" — try saying it both ways and notice the rhythm.`,
      attached_to_slide_index: nextSlide,
    });
    nextSlide += 2;
  }

  return out;
}

