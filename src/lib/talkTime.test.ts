import { describe, expect, it } from 'vitest';
import { SpeechGate, talkStatus, TALK_TARGET_PCT } from './talkTime';

/** Drive the gate with a constant level for `seconds`, sampling every 200ms like the classroom meter. */
function run(gate: SpeechGate, rms: number, seconds: number, startMs: number) {
  let t = startMs;
  for (let i = 0; i < (seconds * 1000) / 200; i++) {
    gate.update(rms, t);
    t += 200;
  }
  return t;
}

describe('SpeechGate', () => {
  it('counts roughly the seconds of real speech', () => {
    const gate = new SpeechGate();
    let t = run(gate, 0.003, 10, 0); // quiet room
    t = run(gate, 0.12, 5, t); // talking
    run(gate, 0.003, 5, t); // quiet again
    const counted = gate.pendingMs / 1000;
    expect(counted).toBeGreaterThan(4.5);
    expect(counted).toBeLessThan(6);
  });

  it('ignores steady background noise below the floor', () => {
    const gate = new SpeechGate();
    run(gate, 0.009, 30, 0); // a fan: constant, below minRms
    expect(gate.pendingMs).toBe(0);
  });

  it('learns a noisy room and still hears speech over it', () => {
    const gate = new SpeechGate();
    let t = run(gate, 0.02, 10, 0); // loud-ish room
    const before = gate.pendingMs;
    t = run(gate, 0.2, 4, t);
    expect(gate.pendingMs - before).toBeGreaterThan(3);
  });

  it('bridges short pauses instead of dropping them', () => {
    const gate = new SpeechGate();
    let t = run(gate, 0.003, 2, 0);
    t = run(gate, 0.12, 1, t);
    t = run(gate, 0.003, 0.2, t); // 200ms breath
    run(gate, 0.12, 1, t);
    expect(gate.pendingMs / 1000).toBeGreaterThan(2);
  });

  it('muted (silent) microphone never counts', () => {
    const gate = new SpeechGate();
    run(gate, 0, 60, 0);
    expect(gate.takeSeconds()).toBe(0);
  });

  it('takeSeconds keeps the remainder', () => {
    const gate = new SpeechGate();
    run(gate, 0.003, 2, 0);
    run(gate, 0.12, 2.5, 2000);
    const first = gate.takeSeconds();
    expect(first).toBeGreaterThanOrEqual(2);
    expect(gate.pendingMs).toBeLessThan(1000);
  });
});

describe('talkStatus', () => {
  it('uses 50% (student talks more than teacher) as the pass line', () => {
    expect(TALK_TARGET_PCT).toBe(50);
    expect(talkStatus(72)).toBe('great');
    expect(talkStatus(60)).toBe('great');
    expect(talkStatus(55)).toBe('good');
    expect(talkStatus(50)).toBe('good');
    expect(talkStatus(40)).toBe('watch');
    expect(talkStatus(20)).toBe('low');
  });
});

import { TALK_TARGET_BY_HUB, normalizeTalkHub, talkTargetFor } from './talkTime';

describe('hub-banded talk targets', () => {
  it('maps the many booking hub names to three hubs', () => {
    expect(normalizeTalkHub('Playground')).toBe('playground');
    expect(normalizeTalkHub('kids')).toBe('playground');
    expect(normalizeTalkHub('success')).toBe('professional');
    expect(normalizeTalkHub('Professional')).toBe('professional');
    expect(normalizeTalkHub('academy')).toBe('academy');
    expect(normalizeTalkHub(null)).toBe('academy');
  });

  it('asks young beginners for less speech than older learners', () => {
    expect(TALK_TARGET_BY_HUB.playground).toBeLessThan(TALK_TARGET_BY_HUB.academy);
  });

  it('weights each hub by how many lessons were measured in it', () => {
    expect(talkTargetFor(undefined)).toBe(50);
    expect(talkTargetFor([])).toBe(50);
    expect(talkTargetFor([{ hub: 'playground', n: 10 }])).toBe(40);
    expect(talkTargetFor([{ hub: 'academy', n: 5 }, { hub: 'kids', n: 5 }])).toBe(45);
    expect(talkTargetFor([{ hub: 'academy', n: 0 }])).toBe(50);
  });

  it('judges a share against its own target, and stays 60/50/35 at the default', () => {
    expect(talkStatus(45, 40)).toBe('good');
    expect(talkStatus(45)).toBe('watch');
    expect(talkStatus(50, 40)).toBe('great');
    expect(talkStatus(24, 40)).toBe('low');
    expect(talkStatus(60)).toBe('great');
    expect(talkStatus(35)).toBe('watch');
    expect(talkStatus(34)).toBe('low');
  });
});
