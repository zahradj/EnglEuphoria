import { describe, it, expect } from 'vitest';
import { normalizePoll } from '../normalizePoll';
import { normalizeImagePrompt, normalizeImagePromptsDeep } from '../normalizeImagePrompt';
import { normalizeVocabCards } from '../normalizeVocab';

describe('normalizePoll', () => {
  it('renames pct → label_distribution when not real_data', () => {
    const out: any = normalizePoll({ options: [{ label: 'A', pct: 70 }] });
    expect(out.options[0].pct).toBeUndefined();
    expect(out.options[0].label_distribution).toBe(70);
    expect(out.distribution_source).toBe('illustrative');
  });
  it('keeps pct when distribution_source is real_data', () => {
    const out: any = normalizePoll({ distribution_source: 'real_data', options: [{ label: 'A', pct: 70 }] });
    expect(out.options[0].pct).toBe(70);
  });
});

describe('normalizeImagePrompt', () => {
  it('strips camera jargon and caps style tokens', () => {
    const out = normalizeImagePrompt('a fox running, slice-of-life, webcomic, realistic, anime, cel shading, white background, 35mm bokeh');
    expect(out).not.toMatch(/35mm|bokeh/);
    // Drops style phrases past the 2-style cap.
    expect(out).toMatch(/fox running/);
  });
  it('deep-normalizes nested image_prompt fields', () => {
    const out: any = normalizeImagePromptsDeep({ cards: [{ image_prompt: 'cat, realistic, anime, cel shading, 35mm' }] });
    expect(out.cards[0].image_prompt).not.toMatch(/35mm/);
  });
});

describe('normalizeVocabCards', () => {
  it('collapses case-insensitive duplicates, keeping richest entry', () => {
    const out = normalizeVocabCards([
      { word: 'Witness', definition: '', example: '' },
      { word: 'witness', definition: 'a person who saw something', example: 'The witness spoke.' },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].word).toBe('witness');
    expect(out[0].definition).toMatch(/person/);
  });
});
