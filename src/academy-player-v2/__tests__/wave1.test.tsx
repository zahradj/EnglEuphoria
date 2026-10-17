// @vitest-environment jsdom
// Wave 1 games (inspect, interview, objection, cipher): logic, validators, full play-throughs with right and wrong answers, spoken lines, and the lessons that use them.
import '@/lib/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { inspectScene, type InspectScene } from '../scenes/inspect/Inspect';
import { faultTokens, judge, returnedBatch, tokenize, type InspectItem } from '../scenes/inspect/inspectLogic';
import { interviewScene, type InterviewScene } from '../scenes/interview/Interview';
import { factsOf, identifies, questionOf, remaining, replyOf, winnerOf } from '../scenes/interview/interviewLogic';
import { objectionScene, type ObjectionScene } from '../scenes/objection/Objection';
import { cipherScene, type CipherScene } from '../scenes/cipher/Cipher';
import { classify, keyStates, marksOf } from '../scenes/cipher/cipherLogic';
import { spokenLines } from '../engine/spokenLines';
import { responsesOf } from '../engine/responses';
import { validateScript } from '../engine/validateScript';
import { Stinger } from '../quest/Cinematics';
import { advanceFlow, initialFlow } from '../quest/flow';
import { SCORED_KINDS, ENCOUNTER_KINDS, potentialLoot } from '../engine/quest';
import { B1_S01_E1 } from '../lessons/b1s01e1';
import { BORDER_DESK } from './fixtures/borderDesk';
import { B1_S01_E2 } from '../lessons/b1s01e2';
import { B1_S01_E3 } from '../lessons/b1s01e3';

vi.mock('../services/voice', () => ({ sayLine: vi.fn(async () => false), stopVoice: vi.fn() }));
afterEach(cleanup);
const base = { script: { criteria: ['I can'] } as never, artBase: '/a', calm: true, seed: 3, summary: { xp: 0, gems: 0, mistakes: [] as string[] } };
const tok = (w: string) => new RegExp(`^${w}[.,!?]?$`);
const find = <T extends { id: string }>(l: { scenes: unknown[] }, id: string) => l.scenes.find((s) => (s as T).id === id) as unknown as T;

// ---------- inspect ----------
describe('inspect logic', () => {
  const item: InspectItem = { id: 'a', doc: ['Last summer I have visited Rome.', 'It was great.'], fault: { word: 'have visited', fixes: ['visited', 'have visit'], correct: 'visited', ruleId: 'r1', why: 'finished time' } };
  it('finds a faulty phrase across tokens and occurrences', () => {
    expect(faultTokens(item).map((t) => t.word)).toEqual(['have', 'visited']);
    const twice: InspectItem = { id: 'b', doc: ['I felt relaxed because the beach was relaxed.'], fault: { word: 'relaxed', occurrence: 1, fixes: ['relaxing', 'relax'], correct: 'relaxing', ruleId: 'r', why: 'w' } };
    expect(faultTokens(twice)).toHaveLength(1);
    expect(faultTokens(twice)[0].idx).toBe(7);
    expect(tokenize(['a b'])[0].map((t) => t.text)).toEqual(['a', 'b']);
  });
  it('judges approve, fix, wrong word, wrong repair, false alarm', () => {
    expect(judge(item, { approve: true }).verdict).toBe('missed');
    expect(judge(item, { approve: false, tapped: { line: 0, idx: 3 }, fix: 'visited' })).toEqual({ correct: true, verdict: 'ok' });
    expect(judge(item, { approve: false, tapped: { line: 0, idx: 4 }, fix: 'visited' }).correct).toBe(true); // either word of the phrase
    expect(judge(item, { approve: false, tapped: { line: 1, idx: 0 }, fix: 'visited' }).verdict).toBe('wrong-word');
    expect(judge(item, { approve: false, tapped: { line: 0, idx: 3 }, fix: 'have visit' }).verdict).toBe('wrong-fix');
    const fine: InspectItem = { id: 'c', doc: ['I have never tried surfing.'], okWhy: 'ok', okFixes: ['try', 'tryed'] };
    expect(judge(fine, { approve: true }).correct).toBe(true);
    expect(judge(fine, { approve: false, fix: 'try' }).verdict).toBe('false-alarm');
    const passport: InspectItem = { id: 'p', doc: ['Tom has been to Rome.'], fault: { fixes: ['still there: gone', 'came back: been'], correct: 'still there: gone', ruleId: 'r', why: 'w' } };
    expect(judge(passport, { approve: false, fix: 'still there: gone' }).correct).toBe(true); // passport look: no word to tap
  });
  it('the returned batch holds the wrong items once, reworded when a retry exists', () => {
    const withRetry: InspectItem = { ...item, retry: { id: 'r', doc: ['In 2022 I have broken my arm.'], fault: { word: 'have broken', fixes: ['broke', 'have break'], correct: 'broke', ruleId: 'r1', why: 'w' } } };
    const back = returnedBatch([{ items: [withRetry, { ...item, id: 'z' }] }], ['a', 'z']);
    expect(back.map((i) => i.id)).toEqual(['a~r', 'z~r']);
    expect(back[0].doc[0]).toMatch(/broken/);
    expect(returnedBatch([{ items: [item] }], [])).toEqual([]);
  });
});

