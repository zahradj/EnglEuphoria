import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { CountUpSlide } from '../types';
import { numberWord } from '../spoken';
import { Feedback, NOT_YET, Panel } from './shared';

/** Count with Vee: the row is counted aloud, then the gaps are filled in order. Shows whether the student can really count (1-10, 11-20, by tens). */
export function CountUpView({ slide }: { slide: CountUpSlide }) {
  const { right, wrong, done, speak, speakSeq, seed } = useDeck();
  const [r, setR] = useState(0);
  const [filled, setFilled] = useState(0); // blanks filled so far in this round
  const [bad, setBad] = useState<number | null>(null);
  const [slip, setSlip] = useState(false);
  const round = slide.rounds[r];
  const gaps = round.blanks;
  const complete = filled >= gaps.length;
  const options = useMemo(() => {
    const missing = gaps.map((i) => round.seq[i]);
    const near = missing.flatMap((v) => [v - 1, v + 1, v - 10, v + 10]).filter((v) => v > 0 && !round.seq.includes(v));
    const stepNear = round.seq.length > 1 ? missing.map((v) => v + (round.seq[1] - round.seq[0]) * 2) : [];
    return shuffled([...new Set([...missing, ...near.slice(0, 2), ...stepNear.slice(0, 1).filter((v) => !round.seq.includes(v) && !missing.includes(v))])], seed + r);
  }, [round, gaps, seed, r]);
  const hear = () => void speakSeq(round.seq.map((n) => ({ who: 'Vee', text: numberWord(n) })));
  useEffect(() => {
    void speakSeq(round.seq.map((n) => ({ who: 'Vee', text: numberWord(n) })));
  }, [round, speakSeq]);
  const pick = (v: number) => {
    if (complete) return;
    const want = round.seq[gaps[filled]];
    if (v === want) {
      setFilled(filled + 1);
      setSlip(false);
      if (!slip) right();
      void speak('Vee', numberWord(v));
    } else {
      setSlip(true);
      setBad(v);
      wrong();
      window.setTimeout(() => setBad(null), 380);
    }
  };
  const used = gaps.slice(0, filled).map((i) => round.seq[i]);
  const last = r + 1 >= slide.rounds.length;
  useEffect(() => {
    if (complete && last) done();
  }, [complete, last, done]);
  const next = () => {
    setR(r + 1);
    setFilled(0);
    setSlip(false);
  };
  return (
    <Panel title={slide.prompt} wide>
      <div className="ad-count-row" role="group" aria-label="Number row">
        {round.seq.map((n, i) => {
          const gi = gaps.indexOf(i);
          const isGap = gi >= 0 && gi >= filled;
          return (
            <span key={i} className="ad-count-tile" data-gap={isGap} data-next={gi === filled && !complete} data-filled={gi >= 0 && gi < filled}>{isGap ? '?' : n}</span>
          );
        })}
        <button type="button" className="ad-hear" aria-label="Count it again" title="Count it again" onClick={hear}><Icon name="speaker" /></button>
      </div>
      <div className="ad-chips">
        {options.filter((v) => !used.includes(v)).map((v) => (
          <button key={v} type="button" className="ad-chip" data-bad={bad === v} onClick={() => pick(v)}>{v}</button>
        ))}
      </div>
      {slip && !complete && <Feedback kind="try">{NOT_YET} Count: what number comes next?</Feedback>}
      {complete && <Feedback kind="ok">{round.seq.map(numberWord).join(', ')}.</Feedback>}
      <div className="ad-row">
        <span className="ad-hint-line">Counting {r + 1} of {slide.rounds.length}</span>
        {!last && <button type="button" className="ad-btn ad-btn-primary" disabled={!complete} onClick={next}>Next counting ▸</button>}
      </div>
    </Panel>
  );
}
