import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { useDragChip } from '../drag';
import { hasFlag } from '../../academy-player/drawn';
import { Traveller, WavingFlag } from './anim';
import type { BorderSlide, MemorySlide } from '../types';
import { Feedback, NOT_YET, Panel } from './shared';

/** Border control: a traveller arrives ("I am from Italy."). Drag the traveller onto the right nationality passport. */
export function BorderView({ slide }: { slide: BorderSlide }) {
  const { right, wrong, done, award, seed, speak } = useDeck();
  const [round, setRound] = useState(0);
  const [held, setHeld] = useState(false);
  const [slip, setSlip] = useState(false);
  const [stamped, setStamped] = useState<string | null>(null);
  const finished = round >= slide.rounds.length;
  const cur = slide.rounds[Math.min(round, slide.rounds.length - 1)];
  const opts = useMemo(() => shuffled(cur.options, seed + round), [cur, seed, round]);
  useEffect(() => {
    if (!finished) void speak(slide.actors?.[0]?.who ?? 'Theo', cur.says);
  }, [round, finished, cur, speak, slide.actors]);
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
          <div className="ad-traveller" data-held={held} key={round}>
            <button type="button" className="ad-traveller-card" aria-label={`Traveller: ${cur.says}`} {...drag.bind('traveller')}>
              {hasFlag(cur.flag) ? <Traveller code={cur.flag} label={`A traveller with the flag of ${cur.flag}`} /> : null}
              <span className="ad-traveller-says">“{cur.says}”</span>
            </button>
          </div>
          <div className="ad-passports">
            {opts.map((o) => (
              <button key={o} type="button" className="ad-passport" data-drop={o} data-stamped={stamped === o} onClick={() => held && drop(o)} aria-label={`Passport: ${o}`}>
                {slide.flags?.[o] && <span className="ad-passport-flag"><WavingFlag code={slide.flags[o]} label={`Flag for ${o}`} /></span>}
                <svg className="ad-passport-emblem" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="22" fill="none" stroke="#f6d77a" strokeWidth="2.5" /><ellipse cx="30" cy="30" rx="9" ry="22" fill="none" stroke="#f6d77a" strokeWidth="2" /><path d="M8 30h44M12 19h36M12 41h36" stroke="#f6d77a" strokeWidth="2" fill="none" /><path d="M30 4l2.2 5h5.3l-4.3 3.2 1.7 5.1-4.9-3.2-4.9 3.2 1.7-5.1L22.5 9h5.3z" fill="#f6d77a" transform="translate(0 -3) scale(.9) translate(3 0)" /></svg>
                <span className="ad-passport-title">PASSPORT</span>
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
  const { right, wrong, done, seed, speak } = useDeck();
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
            <button key={c.k} type="button" className="ad-mem" data-up={up} data-matched={matched.includes(c.pair)} disabled={up || open.length === 2} onClick={() => { if (c.text) void speak('Vee', c.text); setOpen([...open, c.k]); }} aria-label={up ? (c.flag ? `Flag ${c.flag}` : c.text) : 'Hidden card'}>
              <span className="ad-mem-inner">
                <span className="ad-mem-face ad-mem-back" aria-hidden="true">★</span>
                <span className="ad-mem-face ad-mem-front">{c.flag && hasFlag(c.flag) ? <WavingFlag code={c.flag} label={`Flag ${c.flag}`} /> : <b>{c.text}</b>}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="ad-hint-line">{matched.length} of {slide.pairs.length} pairs found</p>
    </Panel>
  );
}