describe('inspect scene data', () => {
  const lessons = [['E2', B1_S01_E2, 'postcard-desk'], ['E3', B1_S01_E3, 'passport-desk']] as const;
  it('the v3 Border Desk fixture validates', () => { expect(inspectScene.validate(BORDER_DESK)).toEqual([]); });
  for (const [name, l, id] of lessons) {
    it(`${name} ${id} validates`, () => { expect(inspectScene.validate(find<InspectScene>(l, id))).toEqual([]); });
  }
  it('catches a missing rule, a batch that is not three, a repair that is not offered and an item that is always fine', () => {
    const s = BORDER_DESK;
    const broken = JSON.parse(JSON.stringify(s)) as InspectScene;
    broken.batches[0].items[0].fault!.ruleId = 'nope';
    broken.batches[0].items[0].fault!.correct = 'zzz';
    broken.batches[1].items.pop();
    const text = inspectScene.validate(broken).join('\n');
    expect(text).toMatch(/not in the rulebook/);
    expect(text).toMatch(/right repair is not among/);
    expect(text).toMatch(/exactly 3 documents/);
    const allFine = JSON.parse(JSON.stringify(s)) as InspectScene;
    allFine.batches.forEach((b) => b.items.forEach((i) => { delete i.fault; i.okWhy = 'x'; i.okFixes = ['a', 'b']; delete i.retry; }));
    expect(inspectScene.validate(allFine).join()).toMatch(/no document has a fault/);
  });
  it('says the briefing and each rule aloud', () => {
    const s = BORDER_DESK;
    const lines = inspectScene.spoken(s);
    expect(lines[0]).toEqual({ who: 'Vee', text: s.intro });
    expect(lines).toHaveLength(1 + s.rules.length);
  });
});

/** play the desk from the data: right answers, or one wrong approve at (batch, item) */
function playDesk(scene: InspectScene, wrongAt?: [number, number], extraBatches = 0) {
  const batches = scene.batches.length + extraBatches;
  for (let b = 0; b < batches; b++) {
    const items = b < scene.batches.length ? scene.batches[b].items : null;
    for (let k = 0; k < 3; k++) {
      const doc = document.querySelector('.av-in-work .av-doc');
      if (!doc) break;
      const text = doc.textContent ?? '';
      const item = items ? items[k] : [...scene.batches.flatMap((x) => x.items)].map((i) => i.retry ?? i).find((i) => i.doc.every((d) => text.includes(d.slice(0, 12))));
      const wrong = !!wrongAt && wrongAt[0] === b && wrongAt[1] === k;
      const fault = item?.fault;
      const passport = scene.look === 'passport';
      if (!fault || wrong) fireEvent.click(screen.getByRole('button', { name: passport ? /Clear/ : /Approve/ }));
      else {
        fireEvent.click(screen.getByRole('button', { name: passport ? /Send back/ : /Fix it/ }));
        if (!passport) fireEvent.click(screen.getAllByRole('button', { name: tok(fault.word!.split(' ')[0]) })[0]);
        fireEvent.click(screen.getByRole('button', { name: fault.correct }));
      }
    }
    fireEvent.click(screen.getByRole('button', { name: /File the batch/ }));
    const next = document.querySelector('.av-in-case .av-btn') as HTMLElement;
    fireEvent.click(next);
  }
}

