import { describe, expect, it } from 'vitest';
import { suggestMarks, acTag, type ActivityRow } from '../classroom/checklistLog';
import type { Slide } from '../types';

// A small fixture (the real lessons were removed for the player v2 rebuild): a title, a game that trains criterion 4, and two more games on it.
const mk = (id: string, kind: string, trains?: number[]) => ({ id, part: 0, kind, bg: 'x', trains }) as unknown as Slide;
const slides: Slide[] = [mk('title', 'title'), mk('boss', 'boss', [4]), mk('hot', 'hotseat', [4]), mk('forge', 'forge', [2, 4]), mk('wrap', 'wrap')];
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
