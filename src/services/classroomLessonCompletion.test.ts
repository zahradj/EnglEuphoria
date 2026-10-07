import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HOMEWORK_QUESTS } from '@/content/homework-quests/registry';
import { SCENE_LESSON_REGISTRY } from '@/content/playground-library/sceneLessonRegistry';
import { identifyLesson } from './classroomLessonCompletion';
import { getWelcomeTownLesson } from '@/content/playground-library/welcomeTownLessonRegistry';

describe('classroom lesson completion (library homework → student dashboard)', () => {
  it('every Homework Quest belongs to a lesson a live class can finish, so its key is recognised from the scenes', () => {
    for (const q of Object.values(HOMEWORK_QUESTS)) {
      const m = q.lessonKey.match(/^(.*)-(\d+)-(\d+)$/)!;
      const [, fmt, u, l] = m;
      const scenes = fmt === 'lep1-rich' ? SCENE_LESSON_REGISTRY[`${u}-${l}`] : getWelcomeTownLesson(fmt, Number(u), Number(l))?.scenes;
      expect(scenes, `${q.lessonKey} has no registered scenes`).toBeTruthy();
      const id = identifyLesson(scenes);
      expect(id && `${id.contentFormat}-${id.unitNumber}-${id.lessonNumber}`, q.lessonKey).toBe(q.lessonKey);
    }
  });

  it('ad-hoc scene lists (trial, previews) are never recorded', () => {
    expect(identifyLesson([{ id: 'x', kind: 'finale' }])).toBeNull();
  });

  it('both lesson players record a live-class student finishing the lesson', () => {
    for (const f of ['src/pages/playground-scene/PlayUnitLesson.tsx', 'src/pages/playground-scene/PlayWelcomeTownLesson.tsx']) {
      expect(readFileSync(join(process.cwd(), f), 'utf8'), f).toContain('useRecordClassroomCompletion(');
    }
  });
});