describe('inspect play-through', () => {
  it('post look: all right is a clean first-try win with a gem-worthy result', () => {
    const scene = BORDER_DESK;
    const onDone = vi.fn();
    render(<inspectScene.view {...base} scene={scene} onDone={onDone} />);
    expect(screen.getByTestId('av-inspect').getAttribute('data-look')).toBe('post');
    // the rulebook starts with two rules; the third opens in batch 2
    expect(document.querySelectorAll('.av-rulebook li')).toHaveLength(2);
    playDesk(scene);
    expect(onDone).toHaveBeenCalledTimes(1);
    const r = onDone.mock.calls[0][0];
    expect(r.won).toBe(true);
    expect(r.mistakes).toEqual([]);
    expect(r.score).toBe(90);
    expect(screen.getByTestId('av-reward')).toBeTruthy();
    expect(document.querySelectorAll('.av-rulebook li')).toHaveLength(3);
  });
  it('a wrong approve is explained, comes back once reworded, and is a mistake for the Mistake Bank', () => {
    const scene = BORDER_DESK;
    const onDone = vi.fn();
    render(<inspectScene.view {...base} scene={scene} onDone={onDone} />);
    const wrongItem = scene.batches[0].items[0]; // a faulty post
    playDeskUntilFirstReveal(scene, [0, 0]);
    // the reveal explains why, in the chief's calm words, and the item is marked "look again"
    expect(within(screen.getByTestId('av-in-case')).getByText(/There was a problem here/)).toBeTruthy();
    expect(screen.getByText(wrongItem.fault!.why)).toBeTruthy();
    expect(document.querySelectorAll('.av-in-case li[data-ok]')).toHaveLength(2);
    // finish the other batches, then the returned batch shows the reworded post
    fireEvent.click(document.querySelector('.av-in-case .av-btn') as HTMLElement);
    for (let b = 1; b < scene.batches.length; b++) {
      for (let k = 0; k < 3; k++) {
        const it = scene.batches[b].items[k];
        if (!it.fault) fireEvent.click(screen.getByRole('button', { name: /Approve/ }));
        else { fireEvent.click(screen.getByRole('button', { name: /Fix it/ })); fireEvent.click(screen.getAllByRole('button', { name: tok(it.fault.word!.split(' ')[0]) })[0]); fireEvent.click(screen.getByRole('button', { name: it.fault.correct })); }
      }
      fireEvent.click(screen.getByRole('button', { name: /File the batch/ }));
      fireEvent.click(document.querySelector('.av-in-case .av-btn') as HTMLElement);
    }
    expect(screen.getByText(/Returned to your desk/, { selector: '.av-pill' })).toBeTruthy();
    expect(document.querySelector('.av-in-work .av-doc')?.textContent).toMatch(/broken my arm/); // the reworded retry of the first post
    fireEvent.click(screen.getByRole('button', { name: /Fix it/ }));
    fireEvent.click(screen.getAllByRole('button', { name: tok('have') })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'broke' }));
    fireEvent.click(screen.getByRole('button', { name: /File the batch/ }));
    fireEvent.click(document.querySelector('.av-in-case .av-btn') as HTMLElement);
    expect(onDone).toHaveBeenCalledTimes(1);
    const r = onDone.mock.calls[0][0];
    expect(r.won).toBe(true);
    expect(r.mistakes).toHaveLength(1);
    expect(r.mistakes[0]).toMatch(/Last summer I have visited/);
    expect(r.score).toBe(80); // eight first-try answers
  });
  it('a false alarm (FIX on a fine post) and a wrong word are both explained and cost nothing but the gem', () => {
    const scene = find<InspectScene>(B1_S01_E2, 'postcard-desk');
    render(<inspectScene.view {...base} scene={scene} onDone={vi.fn()} />);
    // card 1 is faulty: tap the wrong word on purpose
    fireEvent.click(screen.getByRole('button', { name: /Fix it/ }));
    fireEvent.click(screen.getAllByRole('button', { name: tok('held') })[0]);
    fireEvent.click(screen.getByRole('button', { name: scene.batches[0].items[0].fault!.correct }));
    // card 2 is fine: press FIX anyway
    fireEvent.click(screen.getByRole('button', { name: /Fix it/ }));
    fireEvent.click(screen.getAllByRole('button', { name: tok('quiet') })[0]);
    fireEvent.click(screen.getByRole('button', { name: scene.batches[0].items[1].okFixes![0] }));
    fireEvent.click(screen.getByRole('button', { name: /Approve/ })); // card 3 is faulty: approved
    fireEvent.click(screen.getByRole('button', { name: /File the batch/ }));
    const rows = document.querySelectorAll('.av-in-case li');
    expect(rows).toHaveLength(3);
    expect(document.querySelectorAll('.av-in-case li[data-ok]')).toHaveLength(0);
    const text = screen.getByTestId('av-in-case').textContent ?? '';
    expect(text).toMatch(/The problem is somewhere else/);
    expect(text).toMatch(/Nothing was wrong here/);
    expect(text).toMatch(/There was a problem here/);
  });
  it('the postcard look ends with a typed line that needs a feeling word and because', () => {
    const scene = find<InspectScene>(B1_S01_E2, 'postcard-desk');
    const onDone = vi.fn();
    render(<inspectScene.view {...base} scene={scene} onDone={onDone} />);
    playDesk(scene);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'I felt tired' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(onDone).not.toHaveBeenCalled();
    expect(screen.getByText(/because \+ a reason/)).toBeTruthy();
    fireEvent.change(input, { target: { value: 'I felt proud because I finished the hike.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone.mock.calls[0][0].score).toBe(100);
    expect(onDone.mock.calls[0][0].mistakes).toEqual(['I felt … because …']);
  });
  it('passport look: the reason is picked from a menu and the stamps are on the desk', () => {
    const scene = find<InspectScene>(B1_S01_E3, 'passport-desk');
    const onDone = vi.fn();
    render(<inspectScene.view {...base} scene={scene} onDone={onDone} />);
    expect(document.querySelector('.av-passport')).toBeTruthy();
    expect(screen.getByText('BACK HOME')).toBeTruthy();
    playDesk(scene);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone.mock.calls[0][0].mistakes).toEqual([]);
    expect(onDone.mock.calls[0][0].score).toBe(90);
  });
});

function playDeskUntilFirstReveal(scene: InspectScene, wrongAt: [number, number]) {
  const items = scene.batches[0].items;
  items.forEach((it, k) => {
    const wrong = wrongAt[1] === k;
    if (!it.fault || wrong) fireEvent.click(screen.getByRole('button', { name: /Approve/ }));
    else { fireEvent.click(screen.getByRole('button', { name: /Fix it/ })); fireEvent.click(screen.getAllByRole('button', { name: tok(it.fault.word!.split(' ')[0]) })[0]); fireEvent.click(screen.getByRole('button', { name: it.fault.correct })); }
  });
  fireEvent.click(screen.getByRole('button', { name: /File the batch/ }));
}

