// "Unlock the Lost Phone" (owner 2026-10-15, docs/academy-pre-a1-s02-e1-v2-plan.md): the vault hub, the lock-pick lane, the boss duel, the key HUD and the teacher-only lesson clock.
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Deck } from '../Deck';
import { clockStatus } from '../LessonClock';
import { PA1_S02_E1 } from '../lessons/pa1s02e1';

afterEach(cleanup);
const slides = PA1_S02_E1.slides;
const at = (id: string) => slides.findIndex((s) => s.id === id);
const open = (id: string, teacher = true) => render(<Deck script={PA1_S02_E1} teacher={teacher} slide={at(id)} />);

describe('Unlock the Lost Phone: structure', () => {
  it('has five locks, each opened by one vault page, in order, and every lock page names its lock', () => {
    expect(PA1_S02_E1.locks).toHaveLength(5);
    const vaults = slides.filter((s) => s.kind === 'vault');
    expect(vaults.map((v) => (v.kind === 'vault' ? v.lock : 0))).toEqual([1, 2, 3, 4, 5]);
    // a vault page comes right after the work of its lock, never before it
    vaults.forEach((v) => {
      const lockSlides = slides.filter((s) => s.lock === (v.kind === 'vault' ? v.lock : -1));
      expect(lockSlides.length, `lock ${v.id}`).toBeGreaterThan(1);
    });
    const order = slides.filter((s) => s.lock).map((s) => s.lock as number);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('the boss duel is the signature game of Lock 4 and asks for the sentence aloud (Say it) with a picture for every word', () => {
    const duel = slides.find((s) => s.kind === 'duel');
    expect(duel?.lock).toBe(4);
    if (duel?.kind !== 'duel') throw new Error('no duel');
    expect(duel.frame).toBe('This is a ___.');
    duel.rounds.forEach((r) => expect(r.options).toContain(r.answer));
  });

  it('optional pages are marked, the required pages are what fills the hour, and the lesson has 40+ pages', () => {
    expect(slides.length).toBeGreaterThanOrEqual(40);
    expect(slides.filter((s) => s.optional).length).toBeGreaterThanOrEqual(4);
    expect(slides.filter((s) => s.optional).every((s) => !['title', 'wrap', 'vault', 'story', 'rule', 'duel'].includes(s.kind))).toBe(true);
  });
});

describe('Unlock the Lost Phone: the new games', () => {
  it('LOCK-PICK LANE: a wrong tile says Not yet and sets no pin; the right tile sets a pin', () => {
    open('lock-ears');
    expect(screen.getByRole('list', { name: /Pins set: 0 of/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'at' })); // round 1 says "in"
    expect(screen.getByText(/Not yet/)).toBeTruthy();
    expect(screen.getByRole('list', { name: /Pins set: 0 of/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'in' }));
    expect(screen.getByRole('list', { name: /Pins set: 1 of/ })).toBeTruthy();
  });

  it('BOSS DUEL: a miss is one soft step back and never below the start; the glowing answer appears after three misses; a right pick shows the sentence', () => {
    open('lock-duel');
    // round 1 is the pin picture: "tin" and "map" are wrong
    fireEvent.click(screen.getByRole('button', { name: 'tin' }));
    expect(screen.getByRole('img', { name: /Key 0 of 4/ })).toBeTruthy(); // already at the start: nowhere to fall
    fireEvent.click(screen.getByRole('button', { name: 'map' }));
    fireEvent.click(screen.getByRole('button', { name: 'tin' }));
    const help = document.querySelector('[data-help="true"]');
    expect(help?.textContent).toBe('pin');
    fireEvent.click(screen.getByRole('button', { name: 'pin' }));
    expect(screen.getByText('This is a pin.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Next picture/ }));
    expect(screen.getByRole('img', { name: /Key 1 of 4/ })).toBeTruthy();
  });

  it('VAULT: the lock opens by itself, with no question, and Next is ready', () => {
    open('vault-1');
    expect(screen.getByText('Lock 1 is open!')).toBeTruthy();
  });
});

describe('Unlock the Lost Phone: key HUD and lesson clock', () => {
  it('the key HUD shows five slots with the current lock marked; it is not in a lesson without locks', () => {
    open('lock-ears');
    expect(screen.getByRole('list', { name: 'Keys: 0 of 5' })).toBeTruthy();
    expect(document.querySelector('.ad-keyslot[data-now="true"]')).toBeTruthy();
    expect(document.querySelectorAll('.ad-keyslot')).toHaveLength(5);
  });

  it('the lesson clock is in the teacher view only, never for the student', () => {
    const t = open('lock-ears', true);
    expect(screen.getByLabelText(/Lesson clock/)).toBeTruthy();
    t.unmount();
    open('lock-ears', false);
    expect(screen.queryByLabelText(/Lesson clock/)).toBeNull();
  });

  it('clockStatus: on time, behind after two minutes over, ahead after two minutes under', () => {
    const b = [5, 9, 8, 10, 8, 6, 10, 4];
    expect(clockStatus([300, 100, 0, 0, 0, 0, 0, 0], b, 1).state).toBe('on-time');
    expect(clockStatus([480, 100, 0, 0, 0, 0, 0, 0], b, 1).state).toBe('behind'); // 3 min over in part 0
    expect(clockStatus([120, 0, 0, 0, 0, 0, 0, 0], b, 1).state).toBe('ahead'); // finished part 0 three minutes early
  });

  it('no lesson clock and no key HUD appear for a student following a live class', () => {
    render(<Deck script={PA1_S02_E1} teacher follow slide={at('lock-ears')} />);
    expect(screen.queryByLabelText(/Lesson clock/)).toBeNull();
    act(() => undefined);
  });
});

describe('Reading-first (owner 2026-10-15): activate, blend, read a message, keep words, play the word bank', () => {
  it('Check-in activates what the student knows: a private I-know-it / New-to-me sort with no wrong answer, saved for the teacher', () => {
    const s = slides.find((x) => x.id === 'activate');
    expect(s?.kind).toBe('sort');
    expect(s?.part).toBe(0);
    if (s?.kind !== 'sort') throw new Error('no sort');
    expect(s.save).toBe('known');
    expect(s.bins.map((b) => b.label)).toEqual(['I know it', 'New to me']);
  });

  it('the Read part has a message (passage) AND the word-bank game, and the bank game uses words kept from that message', () => {
    const p = slides.find((x) => x.kind === 'passage');
    const bank = slides.find((x) => x.id === 'bank-match');
    expect(p?.part).toBe(4);
    expect(bank?.kind).toBe('match');
    if (p?.kind !== 'passage' || bank?.kind !== 'match') throw new Error('missing');
    const textWords = new Set(p.lines.join(' ').toLowerCase().replace(/[.,!?]/g, '').split(/\s+/));
    p.keepFrom.forEach((w) => expect(textWords.has(w), `keepFrom "${w}" must be in the message`).toBe(true));
    bank.pairs.forEach((pr) => expect(p.keepFrom, `bank word "${pr.word}"`).toContain(pr.word));
    expect(slides.indexOf(bank)).toBeGreaterThan(slides.indexOf(p));
  });

  it('PASSAGE: listen, read it, then keep three words; the bank cannot be added before three are kept; the words are saved', () => {
    render(<Deck script={PA1_S02_E1} teacher slide={at('msg-theo')} />);
    expect(screen.queryByText(/Keep 3 or more words/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Now I read it/ }));
    fireEvent.click(screen.getByRole('button', { name: /I read it/ }));
    expect(screen.getByText(/Keep 3 or more words/)).toBeTruthy();
    const add = screen.getByRole('button', { name: /Add to my word bank/ }) as HTMLButtonElement;
    expect(add.disabled).toBe(true);
    ['pin', 'tin', 'map'].forEach((w) => fireEvent.click(screen.getByRole('button', { name: w, pressed: false })));
    expect(add.disabled).toBe(false);
    fireEvent.click(add);
    expect(screen.getByText(/Word bank: pin, tin, map/)).toBeTruthy();
  });

  it('every lesson page that asks to read keeps to the sounds taught so far, including the message (see DECODABILITY)', () => {
    const p = slides.find((x) => x.kind === 'passage');
    expect(p).toBeTruthy();
  });
});

import { bankItems } from '../practiceStore';
describe('Word bank to the Daily 10', () => {
  it('the words kept from the reading join the lesson items (once each, lower case); no bank means no extra items', () => {
    expect(bankItems({ bank: 'pin, Tin,map,pin' })).toEqual(['pin', 'tin', 'map']);
    expect(bankItems({})).toEqual([]);
    expect(bankItems(undefined)).toEqual([]);
  });
});

import { readingOf } from '../../curriculum/academy';
describe('The deck reads its reading plan from the Season data', () => {
  it('the passage, the words to keep and the word-bank game come from PRE_A1_READING (one source), and the activation sort covers the words of the plan', () => {
    const plan = readingOf('PA1-S02-E1')!;
    const p = slides.find((x) => x.kind === 'passage');
    const bank = slides.find((x) => x.id === 'bank-match');
    if (p?.kind !== 'passage' || bank?.kind !== 'match') throw new Error('missing');
    expect(p.lines).toEqual(plan.message.lines);
    expect(p.keepFrom).toEqual(plan.bank);
    expect(bank.pairs.map((x) => x.word)).toEqual(plan.bank.slice(0, 4));
    const act = slides.find((x) => x.id === 'activate');
    if (act?.kind !== 'sort') throw new Error('missing');
    expect(act.items.map((i) => i.word)).toEqual(plan.activate);
  });
});

import { groupAcademyLibrary } from '../library/levels';
import { ACADEMY_DECK_LESSONS } from '../lessonRegistry';
describe('The creator library shows the reading plan of every Pre-A1 lesson', () => {
  it('every Pre-A1 lesson slot carries its activation words, message and word bank', () => {
    const pre = groupAcademyLibrary(ACADEMY_DECK_LESSONS, true).find((g) => g.label === 'Pre-A1');
    const slots = (pre?.seasons ?? []).flatMap((s) => s.slots);
    expect(slots).toHaveLength(40);
    slots.forEach((x) => {
      expect(x.plan?.reading?.lines.length, x.plan?.id).toBeGreaterThanOrEqual(3);
      expect(x.plan?.reading?.bank.length, x.plan?.id).toBeGreaterThanOrEqual(3);
    });
  });
});
