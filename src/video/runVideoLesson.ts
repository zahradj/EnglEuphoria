// Video Lesson track — orchestrator entry.
// Stage 8.5 hook: called by runLessonGeneration when video_lesson_enabled === true.
// Phase 2 scaffold: composes directive + questions; storage/videogen wire in later phase.

import { buildVideoDirective } from './videoDirective';
import { buildVideoQuestions } from './questionBuilder';
import type { VideoLessonInput, VideoLessonSpec } from './types';

export interface RunVideoLessonResult {
  spec: VideoLessonSpec;
  verdict: 'ok' | 'skip' | 'blocked';
  reasons: string[];
}

export function runVideoLesson(input: VideoLessonInput): RunVideoLessonResult {
  const reasons: string[] = [];
  if (!input.targets || input.targets.length === 0) {
    return {
      spec: {
        directive: buildVideoDirective(input),
        questions: [],
      },
      verdict: 'blocked',
      reasons: ['VIDEO_MISSING_TARGET_BINDING'],
    };
  }
  if (!input.characters || input.characters.length === 0) {
    reasons.push('VIDEO_NO_NAMED_CAST');
  }

  const directive = buildVideoDirective(input);
  const questions = buildVideoQuestions({
    targets: input.targets,
    vocab: input.vocab,
    hub: input.hub,
    count: input.targets.length >= 3 ? 3 : 2,
  });

  return {
    spec: { directive, questions },
    verdict: reasons.length === 0 ? 'ok' : 'ok',
    reasons,
  };
}