// ---------- interview ----------
describe('interview logic and data', () => {
  const friends = find<InterviewScene>(B1_S01_E1, 'who-most');
  const lineup = find<InterviewScene>(B1_S01_E3, 'who-is-it');
  it('both scenes validate', () => { expect(interviewScene.validate(friends)).toEqual([]); expect(interviewScene.validate(lineup)).toEqual([]); });
  it('the friends have a strict winner and the lineup can always be solved', () => {
    expect(winnerOf(friends.personas, friends.tiles)).toBe('ava');
    expect(identifies(lineup.personas, lineup.tiles, 'kai')).toBe(true);
    expect(identifies(lineup.personas, lineup.tiles, 'dana')).toBe(true); // every file is unique, so each suspect is identifiable
  });
  it('questions, answers, and the board narrowing', () => {
    expect(questionOf(friends.tiles[1])).toBe('Have you ever eaten spicy noodles?');
    expect(replyOf(friends.personas[0], 'fly')).toEqual({ done: false, text: 'No, I haven’t.' });
    expect(replyOf(friends.personas[2], 'eat').done).toBe(true);
    const asked = [{ tileId: 'eat', done: false }];
    expect(remaining(lineup.personas, asked).map((p) => p.id)).toEqual(['kai', 'nora']);
    expect(remaining(lineup.personas, [...asked, { tileId: 'be', done: true }]).map((p) => p.id)).toEqual(['kai']);
    expect(factsOf(lineup.personas[2], lineup.tiles)).toBe('been to Paris, flown in a plane, seen the sea and written a song');
  });
  it('catches a tie, two identical suspects and a lineup that cannot be solved', () => {
    const tie = JSON.parse(JSON.stringify(friends)) as InterviewScene;
    tie.personas[1].facts = JSON.parse(JSON.stringify(tie.personas[2].facts));
    expect(interviewScene.validate(tie).join()).toMatch(/strictly the most yes/);
    const twin = JSON.parse(JSON.stringify(lineup)) as InterviewScene;
    twin.personas[0].facts = JSON.parse(JSON.stringify(twin.personas[1].facts));
    expect(interviewScene.validate(twin).join()).toMatch(/same file|only the target/);
  });
  it('voices every possible answer (friends) and only the target (lineup), plus the model sentence', () => {
    const f = interviewScene.spoken(friends);
    expect(f.some((l) => l.who === 'Ava' && l.text.startsWith('Yes, I have. I flew to Japan'))).toBe(true);
    expect(f[f.length - 1].text).toBe('Ava has done the most because Ava has flown across the world, eaten spicy noodles and taken a photo in a cave.');
    const l = interviewScene.spoken(lineup);
    expect(l.every((x) => x.who === 'Vee' || x.who === 'Theo')).toBe(true);
    expect(l.some((x) => x.text.startsWith('Yes, I have. I flew to Rome'))).toBe(true);
    expect(l[l.length - 1].text).toBe('It is Kai. Kai has been to Paris, flown in a plane, seen the sea and written a song.');
  });
});

