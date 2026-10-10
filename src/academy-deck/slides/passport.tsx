import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { useDragChip } from '../drag';
import { Flag, FlagPerson, hasFlag } from '../../academy-player/drawn';
import type { BorderSlide, MemorySlide } from '../types';
import { Feedback, NOT_YET, Panel } from './shared';

/** Border control: a traveller arrives ("I am from Italy."). Drag the traveller onto the right nationality passport. */
export function BorderView({ slide }: { slide: BorderSlide }) {
  const { right, wrong, done, award, seed } = useDeck();
  const [round, setRound] = useState(0);
  const [held, setHeld] = useState(false);
  const [slip, setSlip] = useState(false);
  const [stamped, setStamped] = useState<string | null>(null);
  const finished = round >= slide.rounds.length;
  const cur = slide.rounds[Math.min(round, slide.rounds.length - 1)];
  const opts = useMemo(() => shuffled(cur.options, seed + round), [cur, seed, round]);
  const drop = (target: string) => {
    if (finished || stamped) return;
    if (target === cur.answer) {
      setStamped(target);
      setHeld(false);
      if (!slip) right();
      setSlip(false);
      window.setTimeout(() => {
        setStamped(null);
        setRound((r) => r + 1);
      }, 900);
    } else {
      setSlip(true);
      wrong();
    }
  };
  const drag = useDragChip((_id, t) => drop(t), () => setHeld(!held));
  useEffect(() => {
    if (finished) {
      if (slide.stamp) award(slide.stamp);
      done();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);
  return (
    <Panel title={slide.prompt} wide>
      {!finished ? (
        <>
          <div className="ad-traveller" data-held={held}>
            <button type="button" className="ad-traveller-card" aria-label={`Traveller: ${cur.says}`} {...drag.bind('traveller')}>
              {hasFlag(cur.flag) ? <FlagPerson code={cur.flag} label={`A traveller with the flag of ${cur.flag}`} /> : null}
              <span className="ad-traveller-says">“{cur.says}”</span>
            </button>
          </div>
          <div className="ad-passports">
            {opts.map((o) => (
              <button key={o} type="button" className="ad-passport" data-drop={o} data-stamped={stamped === o} onClick={() => held && drop(o)} aria-label={`Passport: ${o}`}>
                <span className="ad-passport-cover">🛂</span>
                <b>{o}</b>
                {stamped === o && <span className="ad-stamp-ok">APPROVED</span>}
              </button>
            ))}
          </div>
          {slip && <Feedback kind="try">{NOT_YET} Where is the traveller from? Which nationality is that?</Feedback>}
          <p className="ad-hint-line">Traveller {round + 1} of {slide.rounds.length}. Drag the traveller onto the right passport (or tap the traveller, then a passport).</p>
        </>
      ) : (
        <Feedback kind="ok">All travellers checked. Border stamp earned!</Feedback>
      )}
    </Panel>
  );
}

/** Memory: flip two cards, match each flag with its nationality word. No timers, no penalty. */
export function MemoryView({ slide }: { slide: MemorySlide }) {
  const { right, wrong, done, seed } = useDeck();
  const cards = useMemo(() => shuffled(slide.pairs.flatMap((p, i) => [{ k: `f${i}`, pair: i, flag: p.flag, text: '' }, { k: `t${i}`, pair: i, flag: '', text: p.text }]), seed), [slide.pairs, seed]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((k) => cards.find((c) => c.k === k)!);
    if (a.pair === b.pair) {
      setMatched((m) => [...m, a.pair]);
      setOpen([]);
      right();
      return;
    }
    wrong();
    const t = window.setTimeout(() => setOpen([]), 1100);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const all = matched.length === slide.pairs.length;
  useEffect(() => {
    if (all) done();
  }, [all, done]);
  return (
    <Panel title={slide.prompt}>
      <div className="ad-memory">
        {cards.map((c) => {
          const up = open.includes(c.k) || matched.includes(c.pair);
          return (
            <button key={c.k} type="button" className="ad-mem" data-up={up} data-matched={matched.includes(c.pair)} disabled={up || open.length === 2} onClick={() => setOpen([...open, c.k])} aria-label={up ? (c.flag ? `Flag ${c.flag}` : c.text) : 'Hidden card'}>
              {up ? (c.flag && hasFlag(c.flag) ? <Flag code={c.flag} label={`Flag ${c.flag}`} /> : <b>{c.text}</b>) : <span>?</span>}
            </button>
          );
        })}
      </div>
      <p className="ad-hint-line">{matched.length} of {slide.pairs.length} pairs found</p>
    </Panel>
  );
}
