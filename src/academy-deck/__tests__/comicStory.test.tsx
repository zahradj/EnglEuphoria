// Comic (manga-style) story layer: narration box + speech bubbles over a still plate; listenFirst hides them; a shout shows speed lines.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { B1_S01_E3 } from '../lessons/b1s01e3';

afterEach(cleanup);
const idx = B1_S01_E3.slides.findIndex((s) => s.id === 'story-case');

describe('Comic story look', () => {
  it('L3 story is comic, with a caption per beat and a bubble side for each speaker', () => {
    const s = B1_S01_E3.slides[idx];
    expect(s.kind === 'story' && s.look === 'comic').toBe(true);
    if (s.kind !== 'story') return;
    for (const b of s.beats) { expect(b.caption).toBeTruthy(); expect(b.side).toBeTruthy(); }
  });

  it('hides the text until "Show the text" (listen first), then shows caption, bubble and speed lines for the shout', () => {
    const { container } = render(<Deck script={B1_S01_E3} teacher slide={idx} />);
    expect(container.querySelector('.ad-comic-cap')).toBeNull();
    expect(container.querySelector('.ad-comic-bubble')).toBeNull();
    const btn = screen.getAllByRole('button').find((b) => /show the text/i.test(b.textContent || ''));
    expect(btn).toBeTruthy();
    fireEvent.click(btn!);
    expect(container.querySelector('.ad-comic-cap')?.textContent).toMatch(/postcard is missing/i);
    expect(container.querySelector('.ad-comic-bubble[data-shout]')).not.toBeNull();
    expect(container.querySelector('.ad-comic-speed')).not.toBeNull();
    expect(container.querySelector('.ad-comic-sfx')?.textContent).toBe('GONE!');
  });
});
