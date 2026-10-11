import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { useDragChip } from '../drag';
import { NumberCard } from '../../academy-player/drawn';
import type { LockersSlide, NumTrainSlide, PadlockSlide } from '../types';
import { Icon } from '../Icon';
import { Feedback, NOT_YET, Panel } from './shared';

/** Locker Pop: a number WORD is shown; open the locker with that number. */
export function LockersView({ slide }: { slide: LockersSlide }) {
  const { right, wrong, done, seed, artBase, speak } = useDeck();
  const [round, setRound] = useState(0);
  const [open, setOpen] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const [slip, setSlip] = useState(false);
  const all = useMemo(() => shuffled(slide.grid ?? [...new Set([...slide.rounds, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])].slice(0, 10).sort((a, b) => a - b), seed), [slide.rounds, slide.grid, seed]);
  const target = slide.rounds[round];
  const finished = round >= slide.rounds.length;
  useEffect(() => {
    if (finished) done();
    else void speak('Vee', slide.words[target]);
  }, [finished, done, speak, slide.words, target]);
  const tap = (n: number) => {
    if (finished || open.includes(n)) return;
    if (n === target) {
      setOpen([...open, n]);
      setRound(round + 1);
      if (!slip) right();
      setSlip(false);
    } else {
      setSlip(true);
      setShake(n);
      wrong();
      window.setTimeout(() => setShake(null), 380);
    }
  };
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-lockers-ask" aria-live="polite">{finished ? <><Icon name="unlock" /> All open!</> : <>Open locker: <b>{slide.words[target]}</b></>}</div>
      <div className="ad-lockers">
        {all.map((n) => (
          <button key={n} type="button" className="ad-locker ad-locker-sprite" data-open={open.includes(n)} data-shake={shake === n} onClick={() => tap(n)} aria-label={`Locker ${n}`}>
            <img className="ad-lk-img ad-lk-closed" src={`${artBase}/objects/locker-${n % 2 ? 'violet' : 'blue'}.webp`} alt="" aria-hidden="true" draggable={false} />
            <img className="ad-lk-img ad-lk-open" src={`${artBase}/objects/locker-${n % 2 ? 'violet' : 'blue'}-open.webp`} alt="" aria-hidden="true" draggable={false} />
            <span className="ad-locker-num">{n}</span>
            <img className="ad-lk-prize" src={`${artBase}/objects/star.webp`} alt="" aria-hidden="true" draggable={false} />
          </button>
        ))}
      </div>
      {slip && !finished && <Feedback kind="try">{NOT_YET}</Feedback>}
      <p className="ad-hint-line">{round} of {slide.rounds.length} lockers opened</p>
    </Panel>
  );
}

/** Number Train: drag (or tap) each number word onto the right carriage. */
export function NumTrainView({ slide }: { slide: NumTrainSlide }) {
  const { right, wrong, done, seed, speak } = useDeck();
  const [placed, setPlaced] = useState<number[]>([]);
  const [held, setHeld] = useState<number | null>(null);
  const [slip, setSlip] = useState(false);
  const bank = useMemo(() => shuffled(slide.numbers, seed), [slide.numbers, seed]);
  const drop = (n: number, car: number) => {
    if (placed.includes(car)) return;
    if (n === car) {
      setPlaced([...placed, car]);
      setHeld(null);
      if (!slip) right();
      setSlip(false);
    } else {
      setSlip(true);
      wrong();
    }
  };
  const drag = useDragChip((id, t) => drop(Number(id), Number(t)), (id) => {
    void speak('Vee', slide.words[Number(id)]);
    setHeld(held === Number(id) ? null : Number(id));
  });
  const all = placed.length === slide.numbers.length;
  useEffect(() => {
    if (all) done();
  }, [all, done]);
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-train">
        {slide.numbers.map((n) => (
          <button key={n} type="button" className="ad-car" data-drop={n} data-done={placed.includes(n)} onClick={() => held !== null && drop(held, n)} aria-label={`Carriage ${n}${placed.includes(n) ? `: ${slide.words[n]}` : ''}`}>
            <span className="ad-car-roof" aria-hidden="true" />
            <span className="ad-car-window"><NumberCard n={n} label={`${n}`} /></span>
            <span className="ad-car-slot">{placed.includes(n) ? `✓ ${slide.words[n]}` : 'drop here'}</span>
            <span className="ad-wheels" aria-hidden="true"><i /><i /></span>
          </button>
        ))}
      </div>
      <div className="ad-chips">
        {bank.filter((n) => !placed.includes(n)).map((n) => (
          <button key={n} type="button" className="ad-chip" data-held={held === n} {...drag.bind(String(n), false)}>{slide.words[n]}</button>
        ))}
        {placed.length === slide.numbers.length && <span className="ad-chips-empty"><Icon name="check" /> All words used!</span>}
      </div>
      {slip && !all && <Feedback kind="try">{NOT_YET}</Feedback>}
      <p className="ad-hint-line">{placed.length} of {slide.numbers.length} carriages filled. Drag a word to its number (or tap a word, then a carriage).</p>
    </Panel>
  );
}

/** Padlock: the clue is in WORDS ("four, two, seven"); set the dials to the digits. */
export function PadlockView({ slide }: { slide: PadlockSlide }) {
  const { right, wrong, done, award, artBase } = useDeck();
  const [dials, setDials] = useState<number[]>(() => slide.code.split('').map(() => 0));
  const [opened, setOpened] = useState(false);
  const [slip, setSlip] = useState(false);
  const bump = (i: number, d: number) => setDials(dials.map((v, k) => (k === i ? (v + d + 10) % 10 : v)));
  const tryOpen = () => {
    if (dials.join('') === slide.code) {
      setOpened(true);
      right();
      if (slide.stamp) award(slide.stamp);
      done();
    } else {
      setSlip(true);
      wrong();
    }
  };
  return (
    <Panel title={slide.prompt}>
      <div className="ad-clue"><Icon name="note" /> <b>{slide.clue}</b></div>
      <div className="ad-padlock" data-open={opened}>
        {artBase ? <img className="ad-pl-img" src={`${artBase}/objects/padlock${opened ? '-open' : ''}.webp`} alt="" aria-hidden="true" draggable={false} /> : <div className="ad-shackle" aria-hidden="true" />}
        <div className="ad-dials">
          <span className="ad-screw ad-screw-l" aria-hidden="true" /><span className="ad-screw ad-screw-r" aria-hidden="true" />
          {dials.map((v, i) => (
            <div key={i} className="ad-dial">
              <button type="button" className="ad-dial-btn" aria-label={`Dial ${i + 1} up`} disabled={opened} onClick={() => bump(i, 1)}>▲</button>
              <output className="ad-dial-num" aria-label={`Dial ${i + 1}: ${v}`}><span key={v} className="ad-roll">{v}</span></output>
              <button type="button" className="ad-dial-btn" aria-label={`Dial ${i + 1} down`} disabled={opened} onClick={() => bump(i, -1)}>▼</button>
            </div>
          ))}
        </div>
      </div>
      {opened && <div className="ad-drawer"><div className="ad-drawer-card"><Icon name="idcard" className="ad-icon-big" /> <b>Member card</b><span>{slide.code.split('').join('-')}</span></div></div>}
      {opened ? <Feedback kind="ok">Click! {slide.reward}</Feedback> : slip ? <Feedback kind="try">{NOT_YET} Read the clue words one by one.</Feedback> : null}
      <div className="ad-row"><button type="button" className="ad-btn ad-btn-primary" disabled={opened} onClick={tryOpen}><Icon name="unlock" /> Open</button></div>
    </Panel>
  );
}
