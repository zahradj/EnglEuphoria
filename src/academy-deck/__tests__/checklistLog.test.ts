import { describe, expect, it } from 'vitest';
import { suggestMarks, acTag, type ActivityRow } from '../classroom/checklistLog';
import { B1_S01_E1 } from '../lessons/b1s01e1';

const slides = B1_S01_E1.slides;
const game = slides.find((s) => s.id === 'boss')!; // trains criterion 4
const row = (slide_id: string, ok: boolean, w = 0): ActivityRow => ({ slide_id, is_correct: ok, selected_option_id: `w${w}`, skill_tag: 'acd:4' });

describe('Academy classroom checklist: marks suggested from what the student did', () => {
  it('nothing saved = no suggestion; a win first try = nailed; wrong tries = almost; tried and not won = not-yet', () => {
    expect(suggestMarks(slides, 5, [])[3]).toBeUndefined();
    const trainers = slides.filter((s) => s.trains?.includes(4) && !['title', 'brief', 'dial', 'wrap', 'story', 'model', 'teach', 'rule'].includes(s.kind));
    const allWon = trainers.map((s) => row(s.id, true));
    expect(suggestMarks(slides, 5, allWon)[3]).toBe('nailed');
    expect(suggestMarks(slides, 5, [row(game.id, true, 2), ...allWon.slice(1)])[3]).toBe('almost');
    expect(suggestMarks(slides, 5, [row(game.id, true)])[3]).toBe('almost'); // only some pages done
    expect(suggestMarks(slides, 5, [row(game.id, false, 3)])[3]).toBe('not-yet');
  });
  it('the saved tag lists the criteria the page trains', () => { expect(acTag(game)).toBe('acd:4'); });
});
