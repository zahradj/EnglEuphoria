import { useEffect, useMemo, useState } from 'react';
import { shuffled, useDeck } from '../ctx';
import { Icon } from '../Icon';
import type { ForgeSlide, StreakSlide } from '../types';
import { Feedback, NOT_YET, Panel } from './shared';

const HEAD = ['base', 'past simple', 'past participle'] as const;

/** Trophy Forge: place the three forms in order; a trio becomes a trophy on the board and is said aloud. */
export function ForgeView({ slide }: { slide: ForgeSlide }) {
  const { right, wrong, done, speak, setVars, seed } = useDeck();
  const lead = slide.actors?.[0]?.who ?? 'Vee';
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [bad, setBad] = useState<string | null>(null);
  const [forged, setForged] = useState<string[]>([]);
  const [slip, setSlip] = useState(false);
  const r = slide.rounds[round];
  const finished = round >= slide.rounds.length;
  const tiles = useMemo(() => (r ? shuffled(r.forms, seed + round * 13) : []), [r, seed, round]);
  const complete = !!r && placed.length === 3;
  useEffect(() => {
    if (finished) done();
  }, [finished, done]);
  const board = (
    <ul className="ad-trophies" aria-label={`Trophies: ${forged.length} of ${slide.rounds.length}`}>
      {slide.rounds.map((x, k) => <li key={k} className="ad-trophy" data-on={k < forged.length}>{k < forged.length ? <><Icon name="star" /><span>{x.forms[0]}</span></> : <i />}</li>)}
    </ul>
  );
  if (finished) return <Panel title={slide.prompt} wide variant="glass">{board}<Feedback kind="ok">Every trio is forged. Your trophies are on the board!</Feedback></Panel>;
  const pick = (t: string) => {
    if (complete || placed.includes(t)) return;
    if (t === r.forms[placed.length]) {
      const next = [...placed, t];
      setPlaced(next);
      if (!slip && next.length === 3) right();
      if (next.length === 3) void speak(lead, `${r.forms[0]}, ${r.forms[1]}, ${r.forms[2]}.`);
    } else {
      setSlip(true);
      setBad(t);
      wrong();
      window.setTimeout(() => setBad(null), 380);
    }
  };
  const nextVerb = () => {
    const f = [...forged, r.forms[0]];
    setForged(f);
    setVars({ [slide.id === 'forge' ? 'trophies' : `trophies_${slide.id}`]: f.join(',') });
    setPlaced([]);
    setSlip(false);
    setRound(round + 1);
  };
  return (
    <Panel title={slide.prompt} wide variant="glass">
      {board}
      <div className="ad-forge" role="group" aria-label="Forge the trio">
        {HEAD.map((h, i) => (
          <div key={h} className="ad-forge-slot" data-full={!!placed[i]} data-next={placed.length === i}>
            <small>{h}</small>
            <b>{placed[i] ?? '…'}</b>
          </div>
        ))}
      </div>
      {!complete ? (
        <div className="ad-pk-lane" role="group" aria-label="Choose the next form">
          {tiles.map((t) => <button key={t} type="button" className="ad-pk-tile" data-bad={bad === t} disabled={placed.includes(t)} onClick={() => pick(t)}>{t}</button>)}
        </div>
      ) : (
        <div className="ad-row" style={{ justifyContent: 'center' }}>
          <button type="button" className="ad-btn" onClick={() => void speak(lead, `${r.forms[0]}, ${r.forms[1]}, ${r.forms[2]}.`)}><Icon name="speaker" /> Hear it again</button>
          <button type="button" className="ad-btn ad-btn-primary" onClick={nextVerb}>{round + 1 < slide.rounds.length ? 'Add the trophy, next verb ▸' : 'Add the last trophy ▸'}</button>
        </div>
      )}
      {slip && !complete && <Feedback kind="try">{NOT_YET} Which form comes next?</Feedback>}
      <p className="ad-hint-line">{complete ? 'Now say the three forms out loud, then tap “Say it ✓”.' : `Verb ${round + 1} of ${slide.rounds.length}. Tap the forms in order: base, past simple, past participle.`}</p>
    </Panel>
  );
}

/** Trio streak: the base form is said; pick the past simple, then the past participle. A miss resets the streak and the verb comes again; no timer. */
export function StreakView({ slide }: { slide: StreakSlide }) {
  const { right, wrong, done, speak, setVars, vars, seed } = useDeck();
  const lead = slide.actors?.[0]?.who ?? 'Vee';
  const [i, setI] = useState(0);
  const [step, setStep] = useState<'past' | 'part'>('past');
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [slip, setSlip] = useState(false);
  const [bad, setBad] = useState<string | null>(null);
  const r = slide.rounds[i];
  const finished = i >= slide.rounds.length;
  const options = useMemo(() => (r ? shuffled(step === 'past' ? [r.forms[1], ...r.pastOptions] : [r.forms[2], ...r.partOptions], seed + i * 3 + (step === 'past' ? 0 : 1)) : []), [r, step, seed, i]);
  useEffect(() => {
    if (finished) {
      const prev = Number(vars.bestStreak ?? 0);
      setVars({ bestStreak: String(Math.max(prev, best)), ...(slide.save ? { [slide.save]: String(firstTry) } : {}) });
      done();
    } else if (step === 'past') void speak(lead, r.forms[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, i, step]);
  if (finished) return <Panel title={slide.prompt} wide variant="glass"><Feedback kind="ok">Done! First time right: {firstTry} of {slide.rounds.length}. Your best streak today: {best}.</Feedback></Panel>;
  const pick = (o: string) => {
    const want = step === 'past' ? r.forms[1] : r.forms[2];
    if (o !== want) {
      setBad(o);
      setSlip(true);
      setStreak(0);
      wrong();
      window.setTimeout(() => setBad(null), 380);
      return;
    }
    if (step === 'past') {
      setStep('part');
      return;
    }
    if (!slip) {
      right();
      const s = streak + 1;
      setStreak(s);
      setBest((b) => Math.max(b, s));
      setFirstTry((n) => n + 1);
    }
    void speak(lead, `${r.forms[0]}, ${r.forms[1]}, ${r.forms[2]}.`);
    setSlip(false);
    setStep('past');
    setI(i + 1);
  };
  return (
    <Panel title={slide.prompt} wide variant="glass">
      <div className="ad-streak">
        <span className="ad-streak-n" aria-label={`Streak ${streak}`}>×{streak}</span>
        <button type="button" className="ad-hp-ear" onClick={() => void speak(lead, r.forms[0])} aria-label="Hear it again"><Icon name="speaker" /></button>
        <b className="ad-streak-base">{r.forms[0]}</b>
        <span className="ad-streak-step">{step === 'past' ? 'past simple?' : `past participle? (${r.forms[0]}, ${r.forms[1]}, …)`}</span>
      </div>
      <div className="ad-pk-lane" role="group" aria-label={step === 'past' ? 'Choose the past simple' : 'Choose the past participle'}>
        {options.map((o) => <button key={o} type="button" className="ad-pk-tile" data-bad={bad === o} onClick={() => pick(o)}>{o}</button>)}
      </div>
      {slip && <Feedback kind="try">{NOT_YET} The streak starts again. This verb comes once more.</Feedback>}
      <p className="ad-hint-line">Verb {i + 1} of {slide.rounds.length}. No timer. Beat your own best.</p>
    </Panel>
  );
}
