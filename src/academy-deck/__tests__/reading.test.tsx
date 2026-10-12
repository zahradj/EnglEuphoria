// Pre-A1 engine (owner 2026-10-12): run of show per ladder step, blending, hear-and-pick, reader page, decodability test.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { isBlendable, undecodable, decodabilityProblems } from '../decodable';
import { partsOf, PARTS, PRE_A1_PARTS, type DeckScript } from '../types';
import { PRE_A1_RUN_OF_SHOW, RUN_OF_SHOW, ladderSteps, getLadderStep } from '../../curriculum/academy';

afterEach(cleanup);

const letters = (text: string) => ({ type: 'letters' as const, text });
const FIXTURE: DeckScript = {
  lessonId: 'PA1-fixture', level: 'Pre-A1', shape: 'pre-a1', title: 'Fixture', objective: 'o', criteria: ['c'], cast: ['Vee'],
  taughtSounds: ['s', 'a', 't', 'p'], sightWords: ['I', 'am', 'is', 'the'],
  slides: [
    { id: 'title', kind: 'title', part: 0, bg: 'club-signup-desk', heading: 'Hello', sub: 's' },
    { id: 'hear', kind: 'hearpick', part: 1, bg: 'club-signup-desk', trains: [1], prompt: 'Which letter do you hear?', rounds: [{ say: 'A', options: ['A', 'E', 'I'], answer: 'A' }, { say: 'T', options: ['T', 'P', 'S'], answer: 'T' }] },
    { id: 'blend', kind: 'blend', part: 4, bg: 'club-signup-desk', trains: [3], prompt: 'Blend the sounds.', rounds: [{ letters: ['s', 'a', 't'], word: 'sat' }, { letters: ['t', 'a', 'p'], word: 'tap' }] },
    { id: 'read', kind: 'reader', part: 4, bg: 'club-signup-desk', trains: [4], prompt: 'Read and match.', lines: [{ text: 'Pat sat.', art: letters('SAT') }, { text: 'Tap, Pat, tap.', art: letters('TAP') }, { text: 'I am Pat.', art: letters('PAT') }] },
    { id: 'wrap', kind: 'wrap', part: 7, bg: 'club-signup-desk', heading: 'Done', ticks: ['x'], homework: 'h', clue: 'c' },
  ],
};
const at = (id: string) => FIXTURE.slides.findIndex((s) => s.id === id);
const open = (id: string) => render(<Deck script={FIXTURE} teacher slide={at(id)} />);

describe('Pre-A1 run of show', () => {
  it('is a property of the ladder step: Pre-A1 uses the slower run of show, every other step the standard one', () => {
    ladderSteps('full').forEach((s) => expect(s.runOfShow).toBe(s.stage === 'pre' ? 'pre-a1' : 'standard'));
    expect(getLadderStep('pre-a1')?.runOfShow).toBe('pre-a1');
    expect(getLadderStep('a1')?.runOfShow).toBe('standard');
  });

  it('the deck parts equal the blueprint run of show for each shape (names and minutes), 8 parts, 60 minutes', () => {
    expect(PRE_A1_PARTS.map((p) => [p.name, p.minutes])).toEqual(PRE_A1_RUN_OF_SHOW.map((p) => [p.name, p.minutes]));
    expect(PARTS.map((p) => [p.name, p.minutes])).toEqual(RUN_OF_SHOW.map((p) => [p.name, p.minutes]));
    expect(PRE_A1_PARTS).toHaveLength(8);
    expect(PRE_A1_PARTS.reduce((a, p) => a + p.minutes, 0)).toBe(60);
    expect(partsOf('pre-a1')).toBe(PRE_A1_PARTS);
    expect(partsOf()).toBe(PARTS);
    PRE_A1_RUN_OF_SHOW.forEach((p) => expect(p.mustHave.length).toBeGreaterThanOrEqual(2));
    expect(PRE_A1_RUN_OF_SHOW.find((p) => p.name === 'Read')!.mustHave.join(' ')).toMatch(/blending/);
  });

  it('a Pre-A1 deck shows its own part names (the Read part)', () => {
    render(<Deck script={FIXTURE} teacher slide={at('blend')} />);
    expect(screen.getByRole('dialog', { name: /Part 5: Read/ })).toBeTruthy();
  });
});

describe('decodability', () => {
  it('a word is blendable when every letter is a taught sound; sight words are allowed', () => {
    expect(isBlendable('sat', ['s', 'a', 't'])).toBe(true);
    expect(isBlendable('Pat', ['s', 'a', 't', 'p'])).toBe(true);
    expect(isBlendable('pin', ['s', 'a', 't', 'p'])).toBe(false);
    expect(undecodable('I am Pat. The cat sat.', ['s', 'a', 't', 'p'], ['I', 'am', 'the'])).toEqual(['cat']);
  });
  it('the fixture reading is decodable, and a bad page is reported with the slide id', () => {
    expect(decodabilityProblems(FIXTURE)).toEqual([]);
    const bad: DeckScript = { ...FIXTURE, slides: [{ id: 'r', kind: 'reader', part: 4, bg: 'x', prompt: 'p', lines: [{ text: 'Pip sits.', art: letters('X') }] }, { id: 'b', kind: 'blend', part: 4, bg: 'x', prompt: 'p', rounds: [{ letters: ['s', 'a'], word: 'sat' }] }] };
    const problems = decodabilityProblems(bad);
    expect(problems.join('|')).toMatch(/r: "Pip sits\." has words not yet decodable: pip, sits/);
    expect(problems.join('|')).toMatch(/b: letters sa do not spell sat/);
  });
});

describe('reading slides', () => {
  it('HEAR AND PICK: a wrong tile says Not yet, the right tile moves on, the last one unlocks Next', () => {
    open('hear');
    fireEvent.click(screen.getByRole('button', { name: 'E' }));
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'A' }));
    fireEvent.click(screen.getByRole('button', { name: 'T' }));
    expect(screen.getByText('All found!')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('BLEND: the slider pulls the letters together, the word appears, and every round must be blended', () => {
    open('blend');
    expect(screen.getByRole('button', { name: /Letter s/ })).toBeTruthy();
    const slider = screen.getByRole('slider', { name: /Blend the sounds/ });
    fireEvent.change(slider, { target: { value: '60' } });
    expect(document.querySelector('.ad-blend[data-joined="true"]')).toBeNull();
    fireEvent.change(slider, { target: { value: '100' } });
    expect(document.querySelector('.ad-blend[data-joined="true"]')).toBeTruthy();
    expect(screen.getByText('sat')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Next word/ }));
    fireEvent.click(screen.getByRole('button', { name: /Blend it/ }));
    expect(screen.getByText('tap')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Done/ }));
    expect(screen.getByText('You blended every word!')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });

  it('READER: every word can be tapped to hear it, and each line is matched to its picture', () => {
    open('read');
    expect(screen.getByRole('button', { name: 'Pat' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Hear the line/ })).toBeTruthy();
    const pics = () => screen.getAllByRole('button', { name: /^Picture \d$/ });
    expect(pics().length).toBe(3);
    fireEvent.click(screen.getByRole('button', { name: 'Picture 2' })); // wrong: line 1 is picture 1
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Picture 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Picture 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Picture 3' }));
    expect(screen.getByText('You read the whole page!')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Next/ })).toBeEnabled();
  });
});