const askQ = (tileWord: string, part: string, wrongFirst?: string) => {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${tileWord}`) }));
  if (wrongFirst) fireEvent.click(screen.getByRole('button', { name: wrongFirst }));
  fireEvent.click(screen.getByRole('button', { name: part }));
};

describe('interview play-through', () => {
  it('friends: a malformed question costs nothing, 12 answers fill the notes, the right friend is the verdict, then the spoken line', () => {
    const scene = find<InterviewScene>(B1_S01_E1, 'who-most');
    const onDone = vi.fn();
    render(<interviewScene.view {...base} scene={scene} onDone={onDone} />);
    const parts: Record<string, [string, string]> = { fly: ['flown', 'flew'], eat: ['eaten', 'ate'], see: ['seen', 'saw'], take: ['taken', 'took'] };
    let first = true;
    for (const p of scene.personas) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(p.name) }));
      for (const t of scene.tiles) {
        if (first) {
          fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${t.verb.base}`) }));
          fireEvent.click(screen.getByRole('button', { name: parts[t.id][1] })); // the past simple: a malformed question
          expect(screen.getByText(/After “have” we need the participle/)).toBeTruthy();
          expect(document.querySelectorAll('.av-iv-notes [data-s="yes"], .av-iv-notes [data-s="no"]')).toHaveLength(0);
          fireEvent.click(screen.getByRole('button', { name: parts[t.id][0] }));
          first = false;
        } else askQ(t.verb.base, parts[t.id][0]);
      }
    }
    expect(screen.getByText('Questions 12 of 12')).toBeTruthy();
    expect(document.querySelectorAll('.av-iv-notes [data-s="yes"]')).toHaveLength(6);
    // wrong verdict: wobble, a hint, a mistake; the right one moves on
    fireEvent.click(screen.getByRole('button', { name: /Mia/ }));
    expect(screen.getByText(/Count again/)).toBeTruthy();
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Ava/ }));
    expect(screen.getByTestId('av-iv-say').textContent).toMatch(/Ava has done the most because Ava has flown across the world/);
    fireEvent.click(screen.getByRole('button', { name: /I said it/ }));
    expect(onDone).toHaveBeenCalledTimes(1);
    const r = onDone.mock.calls[0][0];
    expect(r).toMatchObject({ won: true, score: 12 * 5 + 20 });
    expect(r.mistakes).toEqual(['Who has done the most?']);
  });
  it('lineup: answers narrow the board to one, then the warrant and the line to say; a clean run has no mistakes', () => {
    const scene = find<InterviewScene>(B1_S01_E3, 'who-is-it');
    const onDone = vi.fn();
    render(<interviewScene.view {...base} scene={scene} onDone={onDone} />);
    expect(document.querySelectorAll('.av-iv-suspect:not([data-out])')).toHaveLength(6);
    askQ('eat', 'eaten', 'ate'); // sushi: no
    expect(document.querySelectorAll('.av-iv-suspect:not([data-out])')).toHaveLength(2);
    askQ('be', 'been'); // Paris: yes -> only Kai
    expect(document.querySelectorAll('.av-iv-suspect[data-last]')).toHaveLength(1);
    expect(screen.getByText(/Ask one more question/)).toBeTruthy(); // minAsks 3: confirm first
    expect(screen.queryByRole('button', { name: /Issue the warrant/ })).toBeNull();
    askQ('fly', 'flown');
    fireEvent.click(screen.getByRole('button', { name: /Issue the warrant/ }));
    expect(screen.getByTestId('av-iv-say').textContent).toMatch(/It is Kai\./);
    fireEvent.click(screen.getByRole('button', { name: /I said it/ }));
    expect(onDone).toHaveBeenCalledWith({ won: true, score: 3 * 5 + 20, mistakes: [] });
  });
});

// ---------- objection ----------
describe('objection', () => {
  const scene = find<ObjectionScene>(B1_S01_E3, 'objection');
  it('validates, and its catches work', () => {
    expect(objectionScene.validate(scene)).toEqual([]);
    const noClash = JSON.parse(JSON.stringify(scene)) as ObjectionScene;
    noClash.lines[3].kind = 'finished';
    expect(objectionScene.validate(noClash).join()).toMatch(/needs a clashing line/);
    const badEv = JSON.parse(JSON.stringify(scene)) as ObjectionScene;
    badEv.lines[3].evidenceId = 'zzz';
    expect(objectionScene.validate(badEv).join()).toMatch(/no evidence card that exists/);
  });
  it('voices the briefing, each statement and each press answer', () => {
    const lines = objectionScene.spoken(scene);
    expect(lines[0].who).toBe('Vee');
    expect(lines.filter((l) => l.who === 'Theo').map((l) => l.text)).toContain('I have never been to Lisbon.');
    expect(lines.map((l) => l.text)).toContain('I went two years ago, and again last spring.');
  });
  const pressLine1 = () => {
    fireEvent.click(screen.getByRole('button', { name: 'PRESS' }));
    for (const w of ['When', 'did', 'you', 'go']) fireEvent.click(within(document.querySelector('.av-ob-chips') as HTMLElement).getByRole('button', { name: new RegExp(`^${w}$`) }));
  };
  it('the evidence is locked until a line has been pressed with the right question; a jumbled question just wobbles', () => {
    render(<objectionScene.view {...base} scene={scene} onDone={vi.fn()} />);
    expect((screen.getByRole('button', { name: 'PRESENT' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'PRESS' }));
    for (const w of ['did', 'When', 'you', 'go']) fireEvent.click(within(document.querySelector('.av-ob-chips') as HTMLElement).getByRole('button', { name: new RegExp(`^${w}$`) }));
    expect(screen.getByText(/Ask about the finished time/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'PRESENT' })).toBeNull(); // still pressing: nothing was spent, the chips are back
    for (const w of ['When', 'did', 'you', 'go']) fireEvent.click(within(document.querySelector('.av-ob-chips') as HTMLElement).getByRole('button', { name: new RegExp(`^${w}$`) }));
    expect(screen.getByText(/I went two years ago, and again last spring/)).toBeTruthy();
    expect((screen.getByRole('button', { name: 'PRESENT' }) as HTMLButtonElement).disabled).toBe(false);
  });
  it('a wrong card is answered with fiction feedback and logged; the right card on the clashing line shows the OBJECTION! banner, then the repair and the case file', () => {
    const onDone = vi.fn();
    render(<objectionScene.view {...base} scene={scene} onDone={onDone} />);
    pressLine1();
    fireEvent.click(screen.getByRole('button', { name: 'PRESENT' }));
    fireEvent.click(screen.getByRole('button', { name: /Boarding pass/ }));
    expect(screen.getByText(/does not clash with this line/)).toBeTruthy();
    // go to statement 4 (the clash) and present the Lisbon photo
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    fireEvent.click(screen.getByRole('button', { name: 'PRESENT' }));
    fireEvent.click(screen.getByRole('button', { name: /Tram photo in Lisbon/ }));
    expect(screen.getByTestId('av-ob-banner').textContent).toBe('OBJECTION!');
    // wrong repair first (gentle, explained), then the right one
    fireEvent.click(screen.getByRole('button', { name: 'I have been to Lisbon last year.' }));
    expect(screen.getByText(/is the time finished, or is it up to now/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'I went to Lisbon last year.' }));
    expect(screen.getByTestId('av-ob-file').textContent).toMatch(/Statement 4 did not match “Tram photo in Lisbon”/);
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Close the case/ }));
    expect(onDone).toHaveBeenCalledTimes(1);
    const r = onDone.mock.calls[0][0];
    expect(r.won).toBe(true);
    expect(r.score).toBe(10 + 20 + 10);
    expect(r.mistakes).toEqual(['I have been to Rome twice.', 'I have been to Lisbon last year.']);
  });
  it('a presented card on an up-to-now line with no date explains what to do (no penalty beyond the gem)', () => {
    render(<objectionScene.view {...base} scene={scene} onDone={vi.fn()} />);
    pressLine1();
    fireEvent.click(screen.getByRole('button', { name: '3' })); // "I have flown a lot." has not been pressed yet
    fireEvent.click(screen.getByRole('button', { name: 'PRESENT' }));
    fireEvent.click(screen.getByRole('button', { name: /Club list/ }));
    expect(screen.getByText(/has no date yet/)).toBeTruthy();
  });
});

