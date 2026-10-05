import { describe, expect, it } from 'vitest';
import { correctDecision, extractName, fillName, firstDifference, friendshipHearts, mismatchHint, namesMatch, starsFor, validateRounds } from '../gateGuard';

describe('gate guard rules', () => {
  it('finds the name in common self-introductions', () => {
    expect(extractName('Hi! I am Theo.')).toBe('Theo');
    expect(extractName("Hello, I'm Ava!")).toBe('Ava');
    expect(extractName('My name is Mia.')).toBe('Mia');
    expect(extractName("My name's Vee")).toBe('Vee');
    expect(extractName('Goodbye!')).toBeNull();
  });

  it('compares names ignoring case and punctuation', () => {
    expect(namesMatch('Theo', 'THEO')).toBe(true);
    expect(namesMatch('Ava', 'Eva')).toBe(false);
    expect(namesMatch('', '')).toBe(false);
  });

  it('points at the first different letter', () => {
    expect(firstDifference('Ava', 'Eva')).toBe(0);
    expect(firstDifference('Mia', 'Mina')).toBe(2);
    expect(firstDifference('Nova', 'nova')).toBe(-1);
  });

  it('derives the right decision from what is said and printed', () => {
    expect(correctDecision({ says: 'I am Theo.', tag: 'Theo' })).toBe('let_in');
    expect(correctDecision({ says: 'I am Theo.', tag: 'Thea' })).toBe('name_desk');
    expect(correctDecision({ says: 'Hello!', tag: 'Theo' })).toBe('name_desk');
  });

  it('flags authored rounds whose ok flag disagrees with the content', () => {
    expect(validateRounds([{ visitor: 'theo', says: 'I am Theo.', tag: 'Theo', ok: true }])).toEqual([]);
    expect(validateRounds([{ visitor: 'ava', says: 'I am Ava.', tag: 'Eva', ok: true }])).toHaveLength(1);
  });

  it('explains a mismatch kindly', () => {
    expect(mismatchHint({ says: 'I am Ava.', tag: 'Eva' })).toContain('letter 1');
  });

  it('gives gentle stars and friendship hearts', () => {
    expect(starsFor(0, 6)).toBe(1);
    expect(starsFor(4, 6)).toBe(2);
    expect(starsFor(6, 6)).toBe(3);
    expect(friendshipHearts(0, 4)).toBe(0);
    expect(friendshipHearts(4, 4)).toBe(3);
  });

  it('fills the student name into replies', () => {
    expect(fillName('Hello! I am …', 'Sam')).toBe('Hello! I am Sam');
    expect(fillName('My name is {name}.', 'Sam')).toBe('My name is Sam.');
    expect(fillName('Hello! I am …', null)).toBe('Hello! I am …');
  });
});
