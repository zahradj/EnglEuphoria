import { describe, expect, it } from 'vitest';
import { spokenText } from './spokenText';

describe('spokenText (2026-10-02 pronunciation audit)', () => {
  it('lower-cases ALL-CAPS words so they are not read as acronyms', () => {
    expect(spokenText('SAT')).toBe('Sat.');
    expect(spokenText('Read two real words — SAT and AT!')).toBe('Reed two real words — sat and at!');
    expect(spokenText('Now YOU!')).toBe('Now you!');
    expect(spokenText('I am OK')).toBe('I am OK');
  });
  it('drops emoji and "(-ed)" hints; blanks become a pause', () => {
    expect(spokenText('Sad 😢')).toBe('Sad.');
    expect(spokenText('🥳 Yaaay! Happy birthday to me!')).toBe('Yaaay! Happy birthday to me!');
    expect(spokenText('“Played” — is this REGULAR (-ed) or IRREGULAR?')).toBe('“Played” — is this regular or irregular?');
    expect(spokenText('I am ___ years old!')).toBe('I am … years old!');
  });
  it('re-takes single words whose recording was wrong', () => {
    expect(spokenText('car')).toBe('car.');
    expect(spokenText('Hello!')).toBe('Hello!');
  });
  it('keeps "read" present tense', () => {
    expect(spokenText('At night, I read my favorite book.')).toBe('At night, I reed my favorite book.');
    expect(spokenText('You said hello and read two real words — SAT and AT!')).toBe('You said hello and read two real words — sat and at!');
  });
});
