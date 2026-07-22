import sample from './sampleLesson.json';
import type { LessonJSON } from '../engine/types';

export function loadSampleLesson(): LessonJSON {
  return sample as LessonJSON;
}
