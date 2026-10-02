import { beforeEach, describe, expect, it } from 'vitest';
import { clearResume, extractImageUrls, loadResume, saveResume, slideLabel } from '../playerSafety';

describe('extractImageUrls', () => {
  it('finds image URLs at any depth and ignores everything else', () => {
    const slide = {
      type: 'vocab_deck',
      bg_image_url: 'https://x.test/a.png',
      cards: [{ word: 'rope', image_url: 'https://x.test/b.JPG?v=2' }, { word: 'no image', definition: 'https://x.test/page.html' }],
      room: { doors: [{ image_url: 'https://x.test/c.webp' }, { image_url: null }] },
    };
    expect(extractImageUrls(slide).sort()).toEqual(['https://x.test/a.png', 'https://x.test/b.JPG?v=2', 'https://x.test/c.webp']);
  });
  it('de-duplicates, caps the count and survives null/odd input', () => {
    expect(extractImageUrls(null)).toEqual([]);
    expect(extractImageUrls({ a: 'https://x.test/a.png', b: ['https://x.test/a.png'] })).toEqual(['https://x.test/a.png']);
    const many = { l: Array.from({ length: 50 }, (_, i) => `https://x.test/${i}.png`) };
    expect(extractImageUrls(many, 10)).toHaveLength(10);
  });
  it('does not blow the stack on a deeply nested slide', () => {
    let deep: any = { u: 'https://x.test/deep.png' };
    for (let i = 0; i < 200; i++) deep = { n: deep };
    expect(() => extractImageUrls(deep)).not.toThrow();
  });
});

describe('slideLabel', () => {
  it('uses a friendly type name plus the slide text, truncated', () => {
    expect(slideLabel({ type: 'vocab_deck', title: 'Jungle Gear' })).toBe('New words · Jungle Gear');
    expect(slideLabel({ type: 'question', prompt: 'x'.repeat(80) }).length).toBeLessThanOrEqual(70);
    expect(slideLabel({ type: 'something_new' })).toBe('something_new');
    expect(slideLabel(undefined)).toBe('Slide');
  });
});

describe('resume storage', () => {
  beforeEach(() => localStorage.clear());
  it('round-trips a valid position', () => {
    saveResume('L1', { i: 7, xp: 120, max: 9 });
    expect(loadResume('L1', 35)).toMatchObject({ i: 7, xp: 120, max: 9 });
  });
  it('ignores positions that no longer fit the lesson (it was edited and got shorter)', () => {
    saveResume('L1', { i: 30, xp: 5, max: 30 });
    expect(loadResume('L1', 10)).toBeNull();
  });
  it('ignores corrupt data instead of throwing', () => {
    localStorage.setItem('academy-resume:L1', '{not json');
    expect(loadResume('L1', 35)).toBeNull();
    localStorage.setItem('academy-resume:L1', JSON.stringify({ i: 'x' }));
    expect(loadResume('L1', 35)).toBeNull();
  });
  it('clamps xp/max and can be cleared', () => {
    localStorage.setItem('academy-resume:L1', JSON.stringify({ i: 3, xp: -50, max: 999 }));
    expect(loadResume('L1', 35)).toMatchObject({ i: 3, xp: 0, max: 34 });
    clearResume('L1');
    expect(loadResume('L1', 35)).toBeNull();
  });
});
