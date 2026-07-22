// Video Lesson track — shared types.
// See .lovable/plan.md → "Video Lesson Track" for pedagogy contract.

import type { Cefr, Hub } from '@/governance/types';
import type { ReinforcementTarget } from '@/coherence/types';

export type VideoQuestionKind = 'tap_picture' | 'yes_no';

export interface TapPictureOption {
  id: string;              // stable id (usually vocab word or image key)
  label: string;           // audio hint / caption for TTS
  image_prompt?: string;   // used if we need to render a thumbnail
}

export interface VideoQuestion {
  kind: VideoQuestionKind;
  target_id: string;       // ReinforcementTarget.id this checks
  prompt_text: string;     // spoken by Lily via TTS; never shown to Pre-A1
  prompt_audio?: string;   // filled at render time
  options: TapPictureOption[] | ['yes', 'no'];
  correct_index: number;
}

export interface VideoDirective {
  prompt: string;
  starting_frame_prompt: string;
  duration_seconds: 5 | 10;
  cefr: Cefr;
  hub: Hub;
  target_ids: string[];
  cache_key_input: string;
}

export interface VideoLessonSpec {
  directive: VideoDirective;
  questions: VideoQuestion[];
}

export interface VideoLessonInput {
  cefr: Cefr;
  hub: Hub;
  topic: string;
  characters: string[];               // named from CAST_ROSTER
  vocab: string[];                    // lesson target vocab
  targets: ReinforcementTarget[];     // from runCoherence()
  lessonId?: string;
}