// ---------- cipher ----------
describe('cipher logic and data', () => {
  it('colours like Wordle, duplicates included', () => {
    expect(marksOf('seen', 'seen')).toEqual(['green', 'green', 'green', 'green']);
    expect(marksOf('sean', 'seen')).toEqual(['green', 'green', 'grey', 'green']);
    expect(marksOf('eeee', 'seen')).toEqual(['grey', 'green', 'green', 'grey']);
    expect(marksOf('nees', 'seen')).toEqual(['yellow', 'green', 'green', 'yellow']);
    expect(marksOf('ate', 'eat')).toEqual(['yellow', 'yellow', 'yellow']);
  });
  it('classifies the past simple, the base form and the answer; keeps the best key colour', () => {
    const c = { sentence: 'I have ___ it.', base: 'see', past: 'saw', participle: 'seen' };
    expect(classify('seen', c)).toBe('right');
    expect(classify('saw', c)).toBe('past');
    expect(classify('see', c)).toBe('base');
    expect(classify('seed', c)).toBe('other');
    expect(keyStates([{ guess: 'sean', marks: marksOf('sean', 'seen') }, { guess: 'nees', marks: marksOf('nees', 'seen') }]).n).toBe('green');
  });
  it('validates and voices the briefing and each finished sentence', () => {
    const s = find<CipherScene>(B1_S01_E1, 'cipher');
    expect(cipherScene.validate(s)).toEqual([]);
    expect(cipherScene.spoken(s).map((l) => l.text)).toContain('I have never seen a rainbow like this.');
    expect(cipherScene.validate({ ...s, cards: [{ sentence: 'no gap', base: 'See', past: 'saw', participle: 'seen' }, ...s.cards] }).join()).toMatch(/gap|lowercase/);
  });
});

