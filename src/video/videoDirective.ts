// Video Lesson track — deterministic prompt builder.
// Follows Visual Architect V0 guard tail: single panel, no text/UI chrome, hub style.

import type { Cefr, Hub } from '@/governance/types';
import type { VideoDirective, VideoLessonInput } from './types';

const HUB_STYLE: Record<Hub, string> = {
  playground:
    'Kawaii Comic Cartoon, thick clean outlines, flat warm palette (orange/yellow), child-safe, expressive faces',
  academy:
    'Semi-realistic anime, soft cel-shading, blue/purple accents',
  success:
    'Editorial flat illustration, muted/professional palette, green/teal accents',
};

const GUARD_TAIL =
  'SINGLE PANEL, no diptych, no grid, no collage. NO TEXT, NO SPEECH BUBBLES, ' +
  'NO LETTERS, NO WATERMARK, NO UI CHROME, NO SOFTWARE EDITING BACKGROUND, ' +
  'NO CHECKERBOARD, NO COLOR PICKER, NO TOOLBAR, NO PHOTOSHOP/CANVA ARTIFACTS. ' +
  'Clean illustrated background only.';

const DURATION_FOR_CEFR: Record<Cefr, 5 | 10> = {
  'Pre-A1': 5,
  A1: 5,
  A2: 10,
  B1: 10,
  B2: 10,
  C1: 10,
};

function pickVerbForVocab(vocab: string[]): string {
  // Deterministic: pick verb-like anchor from vocab if present, else generic action.
  const verby = vocab.find((v) => /(?:ing|run|jump|eat|drink|play|walk|sing|dance)/i.test(v));
  return verby ?? 'playing together';
}

export function buildVideoDirective(input: VideoLessonInput): VideoDirective {
  const { cefr, hub, topic, characters, vocab, targets } = input;
  const style = HUB_STYLE[hub];
  const cast = characters.length ? characters.join(' and ') : 'a friendly cast';
  const vocabInAction = vocab.slice(0, 3).join(', ') || topic;
  const anchor = pickVerbForVocab(vocab);
  const duration = DURATION_FOR_CEFR[cefr] as 5 | 10;

  const scenePrompt =
    `A short animated cartoon: ${cast} in a ${topic} setting, ` +
    `${anchor}, showing ${vocabInAction} clearly in the action. ` +
    `${duration} seconds, smooth motion, camera_fixed. STYLE: ${style}. ${GUARD_TAIL}`;

  const framePrompt =
    `Opening frame anchor: ${cast} in a ${topic} setting with ${vocabInAction} visible. ` +
    `STYLE: ${style}. ${GUARD_TAIL}`;

  const target_ids = targets.map((t) => t.id);
  const cache_key_input = [
    scenePrompt,
    cefr,
    hub,
    duration,
    target_ids.join(','),
  ].join('|');

  return {
    prompt: scenePrompt,
    starting_frame_prompt: framePrompt,
    duration_seconds: duration,
    cefr,
    hub,
    target_ids,
    cache_key_input,
  };
}
