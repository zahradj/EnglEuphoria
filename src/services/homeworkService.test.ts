import { describe, expect, it } from 'vitest';
import { isPlayableForStudent } from './homeworkService';

describe('isPlayableForStudent (retired old-format homework stays hidden)', () => {
  it('hides the old auto-generated 3-activity homework', () => {
    expect(isPlayableForStudent({ source: 'lep1-auto', content: { activity_1_recognition: {} } })).toBe(false);
  });
  it('shows Homework Quests', () => {
    expect(isPlayableForStudent({ source: 'lep1-auto', content: { type: 'quest', questId: 'x' } })).toBe(true);
  });
  it('shows homework a teacher sent on purpose', () => {
    expect(isPlayableForStudent({ source: 'ai-generated', content: { activity_1_recognition: {} } })).toBe(true);
    expect(isPlayableForStudent({ source: 'smart_homework', content: {} })).toBe(true);
  });
});
