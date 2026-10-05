import { beforeEach, describe, expect, it } from 'vitest';
import { fillModel, loadNameTag, NAME_TAG_STORAGE_KEY, sanitizeName, saveNameTag, spellingLine, spellLetters } from '../nameTag';

describe('sanitizeName', () => {
  it('keeps letters only, capitalises, caps at 14', () => {
    expect(sanitizeName('  ava 123!')).toBe('Ava');
    expect(sanitizeName('mARIA-José')).toBe('Mariajosé');
    expect(sanitizeName('abcdefghijklmnopqrstuvwxyz')).toHaveLength(14);
    expect(sanitizeName('1234 !!')).toBe('');
    expect(sanitizeName(undefined as unknown as string)).toBe('');
  });
});
describe('spelling', () => {
  it('spells letter by letter', () => {
    expect(spellLetters('ava')).toEqual(['A', 'V', 'A']);
    expect(spellingLine('Ava')).toBe('A – V – A');
    expect(spellingLine('')).toBe('');
  });
  it('fills the model sentence', () => {
    expect(fillModel('Hello! My name is {name}.', 'Ava')).toBe('Hello! My name is Ava.');
  });
});
describe('saved card', () => {
  beforeEach(() => { try { localStorage.removeItem(NAME_TAG_STORAGE_KEY); } catch { /* */ } });
  it('round-trips and rejects junk', () => {
    expect(loadNameTag()).toBeNull();
    expect(saveNameTag({ avatar: 'ava', color: 'sky', name: 'Ava' })).toBe(true);
    expect(loadNameTag()).toEqual({ avatar: 'ava', color: 'sky', name: 'Ava' });
    localStorage.setItem(NAME_TAG_STORAGE_KEY, '{"x":1}');
    expect(loadNameTag()).toBeNull();
  });
});
