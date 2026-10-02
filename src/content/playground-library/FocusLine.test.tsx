import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { splitFocus, FocusLine } from './FocusLine';

const hits = (text: string, focus: string[]) => splitFocus(text, focus).filter((p) => p.focus).map((p) => p.text);

describe('picking the vocabulary out of a line', () => {
  it('finds a word, keeping the line’s own capitalisation', () => {
    expect(hits('Hello! I am Leo. I am a lion!', ['lion'])).toEqual(['lion']);
    expect(hits('Look! The book is IN the bag.', ['in'])).toEqual(['IN']);
  });

  it('keeps every piece of the line, in order', () => {
    const parts = splitFocus('Hello! I am Leo. I am a lion!', ['lion']);
    expect(parts.map((p) => p.text).join('')).toBe('Hello! I am Leo. I am a lion!');
  });

  it('finds whole words only — never a piece of another word', () => {
    expect(hits('Look! The apple is ON the desk.', ['on'])).toEqual(['ON']);
    expect(hits('Today is a category day', ['cat'])).toEqual([]);
  });

  it('does not light up a word inside a hyphenated name (Cat-cat), only the real one', () => {
    expect(hits('Meow! I am Cat-cat. I am a cat!', ['cat'])).toEqual(['cat']);
  });

  it('handles phrases, several words, and apostrophes', () => {
    expect(hits('Look! The chair is NEXT TO the desk.', ['next to'])).toEqual(['NEXT TO']);
    expect(hits('Bella is my friend! They are Pip’s new friends!', ['friend', 'friends'])).toEqual(['friend', 'friends']);
    expect(hits('Hi! My name’s Pip. What’s your name?', ['name'])).toEqual(['name', 'name']);
  });

  it('prefers the longer phrase and survives regex characters', () => {
    expect(hits('I walk to school.', ['walk', 'walk to school'])).toEqual(['walk to school']);
    expect(hits('Cost is (5) dollars.', ['(5)'])).toEqual(['(5)']);
  });

  it('with nothing to focus on, the line is untouched', () => {
    expect(splitFocus('Hello there', undefined)).toEqual([{ text: 'Hello there', focus: false }]);
    expect(splitFocus('Hello there', [])).toEqual([{ text: 'Hello there', focus: false }]);
    expect(hits('Hello there', ['zebra'])).toEqual([]);
  });
});

describe('FocusLine', () => {
  it('only restyles the vocabulary after the reading is done', () => {
    const { container, rerender } = render(<FocusLine text="I am a lion!" focus={['lion']} reveal={false} color="#c60" />);
    const before = container.querySelector('mark')!;
    expect(before.textContent).toBe('lion');
    expect(before.style.transform).not.toContain('scale');
    rerender(<FocusLine text="I am a lion!" focus={['lion']} reveal color="#c60" />);
    const after = container.querySelector('mark')!;
    expect(after.style.transform).toContain('scale(');
    expect(container.textContent).toBe('I am a lion!'); // the words themselves never change
  });
});
