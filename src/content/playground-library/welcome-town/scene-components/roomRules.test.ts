import { describe, expect, it } from 'vitest';
import { ownerSentence, placeSentence, roomSentences, whoseQuestion } from './roomRules';

describe('Design My Room / Lost Property sentences', () => {
  it('says where a thing is, with a / an', () => {
    expect(placeSentence('plant', 'between the windows')).toBe('There is a plant between the windows.');
    expect(placeSentence('armchair', 'in front of the fire')).toBe('There is an armchair in front of the fire.');
  });
  it('uses There are + a number word for more than one', () => {
    expect(roomSentences(['lamp', 'bed', 'lamp'])).toEqual(['There are two lamps.', 'There is a bed.']);
    expect(roomSentences(['box', 'box', 'box'])).toEqual(['There are three boxes.']);
  });
  it('asks whose and answers with the possessive s', () => {
    expect(whoseQuestion('crown')).toBe('Whose crown is it?');
    expect(ownerSentence('Wim', 'crown')).toBe('It’s Wim’s crown.');
    expect(ownerSentence('Cat-cat', 'ball')).toBe('It’s Cat-cat’s ball.');
  });
});