describe('cipher play-through', () => {
  const type = (word: string) => { for (const ch of word) fireEvent.keyDown(window, { key: ch }); };
  it('types with the real keyboard, flips tiles, notes the past simple, gives a first-letter hint after three misses, then shows the chain', () => {
    const scene = find<CipherScene>(B1_S01_E1, 'cipher');
    const onDone = vi.fn();
    render(<cipherScene.view {...base} scene={scene} onDone={onDone} />);
    type('saw'); fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByText(/That is the past simple. After have we need the participle/)).toBeTruthy(); // the past simple is shorter than the box row: a kind note, no try spent
    expect(document.querySelectorAll('.av-ci-row[data-old]')).toHaveLength(0);
    type('sawn'); fireEvent.keyDown(window, { key: 'Enter' }); // sawn: not a form, only colours
    expect(document.querySelectorAll('.av-ci-box[data-m="green"]').length).toBeGreaterThan(0);
    type('sean'); fireEvent.keyDown(window, { key: 'Enter' });
    type('seed'); fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByText(/Hint: it starts with “s”/)).toBeTruthy();
    // the first letter is already in the box
    expect(document.querySelector('.av-ci-box[data-hint]')?.textContent).toBe('s');
    type('een'); fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByTestId('av-ci-chain').textContent).toMatch(/see→saw→seen/);
    expect(document.querySelector('.av-ci-gap')?.textContent).toBe('seen');
  });
  it('the on-screen keys work and a clean run of three cards scores 30 with no mistakes', () => {
    const scene: CipherScene = { id: 'c', part: 4, kind: 'cipher', title: 'Cipher', who: 'Vee', intro: 'Go.', cards: [
      { sentence: 'I have ___ it.', base: 'do', past: 'did', participle: 'done' },
      { sentence: 'We have ___ it.', base: 'make', past: 'made', participle: 'made' },
      { sentence: 'She has ___ it.', base: 'eat', past: 'ate', participle: 'eaten' },
    ] };
    const onDone = vi.fn();
    render(<cipherScene.view {...base} scene={scene} onDone={onDone} />);
    const key = (ch: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${ch}$`, 'i') }));
    for (const ch of 'dida') key(ch); // a wrong guess with only colours: no slip, no mistake
    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));
    expect(document.querySelectorAll('.av-ci-row[data-old]')).toHaveLength(1);
    for (const ch of 'done') key(ch);
    fireEvent.click(screen.getByRole('button', { name: 'Enter' }));
    expect(screen.getByTestId('av-ci-chain')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'I knew it' }));
    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    type('made'); fireEvent.keyDown(window, { key: 'Enter' }); // here the participle is also the past simple, and it is simply right
    expect(screen.getByTestId('av-ci-chain')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    type('eaten'); fireEvent.keyDown(window, { key: 'Enter' });
    expect(onDone).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Finish the lesson/ }));
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone.mock.calls[0][0]).toEqual({ won: true, score: 30, mistakes: [] });
  });
  it('typing the base form or the past simple gets the kind note and puts the verb chain in the Mistake Bank (half points, no gem)', () => {
    const scene: CipherScene = { id: 'c', part: 4, kind: 'cipher', title: 'Cipher', who: 'Vee', intro: 'Go.', cards: [
      { sentence: 'I have ___ a letter.', base: 'write', past: 'wrote', participle: 'written' },
      { sentence: 'We have ___ it.', base: 'make', past: 'made', participle: 'made' },
      { sentence: 'She has ___ it.', base: 'see', past: 'saw', participle: 'seen' },
    ] };
    const onDone = vi.fn();
    render(<cipherScene.view {...base} scene={scene} onDone={onDone} />);
    const go = (w: string) => { type(w); fireEvent.keyDown(window, { key: 'Enter' }); };
    go('write');
    expect(screen.getByText(/That is the base form/)).toBeTruthy();
    go('wrote');
    expect(screen.getByText(/That is the past simple/)).toBeTruthy();
    expect(document.querySelector('.av-ci-sentence')?.textContent).toMatch(/\(write\)/);
    go('written');
    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    go('made');
    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    go('seen');
    fireEvent.click(screen.getByRole('button', { name: /Finish the lesson/ }));
    expect(onDone.mock.calls[0][0]).toEqual({ won: true, score: 25, mistakes: ['write · wrote · written'] });
  });
  it('three misses unlock the first-letter hint, and the hint card scores half', () => {
    const scene: CipherScene = { id: 'c', part: 4, kind: 'cipher', title: 'Cipher', who: 'Vee', intro: 'Go.', clue: undefined, cards: [
      { sentence: 'I have ___ it.', base: 'see', past: 'saw', participle: 'seen', clue: 'It rhymes with green.' },
      { sentence: 'We have ___ it.', base: 'make', past: 'made', participle: 'made' },
      { sentence: 'She has ___ it.', base: 'eat', past: 'ate', participle: 'eaten' },
    ] } as unknown as CipherScene;
    render(<cipherScene.view {...base} scene={scene} onDone={vi.fn()} />);
    for (const w of ['aaaa', 'bbbb', 'cccc']) { type(w); fireEvent.keyDown(window, { key: 'Enter' }); }
    expect(screen.getByText(/It rhymes with green/)).toBeTruthy();
  });
});

// ---------- the lessons that use them ----------
describe('Wave 1 wiring in the three B1 Season 1 lessons', () => {
  it('every lesson stays valid, in part order, with its rule before the production games and every criterion trained', () => {
    for (const l of [B1_S01_E1, B1_S01_E2, B1_S01_E3]) expect(validateScript(l)).toEqual([]);
  });
  it('E1 (v4): the Cipher is in the Forge act, the interview chain comes before the Re-Bluff speak scene', () => {
    const ids = B1_S01_E1.scenes.map((s) => s.id);
    const cipher = B1_S01_E1.scenes.find((s) => s.kind === 'cipher')!;
    expect(cipher.part).toBe(3);
    expect(ids.indexOf('who-most')).toBeLessThan(ids.indexOf('mission'));
    expect(ids.indexOf('who-most')).toBeGreaterThan(ids.indexOf('mission-model'));
    expect(B1_S01_E1.scenes.find((s) => s.id === 'who-most')!.trains).toEqual([5]);
    expect(cipher.trains).toEqual([3]);
  });
  it('E2: cause-sort is replaced by the Postcard Inspector with the typed finish', () => {
    expect(B1_S01_E2.scenes.map((s) => s.id)).not.toContain('cause-sort');
    const s = find<InspectScene>(B1_S01_E2, 'postcard-desk');
    expect(s.look).toBe('postcard');
    expect(s.finale?.frame).toBe('I felt … because …');
    expect(s.trains).toEqual([1]);
  });
  it('E3: match-qa, memory and report are replaced by the lineup, the Passport desk and Objection!', () => {
    const ids = B1_S01_E3.scenes.map((s) => s.id);
    for (const gone of ['match-qa', 'mem-scenes', 'report']) expect(ids).not.toContain(gone);
    expect(find<InterviewScene>(B1_S01_E3, 'who-is-it').look).toBe('lineup');
    expect(find<InspectScene>(B1_S01_E3, 'passport-desk').look).toBe('passport');
    expect(B1_S01_E3.scenes.find((s) => s.kind === 'objection')!.trains).toEqual([3, 4]);
  });
  it('the new kinds are scored games (gems), three of them are encounters (stinger) and the case trophy drops from Objection', () => {
    for (const k of ['inspect', 'interview', 'objection', 'cipher']) expect(SCORED_KINDS.has(k)).toBe(true);
    expect([...ENCOUNTER_KINDS]).toEqual(expect.arrayContaining(['inspect', 'interview', 'objection']));
    expect(ENCOUNTER_KINDS).not.toContain('cipher');
    const loot = potentialLoot(B1_S01_E3);
    expect(loot.some((x) => x.kind === 'trophy' && x.sceneId === 'objection')).toBe(true);
    expect(loot.filter((x) => x.kind === 'gem').length).toBeGreaterThanOrEqual(10);
  });
  it('the voice bake list has the new lines (briefings, rules, answers, statements, sentences)', () => {
    const texts = (l: typeof B1_S01_E1) => spokenLines(l).map((x) => x.text);
    expect(texts(B1_S01_E1)).toEqual(expect.arrayContaining(['Yes, I have. I ate spicy noodles in Seoul last spring.', 'I have never seen a rainbow like this.', 'Past simple: a finished time, so we say when.']));
    expect(texts(B1_S01_E3)).toEqual(expect.arrayContaining(['I went two years ago, and again last spring.', 'Been means the person went and came back. The passport shows a BACK HOME stamp.', 'Yes, I have. I wrote one for my friend’s birthday.']));
    expect(texts(B1_S01_E2)).toEqual(expect.arrayContaining(['A word ending in ed, like amazed or disappointed, says how a person feels.']));
  });
  it('responses per lesson (items a student answers) stay at or above what they were before Wave 1', () => {
    const n = (s: Record<string, unknown>): number => {
      const g = (k: string) => (s[k] as unknown[] | undefined)?.length ?? 0;
      switch (s.kind) {
        case 'choice': return g('questions');
        case 'sort': return g('items');
        case 'match': case 'memory': return g('pairs');
        case 'build': return g('items');
        case 'forge': return g('rounds') * 3;
        case 'boss': return g('rounds');
        case 'rapport': return g('exchanges');
        case 'write': return g('rows');
        case 'hunt': return g('targets');
        case 'speak': return g('turns');
        case 'rule': return g('lines');
        case 'inspect': return (s.batches as { items: unknown[] }[]).reduce((a, b) => a + b.items.length, 0) + (s.finale ? 1 : 0);
        case 'interview': return s.look === 'friends' ? g('personas') * g('tiles') + 1 : ((s.minAsks as number | undefined) ?? 3) + 1;
        case 'objection': return ((s.minPress as number | undefined) ?? 1) + 2;
        case 'cipher': return g('cards');
        case 'finder': case 'workshop': case 'beats': case 'switchboard': return responsesOf(s as never);
        default: return 0;
      }
    };
    const total = (l: typeof B1_S01_E1) => l.scenes.reduce((a, s) => a + n(s as unknown as Record<string, unknown>), 0);
    // before Wave 1 (same counting): E1 69, E2 54, E3 75. Wave 2 removed two memory games of E2 and added four new games (wave2.test.tsx has the full metric).
    expect(total(B1_S01_E1)).toBeGreaterThanOrEqual(69);
    expect(total(B1_S01_E2)).toBeGreaterThanOrEqual(54);
    expect(total(B1_S01_E3)).toBeGreaterThanOrEqual(75);
  });
});

describe('Wave 1 encounters in the quest layer', () => {
  it('the desk, the interview and the cross-examination open with a stinger (the cipher is a quick power-up and does not)', () => {
    const at = (l: typeof B1_S01_E3, id: string) => l.scenes.find((s) => s.id === id);
    for (const [l, id, kind] of [[B1_S01_E3, 'objection', 'objection'], [B1_S01_E3, 'who-is-it', 'interview'], [B1_S01_E3, 'passport-desk', 'inspect']] as const) {
      expect(advanceFlow(initialFlow([3]), at(l, id), true, []).queue).toEqual([{ type: 'stinger', sceneId: id, kind }]);
    }
    expect(advanceFlow(initialFlow([3]), B1_S01_E1.scenes.find((s) => s.id === 'cipher'), true, []).queue).toEqual([]);
  });
  it('each stinger names its game and ends on a tap', () => {
    const onDone = vi.fn();
    for (const [kind, label] of [['inspect', 'DESK DUTY'], ['interview', 'INTERVIEW'], ['objection', 'CROSS-EXAMINATION']] as const) {
      const { unmount } = render(<Stinger kind={kind} title="x" calm={false} onDone={onDone} />);
      expect(screen.getByText(label)).toBeTruthy();
      unmount();
    }
  });
});

